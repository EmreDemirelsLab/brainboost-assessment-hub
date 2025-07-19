import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, Shield, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const { login, resetPassword } = useAuth();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Reset password state
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const { error } = await login(loginEmail, loginPassword);
      
      if (error) {
        setLoginError(error);
      } else {
        toast.success("Başarıyla giriş yapıldı!");
        navigate("/dashboard");
      }
    } catch (err) {
      setLoginError("Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetError("");

    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        setResetError(error);
      } else {
        setResetSuccess(true);
        toast.success("Şifre sıfırlama e-postası gönderildi!");
      }
    } catch (err) {
      setResetError("E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsResetting(false);
    }
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center">
          <img 
            src="/lovable-uploads/eb89ac73-e0e3-47d9-847f-9fbd6a9b70bb.png" 
            alt="ForTest Logo" 
            className="h-16 mx-auto mb-2"
          />
            <p className="text-muted-foreground">ForBrain Gelişim ve takip Sistemi</p>
          </div>

          {/* Reset Password Card */}
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Şifre Sıfırla</CardTitle>
              <CardDescription>
                E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetSuccess ? (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-success mx-auto" />
                  <p className="text-success font-medium">
                    Şifre sıfırlama e-postası gönderildi!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    E-posta kutunuzu kontrol edin ve talimatları izleyin.
                  </p>
                  <Button variant="outline" onClick={() => setShowResetForm(false)}>
                    Giriş sayfasına dön
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {resetError && (
                    <Alert variant="destructive">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>{resetError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">E-posta Adresi</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="ornek@forbrainacademy.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button type="submit" className="w-full" disabled={isResetting}>
                      {isResetting ? "Gönderiliyor..." : "Şifre Sıfırlama E-postası Gönder"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowResetForm(false)}
                    >
                      Geri
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img 
            src="/lovable-uploads/eb89ac73-e0e3-47d9-847f-9fbd6a9b70bb.png" 
            alt="ForTest Logo" 
            className="h-16 mx-auto mb-2"
          />
          <p className="text-muted-foreground">ForBrain Gelişim ve takip Sistemi</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Giriş Yap</CardTitle>
            <CardDescription>
              Hesabınıza giriş yaparak devam edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="loginEmail">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="ornek@forbrainacademy.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginPassword">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="loginPassword"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Şifrenizi girin"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button 
                className="text-sm text-primary hover:underline font-medium"
                onClick={() => setShowResetForm(true)}
              >
                Şifrenizi mi unuttunuz?
              </button>
            </div>
          </CardContent>
        </Card>


        {/* Footer */}
        <div className="text-center pt-8">
          <div className="h-1 bg-primary rounded-full mb-4 mx-auto max-w-32"></div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>+90 212 351 32 12</div>
            <div>forbrain@forbrainacademy.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}