import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  X, 
  Search,
  User,
  Mail,
  Phone,
  FileText,
  Edit2,
  Building2,
  MapPin
} from 'lucide-react';
import { clientService } from '../services/api';

export default function ClientsManager({ isOpen, onClose, onSelectClient }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // New Client Form State
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    tipo_inmueble: '',
    address: '',
    tax_id: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client, e) => {
    e.stopPropagation();
    setNewClient({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      tipo_inmueble: client.tipo_inmueble || '',
      address: client.address || '',
      tax_id: client.tax_id || ''
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        const updated = await clientService.update(editingId, newClient);
        setClients(clients.map(c => c.id === editingId ? updated : c));
      } else {
        // Create
        const created = await clientService.create(newClient);
        setClients([...clients, created]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error al guardar el cliente');
    }
  };

  const resetForm = () => {
    setNewClient({ name: '', email: '', phone: '', tipo_inmueble: '', address: '', tax_id: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
    
    try {
      await clientService.delete(id);
      setClients(clients.filter(c => c.id !== id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col h-[600px] max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Users className="text-primary-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Gestionar Clientes</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => {
                if (showForm) resetForm();
                else setShowForm(true);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${showForm ? 'bg-slate-100 text-slate-600' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
            >
              <Plus size={16} className={showForm ? "rotate-45 transition-transform" : ""} />
              {showForm ? 'Cancelar' : 'Nuevo Cliente'}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 overflow-y-auto">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    required
                    type="text" 
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-primary-500 outline-none"
                    placeholder="Nombre completo"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CUIT/Tax ID</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-primary-500 outline-none"
                    placeholder="Opcional"
                    value={newClient.tax_id}
                    onChange={(e) => setNewClient({...newClient, tax_id: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="email" 
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-primary-500 outline-none"
                    placeholder="email@ejemplo.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-primary-500 outline-none"
                    placeholder="+54 9 11..."
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo inmueble</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-primary-500 outline-none"
                    placeholder="Casa, departamento, local..."
                    value={newClient.tipo_inmueble}
                    onChange={(e) => setNewClient({...newClient, tipo_inmueble: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-primary-500 outline-none"
                    placeholder="Calle, número, localidad"
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-end mt-2 gap-2">
                <button 
                  type="submit" 
                  className="w-full md:w-auto bg-primary-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  {editingId ? 'Actualizar Cliente' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Cargando clientes...</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No hay clientes registrados.</div>
            ) : (
              <div className="grid gap-2">
                {filteredClients.map(client => (
                  <div 
                    key={client.id}
                    onClick={() => {
                      if (onSelectClient) {
                        onSelectClient(client);
                        onClose();
                      }
                    }}
                    className={`p-3 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group flex items-center justify-between ${onSelectClient ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{client.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {client.email && <span className="flex items-center gap-1"><Mail size={12}/> {client.email}</span>}
                          {client.phone && <span className="flex items-center gap-1"><Phone size={12}/> {client.phone}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => handleEdit(client, e)}
                        className="p-2 text-slate-300 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(client.id, e)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
