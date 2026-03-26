
export interface FeedbackItem {
  id: number;
  name: string;
  feedbacks?: { id: number; name: string }[];
}