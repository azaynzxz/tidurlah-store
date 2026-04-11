import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, isAuthenticated, isAdmin, isCashier, authError: contextError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  const from = (location.state as { from?: string })?.from;
  useEffect(() => {
    if (isAuthenticated) {
      const target = from || (isAdmin ? '/admin' : isCashier ? '/cashier' : '/');
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, isAdmin, isCashier, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();

    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: authError } = await signIn(email.trim(), password);
      if (authError) {
        if (authError.message.includes('Invalid login')) {
          setError('Email atau password salah.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Email belum dikonfirmasi. Cek inbox Anda.');
        } else {
          setError(authError.message);
        }
      }
      // Successful login redirected by auth state change → the isAuthenticated check above
    } catch {
      setError('Terjadi kesalahan. Coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-1">
          <img
            src="/product-image/Tidurlah Logo Horizontal.png"
            alt="Tidurlah Grafika"
            className="h-10 mx-auto mb-2"
          />
          <CardTitle className="text-xl">Login Staff</CardTitle>
          <CardDescription>Masuk untuk akses kasir atau admin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || contextError) && (
              <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error || contextError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tidurlah.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#FF5E01] hover:bg-[#FF5E01]/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Masuk...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Hanya untuk staff Tidurlah Grafika
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
