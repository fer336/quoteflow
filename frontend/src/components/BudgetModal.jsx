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
  ChevronDown,
} from 'lucide-react';
import { clientService } from '../services/api';

const ARS = (n) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(n);

const hasVal = (v) => v !== '' && v !== undefined && v !== null;

export default function BudgetModal({ isOpen, onClose, onSubmit, initialData }) {
  const [client, setClient] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validity, setValidity] = useState('15 días');
  const [status, setStatus] = useState('Pendiente');
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualTotal, setManualTotal] = useState(0);
  const [items, setItems] = useState([]);

  // Bottom sheet state (mobile)
  const [showSheet, setShowSheet] = useState(false);
  const [sheetItem, setSheetItem] = useState({ description: '', quantity: 1, price: '' });
  const [editingId, setEditingId] = useState(null);

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Clients Logic
  const [clients, setClients] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadClients();
      if (initialData) {
        setClient(initialData.client);
        setDate(new Date(initialData.date).toISOString().split('T')[0]);
        setValidity(initialData.validity || '15 días');
        setStatus(initialData.status);
        setIsManualMode(initialData.is_manual_total === 1);
        setManualTotal(initialData.total);

        if (initialData.items && initialData.items.length > 0) {
          setItems(initialData.items.map(i => ({
            id: crypto.randomUUID(),
            description: i.description,
            quantity: 1,
            price: i.amount,
            amount: i.amount,
          })));
        } else {
          setItems([]);
        }
      } else {
        setClient('');
        setDate(new Date().toISOString().split('T')[0]);
        setValidity('15 días');
        setStatus('Pendiente');
        setIsManualMode(false);
        setManualTotal(0);
        setItems([]);
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

  // Auto total
  const autoTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }, [items]);

  const finalTotal = isManualMode ? manualTotal : autoTotal;

  // ── Desktop: inline item management ──

  const addInlineItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: '', quantity: 1, price: 0, amount: 0 }]);
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'price' || field === 'quantity') {
        const q = parseFloat(updated.quantity) || 1;
        const p = parseFloat(updated.price) || 0;
        updated.amount = q * p;
      }
      return updated;
    }));
  };

  const removeItem = (id) => {
    if (items.length > 1 || deleteConfirmId === id) {
      setItems(items.filter(item => item.id !== id));
      setDeleteConfirmId(null);
    }
  };

  const moveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setItems(reordered);
  };

  // ── Mobile: Bottom sheet ──

  const openNewSheet = () => {
    setSheetItem({ description: '', quantity: 1, price: '' });
    setEditingId(null);
    setShowSheet(true);
  };

  const openEditSheet = (item) => {
    setSheetItem({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
    });
    setEditingId(item.id);
    setShowSheet(true);
  };

  const closeSheet = () => {
    setShowSheet(false);
    setEditingId(null);
  };

  const updateSheetField = (field, value) => {
    setSheetItem(prev => ({ ...prev, [field]: value }));
  };

  const sheetSubtotal = useMemo(() => {
    return (parseFloat(sheetItem.quantity) || 1) * (parseFloat(sheetItem.price) || 0);
  }, [sheetItem.quantity, sheetItem.price]);

  const canSaveSheet = sheetItem.description.trim() !== '' && (isManualMode || parseFloat(sheetItem.price) > 0);

  const saveSheetItem = () => {
    if (!canSaveSheet) return;
    const q = parseFloat(sheetItem.quantity) || 1;
    const p = parseFloat(sheetItem.price) || 0;
    const amount = q * p;
    if (editingId) {
      setItems(items.map(item =>
        item.id === editingId
          ? { ...item, description: sheetItem.description, quantity: q, price: p, amount }
          : item
      ));
    } else {
      setItems([...items, {
        id: crypto.randomUUID(),
        description: sheetItem.description,
        quantity: q,
        price: p,
        amount,
      }]);
    }
    closeSheet();
  };

  // ── Shared: Delete ──

  const requestDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
    setDeleteConfirmId(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // ── Submit ──

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!client) return;

    const budgetData = {
      client,
      date: new Date(date).toISOString(),
      validity,
      status: initialData ? status : undefined,
      is_manual_total: isManualMode ? 1 : 0,
      total: isManualMode ? parseFloat(manualTotal) : undefined,
      items: items.map((item, index) => ({
        description: item.description,
        amount: parseFloat(item.amount) || 0,
        order_index: index,
      })),
    };

    onSubmit(budgetData);
  };

  if (!isOpen) return null;

  // Floating label class helper
  const floatClass = (v) =>
    hasVal(v)
      ? 'top-1 text-[10px] text-blue-500 font-medium'
      : 'top-3.5 text-sm text-slate-400 peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-blue-500 peer-focus:font-medium';

  const borderClass = (v) =>
    hasVal(v) && v > 0
      ? 'border-blue-500'
      : 'border-slate-200 focus:border-blue-500';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm">
      <div className="flex min-h-full items-stretch justify-center p-0 md:items-center md:p-6">
        <form
          onSubmit={handleSubmit}
          data-tour="budget-modal"
          className="bg-white w-full min-h-screen shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col md:min-h-0 md:max-w-4xl md:my-auto md:max-h-[calc(100dvh-3rem)] md:rounded-2xl"
        >
          {/* Header */}
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

            {/* ════════════════════════════════════════
                MOBILE: Card list + Bottom sheet
            ════════════════════════════════════════ */}
            <div className="block md:hidden mb-4" data-tour="budget-form-items">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  Detalle de Servicios / Productos
                  {items.length > 0 && (
                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      {items.length} Renglones
                    </span>
                  )}
                </h3>
              </div>

              {items.length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-xl py-10 px-6 text-center mb-4">
                  <p className="text-sm text-slate-400 mb-1">No hay renglones todavía</p>
                  <p className="text-xs text-slate-300">Agregá servicios o productos al presupuesto</p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 text-sm leading-tight truncate">
                            {item.description}
                          </span>
                          {!isManualMode && (
                            <span className="font-bold text-slate-800 text-sm whitespace-nowrap ml-2">
                              {ARS(item.amount)}
                            </span>
                          )}
                        </div>
                        {!isManualMode && item.price > 0 && (
                          <div className="text-xs text-slate-400 mt-1">
                            {item.quantity} × {ARS(item.price)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center gap-1 animate-in fade-in duration-150">
                            <button type="button" onClick={() => confirmDelete(item.id)} className="px-2.5 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">Eliminar</button>
                            <button type="button" onClick={cancelDelete} className="px-2.5 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">Cancelar</button>
                          </div>
                        ) : (
                          <>
                            <button type="button" onClick={() => openEditSheet(item)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Editar"><Edit3 size={16} /></button>
                            <button type="button" onClick={() => requestDelete(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={openNewSheet}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 hover:border-blue-500 text-blue-600 hover:text-blue-700 font-semibold text-sm rounded-xl transition-all hover:bg-blue-50/50"
              >
                <Plus size={18} />
                Agregar ítem
              </button>
            </div>

            {/* ════════════════════════════════════════
                DESKTOP: Table layout
            ════════════════════════════════════════ */}
            <div className="hidden md:block mb-4" data-tour="budget-form-items-desktop">
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
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase">Descripción</th>
                      {!isManualMode && (
                        <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase w-36 text-right">P. Unitario</th>
                      )}
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase w-20 text-center">Orden</th>
                      <th className="px-4 py-2 w-24"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={isManualMode ? 3 : 4} className="px-4 py-10 text-center text-sm text-slate-400">
                          No hay renglones. Agregá el primero.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              placeholder="Ej: Consultoría web..."
                              className="w-full px-3 py-1.5 text-sm bg-transparent border border-transparent focus:border-primary-200 rounded-md outline-none transition-all"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            />
                          </td>
                          {!isManualMode && (
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="$0.00"
                                className="w-full px-3 py-1.5 text-sm bg-transparent border border-transparent focus:border-primary-200 rounded-md outline-none transition-all text-right"
                                value={item.price}
                                onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                              />
                            </td>
                          )}
                          <td className="px-4 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveItem(index, -1)}
                                disabled={index === 0}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveItem(index, 1)}
                                disabled={index === items.length - 1}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right">
                            {deleteConfirmId === item.id ? (
                              <div className="flex items-center gap-1 justify-end animate-in fade-in duration-150">
                                <button type="button" onClick={() => confirmDelete(item.id)} className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md hover:bg-red-600">Eliminar</button>
                                <button type="button" onClick={cancelDelete} className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md hover:bg-slate-200">Cancelar</button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => requestDelete(item.id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addInlineItem}
                className="mt-3 flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors py-2 px-3 rounded-lg border border-dashed border-primary-200 hover:border-primary-400"
              >
                <Plus size={14} />
                Agregar Renglón
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isManualMode}
                    onChange={() => {
                      if (!isManualMode) {
                        setItems(items.map(item => ({ ...item, amount: 0, price: 0 })));
                      }
                      setIsManualMode(!isManualMode);
                    }}
                  />
                  <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ background: 'var(--color-brand-blue)' }}></div>
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
                {!isManualMode && <span className="text-slate-500 text-sm font-semibold uppercase">Total</span>}
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
                    {ARS(autoTotal)}
                  </span>
                )}
              </div>
            </div>

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
                className="flex-[2] py-3 px-4 rounded-xl font-bold hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2" style={{ background: 'var(--color-brand-blue)', color: 'white' }}
              >
                <CheckCircle2 size={18} />
                {initialData ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ══════ MOBILE: BOTTOM SHEET ══════ */}
      {showSheet && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeSheet} />
          <div
            className="relative bg-white rounded-t-[20px] shadow-2xl w-full max-w-lg mx-auto"
            style={{ animation: 'slideUp 250ms ease-out' }}
          >
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
            `}</style>

            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 bg-slate-300 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-6 pt-2 pb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Editar ítem' : 'Nuevo ítem'}
              </h3>
              <button type="button" onClick={closeSheet} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pb-8 space-y-5">
              {/* Descripción */}
              <div className="relative">
                <input
                  type="text"
                  id="sheet-desc"
                  placeholder=" "
                  autoFocus
                  className={`peer w-full h-12 px-4 pt-4 pb-1 text-sm border rounded-xl outline-none transition-all focus:border-2 bg-transparent ${borderClass(sheetItem.description)}`}
                  value={sheetItem.description}
                  onChange={(e) => updateSheetField('description', e.target.value)}
                />
                <label htmlFor="sheet-desc" className={`absolute left-4 transition-all pointer-events-none ${floatClass(sheetItem.description)}`}>
                  Descripción
                </label>
              </div>

              {/* Cantidad | Precio unit. */}
              <div className={`grid ${isManualMode ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                <div className="relative">
                  <input
                    type="number"
                    id="sheet-qty"
                    inputMode="decimal"
                    placeholder=" "
                    min="1"
                    className={`peer w-full h-12 px-4 pt-4 pb-1 text-sm border rounded-xl outline-none transition-all focus:border-2 bg-transparent ${borderClass(sheetItem.quantity)}`}
                    value={sheetItem.quantity}
                    onChange={(e) => updateSheetField('quantity', e.target.value)}
                  />
                  <label htmlFor="sheet-qty" className={`absolute left-4 transition-all pointer-events-none ${floatClass(sheetItem.quantity)}`}>
                    Cantidad
                  </label>
                </div>
                {!isManualMode && (
                <div className="relative">
                  <input
                    type="number"
                    id="sheet-price"
                    inputMode="decimal"
                    placeholder=" "
                    min="0"
                    step="0.01"
                    className={`peer w-full h-12 px-4 pt-4 pb-1 text-sm border rounded-xl outline-none transition-all focus:border-2 bg-transparent ${borderClass(sheetItem.price)}`}
                    value={sheetItem.price}
                    onChange={(e) => updateSheetField('price', e.target.value)}
                  />
                  <label htmlFor="sheet-price" className={`absolute left-4 transition-all pointer-events-none ${floatClass(sheetItem.price)}`}>
                    Precio unit.
                  </label>
                </div>
                )}
              </div>

              {!isManualMode && (
              /* Subtotal */
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-slate-500">Subtotal</span>
                <span className="text-base font-bold text-slate-800">{ARS(sheetSubtotal)}</span>
              </div>
              )}

              {/* Save */}
              <button
                type="button"
                onClick={saveSheetItem}
                disabled={!canSaveSheet}
                className="w-full h-[52px] flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25"
              >
                <CheckCircle2 size={18} />
                Guardar ítem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
