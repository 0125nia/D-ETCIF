package service

import (
	"fmt"
	"sort"
	"strconv"

	"D-ETCIF-backend/internal/model"

	"gorm.io/gorm"
)

type FeedbackRecordService struct {
	db *gorm.DB
}

type FeedbackView struct {
	ID            string `json:"id"`
	Type          string `json:"type"`
	Title         string `json:"title"`
	Content       string `json:"content"`
	Severity      string `json:"severity"`
	CreatedAt     int64  `json:"createdAt"`
	CodeSnippet   string `json:"codeSnippet,omitempty"`
	KnowledgeLink string `json:"knowledgeLink,omitempty"`
}

type FeedbackExperimentGroup struct {
	ID        int64          `json:"id"`
	Name      string         `json:"name"`
	Feedbacks []FeedbackView `json:"feedbacks"`
}

func NewFeedbackRecordService(db *gorm.DB) *FeedbackRecordService {
	return &FeedbackRecordService{db: db}
}

func (s *FeedbackRecordService) Create(record *model.FeedbackRecord) error {
	if s == nil || s.db == nil || record == nil {
		return fmt.Errorf("feedback repository not ready")
	}
	
	// 对于实验总结类型的反馈记录，确保每个用户每个实验只有一个
	if record.FeedbackType == "长期补救" && record.Title == "实验总结：薄弱点与资源推荐" {
		var existingRecord model.FeedbackRecord
		err := s.db.Where("student_id = ? AND experiment_id = ? AND feedback_type = ?", 
			record.StudentID, record.ExperimentID, record.FeedbackType).First(&existingRecord).Error
		
		switch err {
		case nil:
			// 已存在相同记录，更新它
			existingRecord.Content = record.Content
			existingRecord.Severity = record.Severity
			existingRecord.WSFeedbackType = record.WSFeedbackType
			existingRecord.Level = record.Level
			existingRecord.Display = record.Display
			existingRecord.Stage = record.Stage
			existingRecord.EventKind = record.EventKind
			existingRecord.ActionType = record.ActionType
			existingRecord.UpdatedAt = record.UpdatedAt
			return s.db.Save(&existingRecord).Error
		case gorm.ErrRecordNotFound:
			// 不存在记录，创建新的
			return s.db.Create(record).Error
		default:
			// 其他错误
			return err
		}
	}
	
	// 对于其他类型的反馈记录，直接创建
	return s.db.Create(record).Error
}

func (s *FeedbackRecordService) ListByStudent(studentID string) ([]model.FeedbackRecord, error) {
	if s == nil || s.db == nil {
		return nil, fmt.Errorf("feedback repository not ready")
	}

	var rows []model.FeedbackRecord
	err := s.db.Where("student_id = ?", studentID).Order("created_at DESC").Find(&rows).Error
	if err != nil {
		return nil, err
	}
	return rows, nil
}

func BuildFeedbackExperimentGroups(rows []model.FeedbackRecord) []FeedbackExperimentGroup {
	if len(rows) == 0 {
		return []FeedbackExperimentGroup{}
	}

	groups := make(map[string]*FeedbackExperimentGroup)
	order := make([]string, 0)

	for _, row := range rows {
		expKey := row.ExperimentID
		g, exists := groups[expKey]
		if !exists {
			expNumericID, _ := strconv.ParseInt(expKey, 10, 64)
			g = &FeedbackExperimentGroup{
				ID:        expNumericID,
				Name:      fmt.Sprintf("实验 %s", expKey),
				Feedbacks: []FeedbackView{},
			}
			groups[expKey] = g
			order = append(order, expKey)
		}

		g.Feedbacks = append(g.Feedbacks, FeedbackView{
			ID:            strconv.FormatInt(row.ID, 10),
			Type:          row.FeedbackType,
			Title:         row.Title,
			Content:       row.Content,
			Severity:      row.Severity,
			CreatedAt:     row.CreatedAt,
			CodeSnippet:   row.CodeSnippet,
			KnowledgeLink: row.KnowledgeLink,
		})
	}

	out := make([]FeedbackExperimentGroup, 0, len(groups))
	for _, key := range order {
		g := groups[key]
		sort.Slice(g.Feedbacks, func(i, j int) bool {
			return g.Feedbacks[i].CreatedAt > g.Feedbacks[j].CreatedAt
		})
		out = append(out, *g)
	}

	sort.Slice(out, func(i, j int) bool {
		left := int64(0)
		right := int64(0)
		if len(out[i].Feedbacks) > 0 {
			left = out[i].Feedbacks[0].CreatedAt
		}
		if len(out[j].Feedbacks) > 0 {
			right = out[j].Feedbacks[0].CreatedAt
		}
		return left > right
	})

	return out
}
