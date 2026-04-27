import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AlertCircle, Loader2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/api';

export default function LoginPage({ onSuccess, onError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError(null);

      if (!credentialResponse?.credential) {
        setError('Google no devolvió una credencial válida. Inténtalo de nuevo.');
        if (onError) onError();
        return;
      }

      const googleUser = jwtDecode(credentialResponse.credential);
      if (!googleUser?.email) {
        setError('No pudimos identificar el email de la cuenta de Google.');
        if (onError) onError();
        return;
      }

      setLoading(true);
      const data = await authService.googleLogin(credentialResponse.credential);
      onSuccess(data.access_token);
    } catch (err) {
      console.error('Google Login Error:', err);
      if (err.response && err.response.status === 403) {
        setError('Acceso denegado. Tu usuario no está registrado en el sistema.');
      } else if (err.response && err.response.status === 400 && err.response.data.detail === "Usuario inactivo") {
        setError('Tu cuenta está inactiva. Contacta al administrador.');
      } else {
        setError('Error al iniciar sesión con Google.');
      }
      if (onError) onError();
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await authService.login(email, password);
      onSuccess(data.access_token);
    } catch (err) {
      console.error('Login Error:', err);
      if (err.response && err.response.status === 401) {
         setError('Email o contraseña incorrectos.');
      } else if (err.response && err.response.status === 400 && err.response.data.detail === "Inactive user") {
         setError('Tu cuenta está inactiva. Contacta al administrador.');
      } else {
         setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
      if (onError) onError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl text-center animate-in fade-in zoom-in duration-300" style={{ background: 'var(--color-bg-secondary)' }}>
        
        {/* Logo octopus */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-brand-purple), var(--color-brand-lilac))' }}>
          {/* Tentáculo SVG */}
          <svg viewBox="0 0 100 100" className="w-12 h-12 text-white">
            <path d="M50 15c-5 0-10 5-10 10 0 3 2 6 5 8-3 2-5 5-5 8 0 5 5 10 10 10 3 0 6-2 8-5 2 3 5 5 8 5 5 0 10-5 10-10 0-3-2-6-5-8 3-2 5-5 5-8 0-5-5-10-10-10-3 0-6 2-8 5-2-3-5-5-8-5z" fill="currentColor" opacity="0.3"/>
            <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M30 50c-5-15 5-25 10-30M35 55c0-20 10-30 15-35"/>
              <path d="M70 50c5-15-5-25-10-30M65 55c0-20-10-30-15-35"/>
              <path d="M40 65c-10-10-10-25-5-35"/>
              <path d="M60 65c10-10 10-25 5-35"/>
              <ellipse cx="50" cy="60" rx="25" ry="15" fill="currentColor" opacity="0.2"/>
              <circle cx="42" cy="55" r="3" fill="currentColor"/>
              <circle cx="58" cy="55" r="3" fill="currentColor"/>
              <path d="M45 68c3 5 7 5 10 0" stroke="currentColor" fill="none"/>
            </g>
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-brand-black)' }}>
          QuoteFlow
        </h1>
        <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Gestiona presupuestos y propuestas comerciales
        </p>

        {error && (
          <div className="p-3 rounded-lg text-sm mb-6 flex items-center gap-2 text-left" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6 text-left">
          <div>
            <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>
              Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg transition-all outline-none"
              style={{ 
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)'
              }}
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>
              Contraseña
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg transition-all outline-none"
              style={{ 
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)'
              }}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
            style={{ 
              background: 'var(--color-brand-purple)',
              color: 'white',
              boxShadow: '0 4px 14px rgba(92, 58, 140, 0.3)'
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Ingresar'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: '1px solid var(--color-border)' }}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
              O iniciá con Google
            </span>
          </div>
        </div>

        {/* Google Button */}
        <div className="flex justify-center w-full">
            {loading ? (
                <div className="h-10 w-full rounded flex items-center justify-center text-sm" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                    Procesando...
                </div>
            ) : (
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        setError('Error al conectar con Google');
                        if (onError) onError();
                    }}
                    useOneTap={false}
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width="100%"
                    text="continue_with"
                />
            )}
        </div>

        <p className="mt-8 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          QuoteFlow &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}