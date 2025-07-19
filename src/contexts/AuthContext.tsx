import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  roles: UserRole[];
  currentRole: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  currentRole: UserRole | null;
  switchRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile and roles
  const fetchUserProfile = async (authUser: User) => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.id);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        return null;
      }

      const roles = userRoles.map(ur => ur.role as UserRole);
      const primaryRole = roles.includes('admin') ? 'admin' : 
                          roles.includes('trainer') ? 'trainer' :
                          roles.includes('representative') ? 'representative' : 'user';

      const authUserData: AuthUser = {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        avatarUrl: profile.avatar_url,
        isActive: profile.is_active,
        roles,
        currentRole: primaryRole
      };

      return authUserData;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile with delay to avoid blocking
          setTimeout(async () => {
            const userData = await fetchUserProfile(session.user);
            if (userData) {
              setUser(userData);
              setCurrentRole(userData.currentRole);
            }
          }, 0);
        } else {
          setUser(null);
          setCurrentRole(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setTimeout(async () => {
          const userData = await fetchUserProfile(session.user);
          if (userData) {
            setUser(userData);
            setCurrentRole(userData.currentRole);
          }
          setIsLoading(false);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Giriş yapılırken beklenmeyen bir hata oluştu.' };
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<{ error?: string }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Kayıt olurken beklenmeyen bir hata oluştu.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setCurrentRole(null);
      toast.success('Başarıyla çıkış yapıldı');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Çıkış yapılırken bir hata oluştu');
    }
  };

  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu.' };
    }
  };

  const switchRole = (role: UserRole) => {
    if (user && user.roles.includes(role)) {
      setCurrentRole(role);
      setUser({ ...user, currentRole: role });
      toast.success(`Rol değiştirildi: ${role}`);
    } else {
      toast.error('Bu role geçiş yapma yetkiniz yok');
    }
  };

  const value: AuthContextType = {
    user,
    session,
    currentRole,
    switchRole,
    login,
    signup,
    logout,
    resetPassword,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}