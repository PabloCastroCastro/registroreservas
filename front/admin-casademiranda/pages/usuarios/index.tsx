import "@/app/globals.css";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/navbar/navbar';
import { isAdmin } from '@/auth/auth';
import { getUsers, createManagedUser, deleteManagedUser, changePassword, changeRole, ManagedUser } from '@/services/users';

const inputClass = "mt-1 w-full border border-gray-light rounded-lg px-3 py-2 text-gray-dark text-sm focus:outline-none focus:border-gray";
const labelClass = "text-xs text-gray uppercase tracking-wide block";

export default function Usuarios() {
    const router = useRouter();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'manager'>('manager');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    const [pwdUser, setPwdUser] = useState<ManagedUser | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [changingPwd, setChangingPwd] = useState(false);
    const [pwdError, setPwdError] = useState('');

    useEffect(() => {
        if (!isAdmin()) { router.replace('/'); return; }
        load();
    }, []);

    async function load() {
        setLoading(true);
        try {
            setUsers(await getUsers());
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setCreateError('Usuario y contraseña son obligatorios');
            return;
        }
        setCreating(true);
        setCreateError('');
        try {
            await createManagedUser(username.trim(), password, role);
            setUsername('');
            setPassword('');
            setRole('manager');
            await load();
        } catch (e: any) {
            setCreateError(e.message);
        } finally {
            setCreating(false);
        }
    }

    async function handleRoleChange(id: number, newRole: 'admin' | 'manager') {
        try {
            await changeRole(id, newRole);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    }

    async function handleDelete(id: number, name: string) {
        if (!confirm(`¿Eliminar el usuario "${name}"?`)) return;
        try {
            await deleteManagedUser(id);
            await load();
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    }

    function openPwdModal(u: ManagedUser) {
        setPwdUser(u);
        setNewPassword('');
        setPwdError('');
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        if (!newPassword.trim()) { setPwdError('La contraseña no puede estar vacía'); return; }
        if (!pwdUser) return;
        setChangingPwd(true);
        setPwdError('');
        try {
            await changePassword(pwdUser.id, newPassword);
            setPwdUser(null);
        } catch (e: any) {
            setPwdError(e.message);
        } finally {
            setChangingPwd(false);
        }
    }

    const roleSelect = (u: ManagedUser) => (
        <select
            value={u.role}
            onChange={e => handleRoleChange(u.id, e.target.value as 'admin' | 'manager')}
            className="border border-gray-light rounded-lg px-2 py-1 text-xs text-gray-dark focus:outline-none focus:border-gray"
        >
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
        </select>
    );

    return (
        <>
            <Navbar />
            <div className="px-4 md:px-10 mt-5">
                <h1 className="text-xl text-green text-opacity-75 font-semibold mb-5">Gestión de usuarios</h1>

                {/* Crear usuario */}
                <section className="border border-gray-light rounded-lg p-4 mb-6">
                    <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Nuevo usuario</h2>
                    <form onSubmit={handleCreate} noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className={labelClass}>Usuario</label>
                                <input className={inputClass} type="text" value={username}
                                    onChange={e => setUsername(e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Contraseña</label>
                                <input className={inputClass} type="password" value={password}
                                    onChange={e => setPassword(e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Rol</label>
                                <select className={inputClass} value={role} onChange={e => setRole(e.target.value as 'admin' | 'manager')}>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <button type="submit" disabled={creating}
                                    className="w-full rounded-full bg-green bg-opacity-50 px-4 py-2 text-sm font-semibold text-gray-dark disabled:opacity-40">
                                    {creating ? 'Creando...' : 'Crear usuario'}
                                </button>
                            </div>
                        </div>
                        {createError && <p className="text-xs text-orange mt-2">{createError}</p>}
                    </form>
                </section>

                {/* Lista de usuarios */}
                <section className="border border-gray-light rounded-lg p-4">
                    <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Usuarios</h2>

                    {loading ? (
                        <p className="text-sm text-gray">Cargando...</p>
                    ) : error ? (
                        <p className="text-sm text-orange">{error}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-light">
                                        <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Usuario</th>
                                        <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Rol</th>
                                        <th className="py-2 px-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-gray-light last:border-0">
                                            <td className="py-2 px-3 text-gray-dark font-medium">{u.username}</td>
                                            <td className="py-2 px-3">{roleSelect(u)}</td>
                                            <td className="py-2 px-3 text-right flex items-center justify-end gap-3">
                                                <button onClick={() => openPwdModal(u)}
                                                    title="Cambiar contraseña"
                                                    className="text-gray hover:text-gray-dark transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleDelete(u.id, u.username)}
                                                    title="Eliminar usuario"
                                                    className="text-gray hover:text-orange transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {/* Modal cambio de contraseña */}
            {pwdUser && (
                <div className="fixed inset-0 bg-gray-dark bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
                        <h3 className="text-sm font-semibold text-gray-dark mb-1">Cambiar contraseña</h3>
                        <p className="text-xs text-gray mb-4">{pwdUser.username}</p>
                        <form onSubmit={handleChangePassword} noValidate>
                            <div className="mb-4">
                                <label className={labelClass}>Nueva contraseña</label>
                                <input className={inputClass} type="password" value={newPassword} autoFocus
                                    onChange={e => setNewPassword(e.target.value)} />
                                {pwdError && <p className="text-xs text-orange mt-1">{pwdError}</p>}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setPwdUser(null)}
                                    className="px-4 py-2 text-sm text-gray hover:text-gray-dark border border-gray-light rounded-full transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={changingPwd}
                                    className="px-4 py-2 text-sm font-semibold rounded-full bg-green bg-opacity-50 text-gray-dark disabled:opacity-40">
                                    {changingPwd ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
