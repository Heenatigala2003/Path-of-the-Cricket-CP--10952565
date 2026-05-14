// app/admin/types.ts
export type Alert = {
  id: number;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  time: string;
};

export type UserActivity = {
  id: number;
  user: string;
  action: string;
  time: string;
  status: 'active' | 'completed' | 'pending';
};

export type StatCard = {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
};

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
};

export type WebsiteStats = {
  sessions: number;
  newUsers: number;
  returningUsers: number;
  registrations: number;
  logins: number;
  posts: number;
  comments: number;
};

export type AdminProfile = {
  name: string;
  role: string;
  email: string;
  avatar: string;
  joinDate: string;
};