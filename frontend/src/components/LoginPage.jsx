import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

export default function LoginPage({ onSuccess, onError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleAccessToken = async (accessToken) => {
    try {
      setError(null);

      if (!accessToken) {
        setError('Google no devolvió una credencial válida. Inténtalo de nuevo.');
        if (onError) onError();
        return;
      }

      setLoading(true);
      const data = await authService.googleLogin(accessToken);
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
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: (tokenResponse) => {
      void handleGoogleAccessToken(tokenResponse?.access_token);
    },
    onError: () => {
      setError('Error al conectar con Google');
      if (onError) onError();
    },
  });

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
    <div className="min-h-screen px-4 py-4 overflow-y-auto" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="max-w-xs w-full mx-auto animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-3">
          <div className="flex justify-center">
            <img
              src="/images/logos/logo.png"
              alt="OctopusFlow Logo"
              className="h-[90px] w-auto object-contain"
            />
          </div>
        </div>

        <div
          className="rounded-xl shadow-md p-4 border"
          style={{
            background: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-border)'
          }}
        >
          <h1 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--color-brand-dark)' }}>
            Iniciar sesión
          </h1>

        {error && (
          <div className="p-3 rounded-lg text-sm mb-6 flex items-center gap-2 text-left" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-3">
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full rounded-lg border px-4 py-2.5 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-brand-blue)', background: 'transparent' }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <span className="text-2xl font-black leading-none" style={{ color: 'var(--color-brand-blue)' }}>
                G
              </span>
            )}
            <span className="font-semibold">Continuar con Google</span>
          </button>
        </div>

        <div className="my-3 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>o</span>
          <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
        </div>

        <form onSubmit={handleEmailLogin} className="rounded-xl border p-3 space-y-3 text-left" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-brand-dark)' }}>
            Ingresar con usuario y contraseña
          </p>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-brand-dark)' }}>
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
            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-brand-dark)' }}>
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
              background: 'var(--color-brand-blue)',
              color: 'white',
              boxShadow: 'none'
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Ingresar'}
          </button>
        </form>

        <p className="mt-3 text-center text-[11px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>
          Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
        </p>

      </div>

      <p className="mt-3 text-center text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
        © {new Date().getFullYear()} OctopusTrack. Todos los derechos reservados.
      </p>
      </div>
    </div>
  );
}
