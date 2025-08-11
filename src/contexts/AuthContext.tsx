import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  roles: string[]; // Dinamik rol isimleri - database'den ne gelirse
  currentRole: UserRole; // Kategorize edilmiş rol
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
  // localStorage'dan cached user'ı oku
  const getCachedUser = (): AuthUser | null => {
    try {
      const cached = localStorage.getItem('cachedAuthUser');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error reading cached user:', error);
      localStorage.removeItem('cachedAuthUser');
    }
    return null;
  };

  const [user, setUser] = useState<AuthUser | null>(getCachedUser());
  const [session, setSession] = useState<Session | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    const cachedUser = getCachedUser();
    return cachedUser?.currentRole || null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const isCreatingUserRef = useRef(false); // Kullanıcı oluşturma flag'i - useRef ile global

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
        // PGRST116 = no rows found - silinmiş kullanıcı veya yeni kullanıcı oluşturma sırasında
        if (profileError.code === 'PGRST116') {
          console.log('👤 Profile not found (deleted user or new user being created):', authUser.email);
        } else {
          console.error('Error fetching profile:', profileError);
        }
        return null;
      }

      // Get user roles from JSONB field - dinamik olarak her rol değerini al
      const roles = Array.isArray(profile.roles) ? profile.roles as string[] : ['kullanici'] as string[];
      
      // Dinamik rol kategorisi belirleme - sadece role değerine bak, isim/koda bakma
      const determineRoleCategory = (userRoles: string[]): UserRole => {
        // Admin kontrolü - en yüksek yetki
        if (userRoles.includes('admin')) return 'admin';
        
        // Temsilci kontrolü
        if (userRoles.includes('temsilci')) return 'temsilci';
        
        // Beyin antrenörü kontrolü
        if (userRoles.includes('beyin_antrenoru')) return 'beyin_antrenoru';
        
        // Kullanıcı kontrolü - varsayılan
        if (userRoles.includes('kullanici')) return 'kullanici';
        
        // Varsayılan (eski kayıtlar için)
        return 'kullanici';
      };
      
      const primaryRole = determineRoleCategory(roles);
      
      // Stored role'ü kontrol et, eğer user'ın rollerinde varsa onu kullan
      const storedRole = localStorage.getItem('currentRole') as UserRole;
      const currentRole = (storedRole && roles.includes(storedRole)) ? storedRole : primaryRole;
      
      // User profile and roles loaded successfully

      const authUserData: AuthUser = {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        avatarUrl: profile.avatar_url,
        isActive: profile.is_active,
        roles,
        currentRole: currentRole
      };

      // User profilini localStorage'a kaydet
      try {
        localStorage.setItem('cachedAuthUser', JSON.stringify(authUserData));
      } catch (error) {
        console.error('Error caching user data:', error);
      }

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
              
              // Sadece gerçek giriş işleminde success mesajı ver
              if (justLoggedIn) {
                toast.success('Başarıyla giriş yapıldı!');
                setJustLoggedIn(false); // Flag'i reset et
              }
            } else {
              // Kullanıcı oluşturma sırasında bu kontrolü atla
              if (!isCreatingUserRef.current) {
                // Profil bulunamadı - muhtemelen silinmiş kullanıcı
                console.log('🚫 User profile not found, signing out user:', session.user.email);
                toast.error('Kullanıcı hesabınız sistemden kaldırılmış. Lütfen yöneticinizle iletişime geçin.');
                await supabase.auth.signOut();
                setUser(null);
                setCurrentRole(null);
                setSession(null);
                setJustLoggedIn(false); // Flag'i reset et
                // localStorage'dan currentRole'ü temizle
                localStorage.removeItem('currentRole');
              } else {
                console.log('👤 Profile not found (new user being created):', session.user.email);
              }
            }
          }, 0);
        } else {
          setUser(null);
          setCurrentRole(null);
          setJustLoggedIn(false); // Çıkış durumunda flag'i reset et
          // localStorage'dan currentRole ve cachedAuthUser'ı temizle
          localStorage.removeItem('currentRole');
          localStorage.removeItem('cachedAuthUser');
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Auth session loaded
      
      setSession(session);
      if (session?.user) {
        // Eğer cached user varsa ve session user ID'si eşleşiyorsa, hızlı yükleme yap
        const cachedUser = getCachedUser();
        if (cachedUser && session.user.email === cachedUser.email) {
          // Cached user'ı kullan, arka planda güncelle
          setUser(cachedUser);
          setCurrentRole(cachedUser.currentRole);
          setIsLoading(false); // Hemen yüklemeyi bitir - flash önlenir!
          
          // Arka planda profili güncelle (sessizce)
          fetchUserProfile(session.user).then(userData => {
            if (userData) {
              setUser(userData);
              setCurrentRole(userData.currentRole);
            } else {
              // Profil bulunamadı - muhtemelen silinmiş kullanıcı
              console.log('🚫 User profile not found, signing out user:', session.user.email);
              toast.error('Kullanıcı hesabınız sistemden kaldırılmış. Lütfen yöneticinizle iletişime geçin.');
              supabase.auth.signOut();
              setUser(null);
              setCurrentRole(null);
              setSession(null);
              localStorage.removeItem('currentRole');
              localStorage.removeItem('cachedAuthUser');
            }
          });
        } else {
          // Cache yok veya eşleşmiyor, normal yükleme yap
          setTimeout(async () => {
            const userData = await fetchUserProfile(session.user);
            if (userData) {
              setUser(userData);
              setCurrentRole(userData.currentRole);
            } else {
              // Profil bulunamadı - muhtemelen silinmiş kullanıcı
              console.log('🚫 User profile not found, signing out user:', session.user.email);
              toast.error('Kullanıcı hesabınız sistemden kaldırılmış. Lütfen yöneticinizle iletişime geçin.');
              await supabase.auth.signOut();
              setUser(null);
              setCurrentRole(null);
              setSession(null);
              setJustLoggedIn(false);
              localStorage.removeItem('currentRole');
              localStorage.removeItem('cachedAuthUser');
            }
            setIsLoading(false);
          }, 0);
        }
      } else {
        setUser(null);
        setCurrentRole(null);
        setSession(null);
        setJustLoggedIn(false);
        // localStorage'dan currentRole ve cachedAuthUser'ı temizle
        localStorage.removeItem('currentRole');
        localStorage.removeItem('cachedAuthUser');
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

      // Başarılı giriş için flag'i set et
      setJustLoggedIn(true);
      return {};
    } catch (error) {
      return { error: 'Giriş yapılırken beklenmeyen bir hata oluştu.' };
    }
  };

  const createUser = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string,
    roles: UserRole[] = ['kullanici']
  ): Promise<{ error?: string }> => {
    // Mevcut session'ı tamamen koru (admin/temsilci/beyin_antrenoru için)
    const currentSession = await supabase.auth.getSession();
    const originalUser = user;
    const originalCurrentRole = currentRole;
    
    try {
      // Kullanıcı oluşturma flag'ini set et
      isCreatingUserRef.current = true;
      console.log('🔄 Creating auth user for:', email);
      console.log('💾 Current session preserved for:', originalUser?.email);
      
      // 1. Supabase Auth'da kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        // Session'ı geri yükle
        if (currentSession.data.session) {
          await supabase.auth.setSession(currentSession.data.session);
          setUser(originalUser);
          setCurrentRole(originalCurrentRole);
        }
        isCreatingUserRef.current = false; // Hata durumunda flag'i resetle
        return { error: authError.message };
      }

      if (!authData.user) {
        console.error('❌ No user returned from auth signup');
        // Session'ı geri yükle
        if (currentSession.data.session) {
          await supabase.auth.setSession(currentSession.data.session);
        }
        isCreatingUserRef.current = false; // Hata durumunda flag'i resetle
        return { error: 'Kullanıcı oluşturulamadı.' };
      }

      console.log('✅ Auth user created:', authData.user.id);

      // HEMEN session'ı geri yükle - yeni kullanıcıya geçmesin!
      if (currentSession.data.session) {
        await supabase.auth.setSession(currentSession.data.session);
        setUser(originalUser);
        setCurrentRole(originalCurrentRole);
        console.log('🔄 Session restored to original user:', originalUser?.email);
      }

      // 2. Current user'ın users tablosundaki ID'sini bul (parent için)
      let currentUserId = null;
      if (user?.id) {
        currentUserId = user.id; // user.id zaten users tablosundaki ID
        console.log('✅ Current user ID alındı, Parent ID:', currentUserId);
      } else {
        console.log('⚠️ Current user yok (bağımsız kullanıcı olacak)');
      }

      // 3. Users tablosuna kullanıcı + roller tek seferde kaydet
      console.log('🔧 Creating user with roles:', roles);
      console.log('🔧 Parent user ID:', currentUserId);
      
      const insertData = {
        auth_user_id: authData.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        roles: roles,                       // JSONB array olarak direk gönder
        supervisor_id: currentUserId       // Kişi bazında hiyerarşi (supervisor_id)
      };
      
      console.log('🔧 Insert data:', insertData);
      
      // INSERT öncesi session kontrol
      const currentSessionCheck = await supabase.auth.getSession();
      console.log('🔍 INSERT öncesi session kontrol:', {
        session_exists: !!currentSessionCheck.data.session,
        user_email: currentSessionCheck.data.session?.user?.email
      });
      
      const { data: newUserData, error: userError } = await supabase
        .from('users')
        .insert(insertData)
        .select('id, roles, supervisor_id')
        .single();

      if (userError) {
        console.error('❌ Users tablosuna kayıt hatası:', userError);
        // Session'ı geri yükle
        if (currentSession.data.session) {
          await supabase.auth.setSession(currentSession.data.session);
          setUser(originalUser);
          setCurrentRole(originalCurrentRole);
        }
        isCreatingUserRef.current = false; // Hata durumunda flag'i resetle
        return { error: 'Kullanıcı profili oluşturulamadı: ' + userError.message };
      }

      if (!newUserData) {
        // Session'ı geri yükle
        if (currentSession.data.session) {
          await supabase.auth.setSession(currentSession.data.session);
          setUser(originalUser);
          setCurrentRole(originalCurrentRole);
        }
        isCreatingUserRef.current = false; // Hata durumunda flag'i resetle
        return { error: 'Kullanıcı ID alınamadı.' };
      }

      console.log('✅ Kullanıcı başarıyla oluşturuldu!', {
        id: newUserData.id,
        roles: newUserData.roles,
        supervisor_id: newUserData.supervisor_id
      });

      // BAŞARI: Orijinal session'ı geri yükle (admin/temsilci/beyin_antrenoru)
      if (currentSession.data.session) {
        console.log('🔄 Restoring original session for:', originalUser?.email);
        await supabase.auth.setSession(currentSession.data.session);
        
        // State'leri direkt güncelle - timing sorununu çöz
        setUser(originalUser);
        setCurrentRole(originalCurrentRole);
        console.log('✅ Original session restored successfully');
      }
      
      // Başarıyla tamamlandı - flag'i resetle
      setTimeout(() => {
        isCreatingUserRef.current = false;
      }, 2000); // 2 saniye bekle
      return {};
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error);
      
      // HATA: Orijinal session'ı geri yükle (admin/temsilci/beyin_antrenoru)
      if (currentSession.data.session) {
        console.log('🔄 Restoring original session after error for:', originalUser?.email);
        await supabase.auth.setSession(currentSession.data.session);
        setUser(originalUser);
        setCurrentRole(originalCurrentRole);
      }
      
      // Hata durumunda flag'i resetle
      isCreatingUserRef.current = false;
      return { error: 'Kullanıcı oluşturulurken beklenmeyen bir hata oluştu.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setCurrentRole(null);
      setJustLoggedIn(false); // Flag'i reset et
      // localStorage'dan currentRole ve cachedAuthUser'ı temizle
      localStorage.removeItem('currentRole');
      localStorage.removeItem('cachedAuthUser');
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
      const updatedUser = { ...user, currentRole: role };
      setCurrentRole(role);
      setUser(updatedUser);
      // Seçilen role'ü ve güncel user'ı localStorage'a kaydet
      localStorage.setItem('currentRole', role);
      try {
        localStorage.setItem('cachedAuthUser', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Error updating cached user:', error);
      }
      toast.success(`Rol değiştirildi: ${role}`);
    } else {
      toast.error('Bu role geçiş yapma yetkiniz yok');
    }
  };

  // Global window function for HTML tests to access user data
  useEffect(() => {
    (window as any).getAuthUser = () => user;
    
    return () => {
      delete (window as any).getAuthUser;
    };
  }, [user]);

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