export interface User {
  id: number;
  username: string;
  role: string; // "Admin" или "Analyst"
  createdAt: Date;
}