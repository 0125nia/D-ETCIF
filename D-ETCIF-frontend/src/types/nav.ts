// Package types
// D-ETCIF-frontend/src/types/nav.ts
export type StudentNav = "experiment" | "feedback" | "profile" | "help";
// 教师导航
export type TeacherNav = "dashboard" | "helpManage" | "correct";
export type ActiveNav = StudentNav | TeacherNav;