import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  
  const styles = {
    'Aceptado': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Pendiente': 'bg-amber-100 text-amber-700 border-amber-200',
    'Rechazado': 'bg-rose-100 text-rose-700 border-rose-200',
  };
  
  const icons = {
    'Aceptado': <CheckCircle2 size={12} />,
    'Pendiente': <Clock size={12} />,
    'Rechazado': <AlertCircle size={12} />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[normalizedStatus] || styles['Pendiente']}`}>
      {icons[normalizedStatus] || icons['Pendiente']}
      {normalizedStatus}
    </span>
  );
}

