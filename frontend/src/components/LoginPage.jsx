import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Calculator, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

export default function LoginPage({ onSuccess, onError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError(null);
      // Canjeamos el token de Google por nuestro JWT interno
      const data = await authService.googleLogin(credentialResponse.credential);
      onSuccess(data.access_token);
    } catch (err) {
      console.error('Google Login Error:', err);
      // Check if it's a 403 (User not registered)
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-200 text-center animate-in fade-in zoom-in duration-300">
        
        {/* Logo */}
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-200">
          <Calculator className="text-white w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Bienvenido al Sistema</h1>
        <p className="text-slate-500 mb-6">Inicia sesión para gestionar tus presupuestos</p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2 text-left">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-2.5 rounded-lg hover:bg-primary-700 transition-all shadow-md shadow-primary-200 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Ingresar'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">O ingresa con Google</span>
          </div>
        </div>

        {/* Google Button */}
        <div className="flex justify-center w-full">
            {loading ? (
                <div className="h-10 w-full bg-slate-100 rounded flex items-center justify-center text-slate-400 text-sm">
                    Procesando...
                </div>
            ) : (
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        setError('Error al conectar con Google');
                        if (onError) onError();
                    }}
                    useOneTap={false} // Disabled OneTap to avoid conflicts with form
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width="100%"
                    text="continue_with"
                />
            )}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Sistema de Presupuestos &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
