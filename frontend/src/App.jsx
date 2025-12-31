import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Download,
  Calculator,
  AlertCircle,
  Users,
  Settings // Imported Settings icon
} from 'lucide-react';
import BudgetModal from './components/BudgetModal';
import StatusBadge from './components/StatusBadge';
import ClientsManager from './components/ClientsManager';
import SettingsModal from './components/SettingsModal'; // Imported SettingsModal
import { budgetService } from './services/api';

export default function App() {
  const [budgets, setBudgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientsManagerOpen, setIsClientsManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Settings state
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load budgets from API
  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetService.getAll();
      setBudgets(data);
      setError(null);
    } catch (err) {
      console.error('Error loading budgets:', err);
      setError('Error al cargar los presupuestos. Verifica que el backend esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  const addBudget = async (newBudgetData) => {
    try {
      const createdBudget = await budgetService.create(newBudgetData);
      setBudgets([createdBudget, ...budgets]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating budget:', err);
      alert('Error al crear el presupuesto');
    }
  };

  const deleteBudget = async (id) => {
    if (!confirm('¿Está seguro de eliminar este presupuesto?')) return;
    
    try {
      await budgetService.delete(id);
      setBudgets(budgets.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting budget:', err);
      alert('Error al eliminar el presupuesto');
    }
  };

  const handleDownloadPDF = async (id, budgetId) => {
    try {
      // Direct download URL
      const url = `${import.meta.env.VITE_API_URL}/budgets/${id}/pdf`;
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al descargar el PDF');
    }
  };

  const filteredBudgets = budgets.filter(b => 
    b.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.budget_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 md:pb-0">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-2 rounded-lg">
            <Calculator className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 hidden md:block">BudgetPro</span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {/* Settings Button */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
            title="Configuración"
          >
            <Settings size={20} />
          </button>

          {/* Clients Button */}
          <button 
            onClick={() => setIsClientsManagerOpen(true)}
            className="text-slate-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Users size={18} />
            <span className="hidden md:inline">Clientes</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-3 md:px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-sm text-sm md:text-base"
          >
            <Plus size={18} />
            <span className="hidden md:inline">Nuevo Presupuesto</span>
            <span className="md:hidden">Nuevo</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 md:pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        <header className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm md:text-base text-slate-500">Gestiona tus propuestas comerciales.</p>
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-medium">Error de conexión</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente o ID..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Total: <strong>{filteredBudgets.length}</strong></span>
          </div>
        </div>

        {/* Mobile Cards View (Visible only on mobile) */}
        <div className="md:hidden space-y-4">
          {loading ? (
             <div className="text-center py-8">
               <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
             </div>
          ) : filteredBudgets.map((budget) => (
            <div key={budget.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{budget.budget_id}</span>
                  <h3 className="font-bold text-slate-800 mt-1">{budget.client}</h3>
                </div>
                <StatusBadge status={budget.status} />
              </div>
              
              <div className="flex justify-between items-end border-t border-slate-100 pt-3 mt-2">
                <div>
                  <p className="text-xs text-slate-500">Fecha</p>
                  <p className="text-sm font-medium text-slate-700">{new Date(budget.date).toLocaleDateString('es-ES')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-lg font-black text-slate-900">${budget.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => handleDownloadPDF(budget.id, budget.budget_id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                >
                  <Download size={16} />
                  PDF
                </button>
                <button 
                  onClick={() => deleteBudget(budget.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-red-600 text-sm font-medium hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (Hidden on mobile) */}
        <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="text-slate-500 mt-3">Cargando presupuestos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">Total</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-wider text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredBudgets.map((budget) => (
                    <tr key={budget.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-sm text-primary-600 font-medium">{budget.budget_id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{budget.client}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(budget.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={budget.status} />
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        ${budget.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDownloadPDF(budget.id, budget.budget_id)}
                            className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 text-slate-400 hover:text-primary-600 shadow-sm transition-all"
                            title="Descargar PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button 
                            onClick={() => deleteBudget(budget.id)}
                            className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 text-slate-400 hover:text-red-500 shadow-sm transition-all"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && filteredBudgets.length === 0 && (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                <FileText size={24} />
              </div>
              <p className="text-slate-500">No se encontraron presupuestos.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Overlay: New Budget */}
      {isModalOpen && (
        <BudgetModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={addBudget} 
        />
      )}

      {/* Modal Overlay: Clients Manager */}
      <ClientsManager 
        isOpen={isClientsManagerOpen} 
        onClose={() => setIsClientsManagerOpen(false)} 
      />

      {/* Modal Overlay: Settings (Logo Upload) */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
