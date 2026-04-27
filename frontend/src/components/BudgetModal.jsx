import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  X, 
  CheckCircle2, 
  Trash2,
  AlertCircle,
  Edit3,
  Search,
  User,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { clientService } from '../services/api';

export default function BudgetModal({ isOpen, onClose, onSubmit, initialData }) {
  const [client, setClient] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validity, setValidity] = useState('15 días');
  const [status, setStatus] = useState('Pendiente');
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualTotal, setManualTotal] = useState(0);
  const [items, setItems] = useState([{ id: crypto.randomUUID(), description: '', amount: 0 }]);
  
  // Clients Logic
  const [clients, setClients] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadClients();
      if (initialData) {
        // Load data for editing
        setClient(initialData.client);
        setDate(new Date(initialData.date).toISOString().split('T')[0]);
        setValidity(initialData.validity || '15 días');
        setStatus(initialData.status);
        setIsManualMode(initialData.is_manual_total === 1);
        setManualTotal(initialData.total);
        
        // Transform items from API format to internal format
        if (initialData.items && initialData.items.length > 0) {
          setItems(initialData.items.map(i => ({
            id: crypto.randomUUID(), // New temp ID for frontend management
            description: i.description,
            amount: i.amount
          })));
        } else {
          setItems([{ id: crypto.randomUUID(), description: '', amount: 0 }]);
        }
      } else {
        // Reset form for new budget
        setClient('');
        setDate(new Date().toISOString().split('T')[0]);
        setValidity('15 días');
        setStatus('Pendiente');
        setIsManualMode(false);
        setManualTotal(0);
        setItems([{ id: crypto.randomUUID(), description: '', amount: 0 }]);
      }
    }
  }, [isOpen, initialData]);

  const loadClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(client.toLowerCase())
  );

  // Handle adding new rows
  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: '', amount: 0 }]);
  };

  // Handle removing rows
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const moveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setItems(reordered);
  };

  // Update item field
  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Derived state: Automatic Sum
  const autoTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }, [items]);

  // Final Total logic based on mode
  const finalTotal = isManualMode ? manualTotal : autoTotal;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!client) return;
    
    const budgetData = {
      client,
      date: new Date(date).toISOString(),
      validity,
      status: initialData ? status : undefined, // Only send status on update
      is_manual_total: isManualMode ? 1 : 0,
      total: isManualMode ? parseFloat(manualTotal) : undefined,
      items: items.map((item, index) => ({
        description: item.description,
        amount: parseFloat(item.amount) || 0,
        order_index: index
      }))
    };
    
    onSubmit(budgetData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm">
      <div className="flex min-h-full items-stretch justify-center p-0 md:items-center md:p-6">
        <form 
          onSubmit={handleSubmit}
          data-tour="budget-modal"
          className="bg-white w-full min-h-screen shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col md:min-h-0 md:max-w-3xl md:my-auto md:max-h-[calc(100dvh-3rem)] md:rounded-2xl"
        >
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 className="text-primary-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">
              {initialData ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
            </h2>
          </div>
          <button onClick={onClose} type="button" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {/* Top Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-1 relative" data-tour="budget-form-client">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cliente</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  placeholder="Buscar o crear..." 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  value={client}
                  onChange={(e) => {
                    setClient(e.target.value);
                    setShowClientDropdown(true);
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  {showClientDropdown ? <Search size={14} /> : <User size={14} />}
                </div>
              </div>
              
              {/* Clients Dropdown */}
              {showClientDropdown && client.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((c) => (
                      <div 
                        key={c.id}
                        className="px-4 py-2 hover:bg-primary-50 cursor-pointer text-sm text-slate-700 flex items-center gap-2"
                        onClick={() => {
                          setClient(c.name);
                          setShowClientDropdown(false);
                        }}
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        {c.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-xs text-slate-400 italic">
                      Presiona enter para usar "{client}"
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Fecha</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Validez</label>
              <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
              >
                <option>7 días</option>
                <option>15 días</option>
                <option>30 días</option>
              </select>
            </div>
            
            {/* Status Dropdown - Only visible when editing */}
            {initialData && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Estado</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aceptado">Aceptado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>
            )}
          </div>

          {/* Dynamic Table */}
          <div className="mb-4" data-tour="budget-form-items">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                Detalle de Servicios / Productos
                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  {items.length} Renglones
                </span>
              </h3>
            </div>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 hidden md:table-header-group">
                  <tr>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase">Descripción</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase w-24 text-center">Orden</th>
                    <th className="px-4 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 block md:table-row-group">
                  {items.map((item, index) => (
                    <tr key={item.id} className="group block md:table-row p-4 md:p-0 border-b md:border-b-0 border-slate-100">
                      <td className="md:p-2 block md:table-cell mb-2 md:mb-0" data-tour={index === 0 ? 'budget-form-item-description' : undefined}>
                        <label className="md:hidden text-xs font-bold text-slate-400 uppercase mb-1 block">Descripción</label>
                        <input 
                          type="text" 
                          placeholder="Ej: Consultoría web..."
                          className="w-full px-3 py-1.5 text-sm bg-transparent border border-slate-200 md:border-transparent focus:border-primary-200 rounded-md outline-none transition-all"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        />
                      </td>
                      <td className="md:p-2 block md:table-cell mb-2 md:mb-0">
                        <label className="md:hidden text-xs font-bold text-slate-400 uppercase mb-1 block">Orden</label>
                        <div className="flex items-center justify-start md:justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveItem(index, -1)}
                            disabled={index === 0}
                            aria-label="Mover renglón hacia arriba"
                            title="Mover renglón hacia arriba"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(index, 1)}
                            disabled={index === items.length - 1}
                            aria-label="Mover renglón hacia abajo"
                            title="Mover renglón hacia abajo"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="md:p-2 text-right block md:table-cell">
                        <button 
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all w-full md:w-auto flex items-center justify-center"
                        >
                          <Trash2 size={14} className="md:hidden mr-2" />
                          <Trash2 size={14} className="hidden md:block" />
                          <span className="md:hidden text-xs font-medium">Eliminar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button 
              data-tour="budget-form-add-item"
              type="button" 
              onClick={addItem}
              className="mt-3 flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors py-2 px-3 rounded-lg border border-dashed border-primary-200 hover:border-primary-400 w-full justify-center md:w-auto"
            >
              <Plus size={14} />
              Agregar Renglón
            </button>
          </div>
        </div>

        {/* Footer - Fixed (Total + Actions) */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
          {/* Logic Toggle & Final Total */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isManualMode}
                  onChange={() => setIsManualMode(!isManualMode)}
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ background: 'var(--color-brand-purple)' }}></div>
                <span className="ml-3 text-sm font-medium text-slate-600">Ingresar total manualmente</span>
              </label>
              {isManualMode && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-lg animate-in slide-in-from-left-2 duration-300">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wide">Modo Manual</span>
                </div>
              )}
            </div>

            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-sm font-semibold uppercase">Total</span>
              {isManualMode ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-32 pl-6 pr-2 py-1 border border-primary-500 rounded-lg text-lg font-bold text-primary-600 outline-none shadow-sm focus:ring-2 focus:ring-primary-200 text-right"
                    value={manualTotal}
                    onChange={(e) => setManualTotal(e.target.value)}
                    autoFocus
                  />
                </div>
              ) : (
                <span className="text-2xl font-black text-primary-600 min-w-[120px] text-right">
                  ${autoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button 
              data-tour="budget-form-submit"
              type="submit"
              className="flex-[2] py-3 px-4 rounded-xl font-bold hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2" style={{ background: 'var(--color-brand-purple)', color: 'white' }}
            >
              <CheckCircle2 size={18} />
              {initialData ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}
