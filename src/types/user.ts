export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
}

export interface UserContextType {
  user: User | null;
  updateUser: (userData: Partial<User>) => void;
  updateAvatar: (avatarUrl: string) => void;
  logout: () => void;
}