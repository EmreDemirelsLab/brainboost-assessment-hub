import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';
import { 
  validateEmail, 
  validatePassword, 
  sanitizeInput, 
  authRateLimiter, 
  validateSession,
  logSecurityEvent 
} from '@/lib/security';

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
  createUser: (email: string, password: string, firstName: string, lastName: string, roles: UserRole[]) => Promise<{ error?: string }>;
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
      // Get user profile from users table
      const { data: profile, error: profileError } = await (supabase as any)
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

      // Use both original columns and ad_soyad as fallback
      const firstName = profile.first_name || (profile?.ad_soyad || '').split(' ')[0] || '';
      const lastName = profile.last_name || (profile?.ad_soyad || '').split(' ').slice(1).join(' ') || '';

      const authUserData: AuthUser = {
        id: profile.id,
        email: profile.email,
        firstName: firstName,
        lastName: lastName,
        phone: profile.phone || null,
        avatarUrl: profile.avatar_url || null,
        isActive: profile.is_active !== false, // Default to true if not specified
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
      // Input validation and sanitization
      const cleanEmail = sanitizeInput(email?.toLowerCase() || '');
      
      if (!validateEmail(cleanEmail)) {
        logSecurityEvent({
          action: 'invalid_login_email',
          details: { email: cleanEmail },
          severity: 'medium'
        });
        return { error: 'Geçerli bir e-posta adresi girin.' };
      }

      if (!password || password.length < 6) {
        return { error: 'Şifre en az 6 karakter olmalıdır.' };
      }

      // Rate limiting
      if (!authRateLimiter.canAttempt(cleanEmail)) {
        const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(cleanEmail) / (1000 * 60));
        logSecurityEvent({
          action: 'rate_limit_exceeded',
          details: { email: cleanEmail },
          severity: 'high'
        });
        return { error: `Çok fazla deneme yapıldı. ${remainingTime} dakika sonra tekrar deneyin.` };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        logSecurityEvent({
          action: 'login_failed',
          details: { email: cleanEmail, error: error.message },
          severity: 'medium'
        });
        return { error: error.message };
      }

      logSecurityEvent({
        action: 'login_success',
        details: { email: cleanEmail },
        severity: 'low'
      });

      return {};
    } catch (error) {
      logSecurityEvent({
        action: 'login_error',
        details: { error: String(error) },
        severity: 'high'
      });
      return { error: 'Giriş yapılırken beklenmeyen bir hata oluştu.' };
    }
  };

  const createUser = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string,
    roles: UserRole[] = ['user']
  ): Promise<{ error?: string }> => {
    try {
      // Input validation and sanitization
      const cleanEmail = sanitizeInput(email?.toLowerCase() || '');
      const cleanFirstName = sanitizeInput(firstName || '');
      const cleanLastName = sanitizeInput(lastName || '');
      
      if (!validateEmail(cleanEmail)) {
        return { error: 'Geçerli bir e-posta adresi girin.' };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { error: passwordValidation.errors.join(', ') };
      }

      if (!cleanFirstName || cleanFirstName.length < 2) {
        return { error: 'Ad en az 2 karakter olmalıdır.' };
      }

      if (!cleanLastName || cleanLastName.length < 2) {
        return { error: 'Soyad en az 2 karakter olmalıdır.' };
      }

      // Rate limiting for user creation
      if (!authRateLimiter.canAttempt(`signup_${cleanEmail}`)) {
        logSecurityEvent({
          action: 'signup_rate_limit_exceeded',
          details: { email: cleanEmail },
          severity: 'high'
        });
        return { error: 'Çok fazla kayıt denemesi yapıldı. Lütfen daha sonra tekrar deneyin.' };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
          }
        }
      });

      if (error) {
        logSecurityEvent({
          action: 'signup_failed',
          details: { email: cleanEmail, error: error.message },
          severity: 'medium'
        });
        return { error: error.message };
      }

      logSecurityEvent({
        action: 'signup_success',
        details: { email: cleanEmail },
        severity: 'low'
      });

      return {};
    } catch (error) {
      logSecurityEvent({
        action: 'signup_error',
        details: { error: String(error) },
        severity: 'high'
      });
      return { error: 'Kullanıcı oluşturulurken beklenmeyen bir hata oluştu.' };
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
      // Input validation and sanitization
      const cleanEmail = sanitizeInput(email?.toLowerCase() || '');
      
      if (!validateEmail(cleanEmail)) {
        return { error: 'Geçerli bir e-posta adresi girin.' };
      }

      // Rate limiting for password reset
      if (!authRateLimiter.canAttempt(`reset_${cleanEmail}`)) {
        logSecurityEvent({
          action: 'password_reset_rate_limit_exceeded',
          details: { email: cleanEmail },
          severity: 'medium'
        });
        return { error: 'Çok fazla şifre sıfırlama denemesi yapıldı. Lütfen daha sonra tekrar deneyin.' };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        logSecurityEvent({
          action: 'password_reset_failed',
          details: { email: cleanEmail, error: error.message },
          severity: 'medium'
        });
        return { error: error.message };
      }

      logSecurityEvent({
        action: 'password_reset_requested',
        details: { email: cleanEmail },
        severity: 'low'
      });

      return {};
    } catch (error) {
      logSecurityEvent({
        action: 'password_reset_error',
        details: { error: String(error) },
        severity: 'high'
      });
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
    createUser,
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