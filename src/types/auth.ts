export type UserRole = 'admin' | 'temsilci' | 'beyin_antrenoru' | 'kullanici';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  currentRole: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  currentRole: UserRole | null;
  switchRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}