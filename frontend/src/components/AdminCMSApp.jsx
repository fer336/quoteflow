import React, { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
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
    <div className="min-h-screen p-4" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-4">
        <header className="rounded-xl border p-4 flex items-center justify-between" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <img src="/images/logos/logo-header.svg" alt="OctopusFlow" className="h-10 w-auto" />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-brand-dark)' }}>OctopusFlow</h1>
              <p style={{ color: 'var(--color-text-secondary)' }}>CMS Admin · Gestión de usuarios, roles y membresías</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('admin_cms_token');
              setIsAuthed(false);
            }}
            className="rounded-lg px-3 py-2 border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Cerrar sesión
          </button>
        </header>

        <section className="rounded-xl border p-4" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-brand-dark)' }}>{editingId ? 'Editar usuario' : 'Crear usuario'}</h2>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input className="rounded-lg px-3 py-2 border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }} placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="rounded-lg px-3 py-2 border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <select className="rounded-lg px-3 py-2 border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">admin</option>
              <option value="operador">operador</option>
              <option value="solo_lectura">solo_lectura</option>
            </select>
            <button className="md:col-span-4 rounded-lg px-3 py-2 font-semibold" style={{ background: 'var(--color-brand-blue)', color: '#fff' }} type="submit">{editingId ? 'Guardar cambios' : 'Crear usuario'}</button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="md:col-span-4 rounded-lg px-3 py-2 border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                Cancelar edición
              </button>
            )}
          </form>
        </section>

        <section className="rounded-xl border p-4" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-brand-dark)' }}>Usuarios registrados</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="overflow-x-auto">
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
                      <td className="p-2 flex gap-2 flex-wrap">
                        <button className="rounded border px-2 py-1" style={{ borderColor: 'var(--color-border)' }} onClick={() => { setEditingId(user.id); setForm({ name: user.name, email: user.email, role: user.role }); }}>Editar</button>
                        <button className="rounded border px-2 py-1" style={{ borderColor: 'var(--color-border)' }} onClick={async () => { await adminUsersService.setStatus(user.id, !user.is_active); await loadUsers(); }}>{user.is_active ? 'Bloquear' : 'Activar'}</button>
                        <button className="rounded border px-2 py-1" style={{ borderColor: 'var(--color-border)' }} onClick={async () => { await adminUsersService.resetMembership(user.id); await loadUsers(); }}>Reset membresía</button>
                        <button className="rounded border px-2 py-1" style={{ borderColor: '#fecaca', color: '#b91c1c' }} onClick={async () => { await removeUser(user); }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
