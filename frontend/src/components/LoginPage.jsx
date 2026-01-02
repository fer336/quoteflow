import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Calculator } from 'lucide-react';

export default function LoginPage({ onSuccess, onError }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-200 text-center animate-in fade-in zoom-in duration-300">
        
        {/* Logo */}
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-200">
          <Calculator className="text-white w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Bienvenido al Sistema</h1>
        <p className="text-slate-500 mb-8">Inicia sesión para gestionar tus presupuestos</p>

        {/* Google Button Container */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={credentialResponse => {
              onSuccess(credentialResponse);
            }}
            onError={() => {
              onError();
              console.log('Login Failed');
            }}
            useOneTap
            shape="rectangular"
            theme="filled_blue"
            size="large"
            width="100%"
          />
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Sistema de Presupuestos &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

