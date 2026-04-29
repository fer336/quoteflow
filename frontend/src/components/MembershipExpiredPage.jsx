import React from 'react';

export default function MembershipExpiredPage({ onBackToLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="max-w-md w-full rounded-xl border p-6 text-center" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-brand-dark)' }}>
          Membresía vencida
        </h1>
        <p className="mb-5" style={{ color: 'var(--color-text-secondary)' }}>
          Tu membresía ha expirado. Para continuar, realizá tu pago.
        </p>

        <div className="rounded-lg border border-dashed p-4 mb-4" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Espacio reservado para checkout
          </p>
          <pre className="text-xs mt-2 text-left overflow-x-auto" style={{ color: 'var(--color-text-muted)' }}>
{`// TODO: integrar flujo MercadoPago via n8n webhook`}
          </pre>
        </div>

        <button
          onClick={onBackToLogin}
          className="w-full rounded-lg py-2.5 font-semibold"
          style={{ background: 'var(--color-brand-blue)', color: '#fff' }}
        >
          Volver al login
        </button>
      </div>
    </div>
  );
}
