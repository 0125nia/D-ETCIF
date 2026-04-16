// Package service
// D-ETCIF-backend/internal/service/path_suggestion.go
package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type knowledgePointSuggestion struct {
	ID   string
	Name string
	Desc string
	Code string
}

type strategySuggestion struct {
	Title         string
	Content       string
	CodeSnippet   string
	KnowledgeLink string
}

func buildStrategySuggestion(ctx context.Context, log *model.ExecutionLog) (*strategySuggestion, error) {
	if log == nil {
		return nil, errors.New("nil log")
	}
	studentID := strings.TrimSpace(log.StudentID)
	experimentID := strings.TrimSpace(log.ExperimentID)
	if studentID == "" {
		return nil, errors.New("missing student_id")
	}
	if experimentID == "" {
		return nil, errors.New("missing experiment_id")
	}

	// 1) 由 experiment_id 从 Neo4j 拉取“该实验关联知识点”候选集
	candidates, err := queryExperimentKnowledgePoints(ctx, experimentID, 50)
	if err != nil {
		return nil, err
	}
	if len(candidates) == 0 {
		return nil, errors.New("no knowledge points for experiment")
	}

	// 2) 用 cell_content/error 启发式推断“当前卡壳知识点”
	current := pickMostRelevantKnowledgePoint(candidates, log.CellContent, log.Error)
	kpID := current.ID
	kpName := current.Name

	prereqs, err := queryMissingPrerequisites(ctx, studentID, kpID, kpName, 3)
	if err == nil && len(prereqs) > 0 {
		names := make([]string, 0, len(prereqs))
		for _, p := range prereqs {
			if p.Name != "" {
				names = append(names, p.Name)
			}
		}
		content := fmt.Sprintf("检测到你在当前步骤出现多次失败（实验 %s）。结合你当前代码与错误信息，系统推断你卡在知识点「%s」。建议优先补全前置知识点：%s。", experimentID, kpName, strings.Join(names, "、"))
		code := prereqs[0].Code
		if code == "" {
			code = "# 建议先回顾前置知识点的示例代码/模板，再回到当前任务"
		}
		return &strategySuggestion{
			Title:         "路径建议：补全前置依赖",
			Content:       content,
			CodeSnippet:   code,
			KnowledgeLink: fmt.Sprintf("/student/profile?kp=%s", prereqs[0].Name),
		}, nil
	}

	// 如果图里有“班级常用成功路径”类型的边（如 NEXT/SUCCESS_PATH），尝试给出一步式建议。
	steps, err2 := queryClassBestNextSteps(ctx, kpID, kpName, 4)
	if err2 == nil && len(steps) > 0 {
		content := fmt.Sprintf("检测到你在当前步骤出现多次失败（实验 %s）。结合你当前代码与错误信息，系统推断你卡在知识点「%s」。可参考班级常用成功推进路径：%s。", experimentID, kpName, strings.Join(steps, " → "))
		return &strategySuggestion{
			Title:         "路径建议：班级常用成功路径",
			Content:       content,
			CodeSnippet:   "# 参考路径仅用于引导：请按实验指导书逐步实现并自测",
			KnowledgeLink: fmt.Sprintf("/student/profile?kp=%s", kpName),
		}, nil
	}

	if err != nil {
		return nil, err
	}
	return nil, errors.New("no suggestion")
}

func pickMostRelevantKnowledgePoint(candidates []knowledgePointSuggestion, cellContent, errMsg string) knowledgePointSuggestion {
	text := strings.ToLower(cellContent + "\n" + errMsg)
	best := candidates[0]
	bestScore := -1
	for _, kp := range candidates {
		name := strings.TrimSpace(kp.Name)
		if name == "" {
			continue
		}
		score := 0
		nameLower := strings.ToLower(name)
		if strings.Contains(text, nameLower) {
			score += 10
		}
		// 轻量加分：如果知识点带有 code/template 且在当前 Cell 里出现关键片段（非常粗略）。
		codeLower := strings.ToLower(strings.TrimSpace(kp.Code))
		if codeLower != "" {
			// 只取前 40 个字符做弱匹配，避免长串比较。
			prefix := codeLower
			if len(prefix) > 40 {
				prefix = prefix[:40]
			}
			if prefix != "" && strings.Contains(text, prefix) {
				score += 2
			}
		}
		if score > bestScore {
			bestScore = score
			best = kp
		}
	}
	return best
}

func queryExperimentKnowledgePoints(ctx context.Context, experimentID string, limit int) ([]knowledgePointSuggestion, error) {
	if config.Neo4jDriver == nil {
		return nil, errors.New("neo4j driver not initialized")
	}
	if strings.TrimSpace(experimentID) == "" {
		return nil, errors.New("missing experiment_id")
	}
	if limit <= 0 {
		limit = 50
	}

	// 兼容不同图谱建模：
	// 1) 知识点节点直接带 experiment_id 属性
	// 2) (Experiment/实验) -[包含/关联]-> (KnowledgePoint/知识点)
	expRelTypes := []string{"HAS_KP", "HAS_KNOWLEDGE_POINT", "CONTAINS", "包含", "关联", "属于"}

	query := `
CALL {
  WITH $experimentId AS expId
  MATCH (kp)
  WHERE (kp:KnowledgePoint OR kp:知识点)
    AND (kp.experiment_id = expId OR kp.experimentId = expId OR kp.exp_id = expId)
  RETURN kp

  UNION

  WITH $experimentId AS expId
  MATCH (e)
  WHERE (e:Experiment OR e:实验)
    AND (e.id = expId OR e.experiment_id = expId OR e.experimentId = expId OR e.name = expId)
  MATCH (e)-[r]->(kp)
  WHERE type(r) IN $expRelTypes AND (kp:KnowledgePoint OR kp:知识点)
  RETURN kp
}
RETURN DISTINCT
  coalesce(toString(kp.id), toString(kp.kp_id), kp.name) AS id,
  kp.name AS name,
  coalesce(kp.desc, kp.description, '') AS desc,
  coalesce(kp.code, kp.template, '') AS code
ORDER BY name
LIMIT $limit
`

	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	session := config.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	params := map[string]any{
		"experimentId": experimentID,
		"expRelTypes":  expRelTypes,
		"limit":        limit,
	}

	result, err := session.Run(ctx, query, params)
	if err != nil {
		return nil, err
	}

	var out []knowledgePointSuggestion
	for result.Next(ctx) {
		record := result.Record()
		id, _ := record.Get("id")
		name, _ := record.Get("name")
		desc, _ := record.Get("desc")
		code, _ := record.Get("code")
		out = append(out, knowledgePointSuggestion{
			ID:   fmt.Sprint(id),
			Name: fmt.Sprint(name),
			Desc: fmt.Sprint(desc),
			Code: fmt.Sprint(code),
		})
	}
	if err := result.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

func queryMissingPrerequisites(ctx context.Context, studentID, kpID, kpName string, limit int) ([]knowledgePointSuggestion, error) {
	if config.Neo4jDriver == nil {
		return nil, errors.New("neo4j driver not initialized")
	}
	if limit <= 0 {
		limit = 3
	}

	// 兼容两套图谱命名：KnowledgePoint/Student 与 知识点/学生；以及多种前置关系命名。
	relTypes := []string{
		"PREREQ", "PRE", "REQUIRES", "DEPENDS_ON", "PRECEDES",
		"先修", "前置", "依赖", "需要",
	}
	masteredRelTypes := []string{"MASTERED", "掌握", "CONFIDENCE", "置信", "WEIGHT", "权重"}

	// 说明：
	// - label/relationship type 不能参数化，所以这里用 OR + type(r) IN $relTypes 的方式兼容。
	// - 置信度/权重字段不同实现可能不同，这里取 weight/confidence 两者之一。
	query := `
MATCH (kp)
WHERE (kp:KnowledgePoint OR kp:知识点)
  AND (
    ($kpId <> '' AND (kp.id = $kpId OR kp.kp_id = $kpId))
    OR
    ($kpName <> '' AND kp.name = $kpName)
  )
WITH kp
MATCH (pre)
WHERE (pre:KnowledgePoint OR pre:知识点)
MATCH (pre)-[r]-(kp)
WHERE type(r) IN $relTypes
WITH DISTINCT pre
OPTIONAL MATCH (s)
WHERE (s:Student OR s:学生) AND (s.id = $studentId OR s.student_id = $studentId OR s.name = $studentId)
OPTIONAL MATCH (s)-[m]->(pre)
WHERE type(m) IN $masteredRelTypes
WITH pre, max(coalesce(m.weight, m.confidence, 0.0)) AS mastery
WHERE mastery < $masteredThreshold
RETURN
  coalesce(toString(pre.id), toString(pre.kp_id), pre.name) AS id,
  pre.name AS name,
  coalesce(pre.desc, pre.description, '') AS desc,
  coalesce(pre.code, pre.template, '') AS code,
  mastery AS mastery
ORDER BY mastery ASC
LIMIT $limit
`

	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	session := config.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	params := map[string]any{
		"studentId":         studentID,
		"kpId":              kpID,
		"kpName":            kpName,
		"relTypes":          relTypes,
		"masteredRelTypes":  masteredRelTypes,
		"masteredThreshold": 0.6,
		"limit":             limit,
	}

	result, err := session.Run(ctx, query, params)
	if err != nil {
		return nil, err
	}

	var out []knowledgePointSuggestion
	for result.Next(ctx) {
		record := result.Record()
		id, _ := record.Get("id")
		name, _ := record.Get("name")
		desc, _ := record.Get("desc")
		code, _ := record.Get("code")
		out = append(out, knowledgePointSuggestion{
			ID:   fmt.Sprint(id),
			Name: fmt.Sprint(name),
			Desc: fmt.Sprint(desc),
			Code: fmt.Sprint(code),
		})
	}
	if err := result.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

func queryClassBestNextSteps(ctx context.Context, kpID, kpName string, maxDepth int) ([]string, error) {
	if config.Neo4jDriver == nil {
		return nil, errors.New("neo4j driver not initialized")
	}
	if maxDepth <= 0 {
		maxDepth = 4
	}

	pathRelTypes := []string{"NEXT", "SUCCESS_PATH", "PATH", "下一步", "成功路径"}

	// 尝试从“步骤转移边”中找一条最高累计 count 的路径。
	query := fmt.Sprintf(`
MATCH (kp)
WHERE (kp:KnowledgePoint OR kp:知识点)
  AND (
    ($kpId <> '' AND (kp.id = $kpId OR kp.kp_id = $kpId))
    OR
    ($kpName <> '' AND kp.name = $kpName)
  )
CALL {
  WITH kp
  MATCH p = (kp)-[rels*1..%d]->(n)
  WHERE all(r IN rels WHERE type(r) IN $pathRelTypes)
  WITH p, reduce(s=0.0, r IN rels | s + coalesce(r.count, 0.0)) AS score
  RETURN p AS bestPath
  ORDER BY score DESC
  LIMIT 1
}
RETURN [x IN nodes(bestPath) | x.name] AS steps
LIMIT 1
`, maxDepth)

	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	session := config.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	params := map[string]any{
		"kpId":         kpID,
		"kpName":       kpName,
		"pathRelTypes": pathRelTypes,
	}

	result, err := session.Run(ctx, query, params)
	if err != nil {
		return nil, err
	}
	if !result.Next(ctx) {
		if err := result.Err(); err != nil {
			return nil, err
		}
		return nil, errors.New("no path")
	}
	record := result.Record()
	stepsAny, ok := record.Get("steps")
	if !ok {
		return nil, errors.New("missing steps")
	}

	// steps 是 []any
	arr, ok := stepsAny.([]any)
	if !ok {
		return nil, errors.New("invalid steps type")
	}
	steps := make([]string, 0, len(arr))
	for _, v := range arr {
		s := strings.TrimSpace(fmt.Sprint(v))
		if s != "" {
			steps = append(steps, s)
		}
	}
	if len(steps) == 0 {
		return nil, errors.New("empty path")
	}
	return steps, nil
}

type WeakPointResource struct {
	KnowledgePoint string   `json:"knowledge_point"`
	Mastery        float64  `json:"mastery"`
	Resources      []string `json:"resources"`
}

func QueryWeakPointsAndResources(ctx context.Context, studentID string, threshold float64, limit int) ([]WeakPointResource, error) {
	if config.Neo4jDriver == nil {
		return nil, errors.New("neo4j driver not initialized")
	}
	if limit <= 0 {
		limit = 5
	}

	query := `
	MATCH (s) WHERE (s:Student OR s:学生) AND (s.id = $studentId OR s.student_id = $studentId OR s.name = $studentId)
	MATCH (s)-[m]->(kp)
	WHERE (kp:KnowledgePoint OR kp:知识点) AND type(m) IN ['MASTERED', '掌握', 'CONFIDENCE', '置信', 'WEIGHT', '权重']
	WITH kp, coalesce(m.weight, m.confidence, 0.0) AS mastery
	WHERE mastery < $threshold
	ORDER BY mastery ASC
	LIMIT $limit
	OPTIONAL MATCH (kp)-[r]->(res)
	WHERE type(r) IN ['HAS_EXAMPLE', 'PROVIDES', 'CONTAINS', '有', '提供', '包含'] AND NOT (res:KnowledgePoint OR res:知识点)
	RETURN kp.name AS kpName, mastery, collect(res.name) AS resources
	`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	session := config.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	params := map[string]any{
		"studentId": studentID,
		"threshold": threshold,
		"limit":     limit,
	}

	result, err := session.Run(ctx, query, params)
	if err != nil {
		return nil, err
	}

	var out []WeakPointResource
	for result.Next(ctx) {
		record := result.Record()
		kpName, _ := record.Get("kpName")
		mastery, _ := record.Get("mastery")
		resAny, _ := record.Get("resources")

		var resources []string
		if resArr, ok := resAny.([]any); ok {
			for _, v := range resArr {
				if v != nil {
					resources = append(resources, fmt.Sprint(v))
				}
			}
		}

		mVal := 0.0
		switch v := mastery.(type) {
		case float64:
			mVal = v
		case int64:
			mVal = float64(v)
		}

		out = append(out, WeakPointResource{
			KnowledgePoint: fmt.Sprint(kpName),
			Mastery:        mVal,
			Resources:      resources,
		})
	}
	if err := result.Err(); err != nil {
		return nil, err
	}
	return out, nil
}
