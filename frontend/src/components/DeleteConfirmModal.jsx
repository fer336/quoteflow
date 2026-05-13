import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, budgetId, client }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Eliminar Presupuesto</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            ¿Estás seguro de eliminar el presupuesto{' '}
            <span className="font-bold text-slate-800">{budgetId}</span>
            {client && <> de <span className="font-bold text-slate-800">{client}</span></>}?
          </p>
          <p className="text-xs text-slate-400 mt-2">Esta acción no se puede deshacer.</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-[2] py-2.5 rounded-xl text-white font-bold transition-all text-sm flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600"
          >
            <AlertTriangle size={16} />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
