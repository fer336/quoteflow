import React, { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Pencil, Lock, Unlock, RotateCcw, Trash2 } from 'lucide-react';
import { adminAuthService, adminUsersService } from '../services/api';

const initialForm = { name: '', email: '', role: 'operador' };

export default function AdminCMSApp() {
  const [isAuthed, setIsAuthed] = useState(Boolean(localStorage.getItem('admin_cms_token')));
  const [authError, setAuthError] = useState('');
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await adminUsersService.list());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) void loadUsers();
  }, [isAuthed]);

  const loginWithGoogle = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        setAuthError('');
        const data = await adminAuthService.googleLogin(tokenResponse?.access_token);
        localStorage.setItem('admin_cms_token', data.access_token);
        setIsAuthed(true);
      } catch {
        setAuthError('Acceso denegado. Solo puede ingresar el superadmin por Google.');
      }
    },
    onError: () => {
      setAuthError('No se pudo iniciar Google OAuth.');
    },
  });

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await adminUsersService.update(editingId, {
        name: form.name,
        email: form.email,
        role: form.role,
      });
    } else {
      await adminUsersService.create({
        name: form.name,
        email: form.email,
        role: form.role,
      });
    }
    setForm(initialForm);
    setEditingId(null);
    await loadUsers();
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const removeUser = async (user) => {
    const ok = window.confirm(`¿Eliminar usuario ${user.email}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await adminUsersService.remove(user.id);
      if (editingId === user.id) cancelEditing();
      await loadUsers();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (detail === 'CANNOT_DELETE_SUPERADMIN') {
        window.alert('No se puede eliminar el superadmin.');
        return;
      }
      if (detail === 'USER_DELETE_CONFLICT') {
        window.alert('No se pudo eliminar por conflicto de datos relacionados.');
        return;
      }
      window.alert('No se pudo eliminar el usuario.');
    }
  };

  const activeUsers = users.filter((user) => user.is_active).length;
  const blockedUsers = users.length - activeUsers;

  if (!isAuthed) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'var(--color-bg-primary)' }}>
        <section
          className="max-w-xl mx-auto mt-10 rounded-xl border p-6"
          style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <img src="/images/logos/logo-header.svg" alt="OctopusFlow" className="h-10 w-auto" />
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-brand-dark)' }}>OctopusFlow</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>CMS Admin</p>
            </div>
          </div>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Solo puede ingresar el superadmin autorizado con Google.
          </p>
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full rounded-lg border px-4 py-2.5 font-semibold"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-brand-blue)' }}
          >
            Ingresar con Google
          </button>
          {authError && <p className="mt-3 text-sm" style={{ color: '#dc2626' }}>{authError}</p>}
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-4">
        <header className="rounded-2xl border p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <img src="/images/logos/logo-header.svg" alt="OctopusFlow" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-brand-dark)' }}>OctopusFlow</h1>
              <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>CMS Admin · Gestión de usuarios, roles y membresías</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('admin_cms_token');
              setIsAuthed(false);
            }}
            className="rounded-lg px-3 py-2 border w-full sm:w-auto"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Cerrar sesión
          </button>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <article className="rounded-xl border p-3" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Total usuarios</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-brand-dark)' }}>{users.length}</p>
          </article>
          <article className="rounded-xl border p-3" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Activos</p>
            <p className="text-2xl font-bold" style={{ color: '#059669' }}>{activeUsers}</p>
          </article>
          <article className="rounded-xl border p-3" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Bloqueados</p>
            <p className="text-2xl font-bold" style={{ color: '#b91c1c' }}>{blockedUsers}</p>
          </article>
        </section>

        <section className="rounded-2xl border p-3 sm:p-4" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-brand-dark)' }}>{editingId ? 'Editar usuario' : 'Crear usuario'}</h2>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input className="rounded-xl px-3 py-2.5 border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }} placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="rounded-xl px-3 py-2.5 border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <select className="rounded-xl px-3 py-2.5 border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">admin</option>
              <option value="operador">operador</option>
              <option value="solo_lectura">solo_lectura</option>
            </select>
            <button className="md:col-span-4 rounded-xl px-3 py-2.5 font-semibold" style={{ background: 'var(--color-brand-blue)', color: '#fff' }} type="submit">{editingId ? 'Guardar cambios' : 'Crear usuario'}</button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="md:col-span-4 rounded-xl px-3 py-2.5 border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                Cancelar edición
              </button>
            )}
          </form>
        </section>

        <section className="rounded-2xl border p-3 sm:p-4" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-brand-dark)' }}>Usuarios registrados</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {users.map((user) => (
                  <article key={user.id} className="rounded-xl border p-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-primary)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--color-brand-dark)' }}>{user.name}</p>
                        <p className="text-sm break-all" style={{ color: 'var(--color-text-secondary)' }}>{user.email}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: user.is_active ? '#86efac' : '#fecaca', color: user.is_active ? '#166534' : '#b91c1c', background: user.is_active ? '#f0fdf4' : '#fef2f2' }}>
                        {user.is_active ? 'Activo' : 'Bloqueado'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div className="rounded-lg p-2" style={{ background: 'var(--color-bg-secondary)' }}>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Rol</p>
                        <p className="font-medium">{user.role}</p>
                      </div>
                      <div className="rounded-lg p-2" style={{ background: 'var(--color-bg-secondary)' }}>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Días restantes</p>
                        <p className="font-medium">{user.days_remaining}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button title="Editar" aria-label="Editar" className="rounded-lg border p-2" style={{ borderColor: 'var(--color-border)' }} onClick={() => { setEditingId(user.id); setForm({ name: user.name, email: user.email, role: user.role }); }}><Pencil size={16} /></button>
                      <button title={user.is_active ? 'Bloquear' : 'Activar'} aria-label={user.is_active ? 'Bloquear' : 'Activar'} className="rounded-lg border p-2" style={{ borderColor: 'var(--color-border)' }} onClick={async () => { await adminUsersService.setStatus(user.id, !user.is_active); await loadUsers(); }}>{user.is_active ? <Lock size={16} /> : <Unlock size={16} />}</button>
                      <button title="Reset membresía" aria-label="Reset membresía" className="rounded-lg border p-2" style={{ borderColor: 'var(--color-border)' }} onClick={async () => { await adminUsersService.resetMembership(user.id); await loadUsers(); }}><RotateCcw size={16} /></button>
                      <button title="Eliminar" aria-label="Eliminar" className="rounded-lg border p-2" style={{ borderColor: '#fecaca', color: '#b91c1c' }} onClick={async () => { await removeUser(user); }}><Trash2 size={16} /></button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Rol</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Días restantes</th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.role}</td>
                      <td className="p-2">{user.is_active ? 'Activo' : 'Bloqueado'}</td>
                      <td className="p-2">{user.days_remaining}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <button title="Editar" aria-label="Editar" className="rounded border p-1.5" style={{ borderColor: 'var(--color-border)' }} onClick={() => { setEditingId(user.id); setForm({ name: user.name, email: user.email, role: user.role }); }}><Pencil size={15} /></button>
                          <button title={user.is_active ? 'Bloquear' : 'Activar'} aria-label={user.is_active ? 'Bloquear' : 'Activar'} className="rounded border p-1.5" style={{ borderColor: 'var(--color-border)' }} onClick={async () => { await adminUsersService.setStatus(user.id, !user.is_active); await loadUsers(); }}>{user.is_active ? <Lock size={15} /> : <Unlock size={15} />}</button>
                          <button title="Reset membresía" aria-label="Reset membresía" className="rounded border p-1.5" style={{ borderColor: 'var(--color-border)' }} onClick={async () => { await adminUsersService.resetMembership(user.id); await loadUsers(); }}><RotateCcw size={15} /></button>
                          <button title="Eliminar" aria-label="Eliminar" className="rounded border p-1.5" style={{ borderColor: '#fecaca', color: '#b91c1c' }} onClick={async () => { await removeUser(user); }}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
