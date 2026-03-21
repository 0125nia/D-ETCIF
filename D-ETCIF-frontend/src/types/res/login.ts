export interface LoginRes {
  token: string;
  user: {
    id: number;
    name: string;
    role: number;
  };
}
