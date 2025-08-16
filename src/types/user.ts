export type UserRole = 'user' | 'admin';

export interface Group {
  id?: string;
  name: string;
  members: string[]; // userIds
}

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  groupIds: string[];
}
