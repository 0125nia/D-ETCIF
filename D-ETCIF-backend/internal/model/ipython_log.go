package model

type ExecutionLog struct {
	StudentID      string `json:"student_id"`
	ExperimentID   string `json:"experiment_id"`
	CellContent    string `json:"cell_content"`
	ExecutionCount int    `json:"execution_count"`
	Success        bool   `json:"success"`
	Error          string `json:"error"`
}
