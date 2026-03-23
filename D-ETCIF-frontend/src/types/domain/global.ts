export type UserRole = "student" | "teacher";
// 学生实验阶段
export type Stage = "PRE" | "DOING" | "POST";
// 学生导航
export type StudentNav = "experiment" | "feedback" | "profile" | "help";
// 教师导航
export type TeacherNav = "dashboard" | "helpManage";
export type ActiveNav = StudentNav | TeacherNav;
