// Package post
// D-ETCIF-frontend/src/components/student/stage/post/PostStageExam.tsx
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { useState, useEffect, useRef } from "react";
import { getPostExperimentQuestions } from "@/services/experiment";
import { trackPostEvent } from "@/services/tracker";
import { useExperimentStore } from "@/store/experiment.store";
import type { PostExamRaw, PostExamParsed } from "@/types/experimentData";
import { toast } from "@/store";
import eventBus from "@/utils/eventBus";

const getNowTimestamp = () => Date.now();

export default function PostStageExam() {
  const [questions, setQuestions] = useState<PostExamParsed[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const currentExperimentId = useExperimentStore(
    (state) => state.currentExperimentId,
  );
  const sessionStartRef = useRef<number>(0);
  const activeQuestionRef = useRef<{ id: number; startAt: number } | null>(
    null,
  );
  const questionDurationMapRef = useRef<Record<number, number>>({});
  const hasSubmittedRef = useRef(false);

  const getExperimentId = () =>
    currentExperimentId ? currentExperimentId.toString() : "unknown";

  const reportQuestionDwell = (questionId: number, durationMs: number) => {
    if (durationMs > 0) {
      questionDurationMapRef.current[questionId] =
        (questionDurationMapRef.current[questionId] || 0) + durationMs;
    }
    if (durationMs < 300) return;

    trackPostEvent({
      experiment_id: getExperimentId(),
      action_type: "post_quiz_question_dwell",
      score: 0,
      content: `question_id=${questionId};duration_ms=${durationMs}`,
    }).catch(console.error);
  };

  const flushActiveQuestionDwell = () => {
    const active = activeQuestionRef.current;
    if (!active) return;
    const durationMs = getNowTimestamp() - active.startAt;
    reportQuestionDwell(active.id, durationMs);
    activeQuestionRef.current = null;
  };

  const reportSessionDwell = () => {
    const durationMs = getNowTimestamp() - sessionStartRef.current;
    if (durationMs < 300) return;
    trackPostEvent({
      experiment_id: getExperimentId(),
      action_type: "post_quiz_session_dwell",
      score: 0,
      content: `duration_ms=${durationMs}`,
    }).catch(console.error);
  };

  // 初始化加载后端数据
  useEffect(() => {
    sessionStartRef.current = getNowTimestamp();
    getPostExperimentQuestions()
      .then((res) => {
        // 检查响应结构，根据实际返回的数据格式调整
        const rawData: PostExamRaw[] = Array.isArray(res) ? res : [];
        const parsedData: PostExamParsed[] = rawData.map((q) => {
          let options: string[] = [];
          if (q.options) {
            try {
              // 安全解析
              options = JSON.parse(q.options);
            } catch (e) {
              console.error(`题目 ID ${q.id} 解析选项失败:`, e);
              options = []; // 解析失败给个兜底空数组
            }
          }
          return {
            id: q.id,
            question: q.questions,
            answer: q.answer,
            options: options,
          };
        });
        setQuestions(parsedData);

        trackPostEvent({
          experiment_id: getExperimentId(),
          action_type: "post_quiz_enter",
          score: 0,
          content: `question_count=${parsedData.length}`,
        }).catch(console.error);
      })
      .catch(() => toast.error("获取小测题目失败"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      flushActiveQuestionDwell();
      if (!hasSubmittedRef.current) {
        reportSessionDwell();
      }
    };
  }, []);

  // 统一处理答案变更逻辑（包含单选和填空）
  const handleAnswerChange = (qid: number, value: string) => {
    const now = getNowTimestamp();
    const active = activeQuestionRef.current;
    if (!active) {
      activeQuestionRef.current = { id: qid, startAt: now };
    } else if (active.id !== qid) {
      reportQuestionDwell(active.id, now - active.startAt);
      activeQuestionRef.current = { id: qid, startAt: now };
    }

    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  // 提交评分逻辑
  const handleSubmit = () => {
    if (questions.length === 0) return;

    flushActiveQuestionDwell();
    reportSessionDwell();
    hasSubmittedRef.current = true;

    let correctCount = 0;
    const resultDetails: Record<number, boolean> = {};

    questions.forEach((q) => {
      const userAnswer = (answers[q.id] || "").trim();
      const isCorrect = userAnswer === q.answer.trim();
      resultDetails[q.id] = isCorrect;
      if (isCorrect) correctCount++;

      const durationMs = questionDurationMapRef.current[q.id] || 0;
      const answerSafe = userAnswer.replace(/[;\n\r]/g, " ").trim();
      trackPostEvent({
        experiment_id: getExperimentId(),
        action_type: "post_quiz_question_answer",
        score: isCorrect ? 100 : 0,
        content: `question_id=${q.id};is_correct=${isCorrect};duration_ms=${durationMs};answer=${answerSafe}`,
      }).catch(console.error);
    });

    const totalScore = Math.round((correctCount / questions.length) * 100);

    setResults(resultDetails);
    setScore(totalScore);
    toast.success(`提交成功！成绩：${totalScore}分`);

    trackPostEvent({
      experiment_id: getExperimentId(),
      action_type: "post_quiz_submit",
      score: totalScore,
      content: `小测提交：${correctCount}/${questions.length}`,
    }).catch(console.error);

    // 通知系统更新成绩状态
    eventBus.emit("examScoreUpdate", {
      score: totalScore,
      completed: true,
    });
  };

  // 重置考试
  const handleReset = () => {
    activeQuestionRef.current = null;
    questionDurationMapRef.current = {};
    hasSubmittedRef.current = false;
    sessionStartRef.current = getNowTimestamp();
    setAnswers({});
    setScore(null);
    setResults({});
    eventBus.emit("examScoreUpdate", {
      score: null,
      completed: false,
    });
  };

  if (loading) return <Card title="实验小测">加载题目中...</Card>;

  return (
    <Card title="实验小测 - 答题区域">
      <div className="h-[750px] overflow-y-auto pr-2 space-y-6 pb-4">
        {questions.length > 0 ? (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-4 border rounded-lg hover:border-blue-100 transition-colors"
            >
              <h3 className="font-medium text-gray-800 mb-3 flex items-start gap-2">
                <span>{idx + 1}.</span>
                <span className="flex-1">{q.question}</span>
                {results[q.id] !== undefined && (
                  <span
                    className={`text-sm shrink-0 ${
                      results[q.id] ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {results[q.id] ? "✓ 正确" : "✗ 错误"}
                  </span>
                )}
              </h3>

              {/* 渲染选项（单选）或文本域（填空/简答） */}
              {q.options && q.options.length > 0 ? (
                <div className="space-y-2 ml-6">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-start gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="radio"
                        className="mt-1"
                        name={`q${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleAnswerChange(q.id, opt)}
                        disabled={score !== null}
                      />
                      <span className="text-sm text-gray-600">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="ml-6">
                  <textarea
                    className="w-full border border-gray-200 rounded p-3 h-24 resize-none focus:border-blue-400 outline-none transition-all text-sm"
                    placeholder="请输入答案..."
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    disabled={score !== null}
                  />
                </div>
              )}

              {/* 评分后显示正确答案 */}
              {score !== null && (
                <div className="mt-3 ml-6 p-2 bg-gray-50 rounded text-xs text-gray-500 border-l-4 border-blue-400">
                  正确答案：
                  <span className="text-blue-600 font-medium">{q.answer}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400">暂无小测题目</div>
        )}

        {/* 成绩汇总展示 */}
        {score !== null && (
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg text-center animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-blue-700">
              最终成绩：{score} 分
            </h2>
            <p className="text-sm text-blue-500 mt-1">评价已同步至实验报告</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t flex gap-3">
        {score === null ? (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={questions.length === 0}
          >
            提交答案并评分
          </Button>
        ) : (
          <Button variant="primary" onClick={handleReset}>
            重新考试
          </Button>
        )}
        <Button variant="ghost" disabled={score !== null}>
          保存草稿
        </Button>
      </div>
    </Card>
  );
}
