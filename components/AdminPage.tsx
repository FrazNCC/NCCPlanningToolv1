
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrashIcon, DownloadIcon, XCircleIcon } from './Icons';
import { UserData } from '../types';

interface AdminPageProps {
  onLogout: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUsersFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('planner_users');
      const parsed = stored ? JSON.parse(stored) : {};
      setUsers(parsed);
      console.log('Registry Refresh: Loaded', Object.keys(parsed).length, 'users');
    } catch (e) {
      console.error("Registry Refresh: Failed", e);
      setUsers({});
    }
  }, []);

  useEffect(() => {
    loadUsersFromStorage();
  }, [loadUsersFromStorage]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = newUsername.trim();
    const pass = newPassword.trim();

    if (!uname || !pass) {
      alert('Required: Both username and password.');
      return;
    }
    
    if (uname.toLowerCase() === 'frazadmin') {
      alert('Reserved: Cannot use admin name.');
      return;
    }

    const current = JSON.parse(localStorage.getItem('planner_users') || '{}');
    if (current[uname]) {
      alert('Exists: Username already taken.');
      return;
    }

    const updated = { ...current, [uname]: { password: pass, lastLogin: undefined } };
    localStorage.setItem('planner_users', JSON.stringify(updated));
    setUsers(updated);
    setNewUsername('');
    setNewPassword('');
  };

  /**
   * REFACTORED DELETION:
   * Uses internal state for confirmation instead of window.confirm.
   * This ensures reliability in sandboxed or strict browser environments.
   */
  const executeDelete = (username: string) => {
    console.log('DELETING USER:', username);
    
    try {
      const stored = localStorage.getItem('planner_users');
      if (!stored) return;

      const allUsers = JSON.parse(stored);
      
      if (username in allUsers) {
        // Remove from local object
        delete allUsers[username];
        
        // Update LocalStorage
        localStorage.setItem('planner_users', JSON.stringify(allUsers));
        
        // Cleanup private data
        localStorage.removeItem(`planner_data_${username}`);
        
        // Update React State
        setUsers({ ...allUsers });
        setConfirmDelete(null);
        
        console.log('DELETE SUCCESSFUL:', username);
      } else {
        console.warn('DELETE FAILED: User not in registry');
        loadUsersFromStorage();
      }
    } catch (err) {
      console.error('CRITICAL DELETE ERROR:', err);
      alert('System Error during deletion.');
    }
  };

  const handleDownloadBackup = () => {
    try {
      const backup = {
        version: "2.0",
        timestamp: new Date().toISOString(),
        users,
        userData: {} as Record<string, any>
      };
      Object.keys(users).forEach(u => {
        const d = localStorage.getItem(`planner_data_${u}`);
        if (d) backup.userData[u] = JSON.parse(d);
      });
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `full_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed.');
    }
  };

  const handleRestoreFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        if (!backup.users) throw new Error();
        localStorage.setItem('planner_users', JSON.stringify(backup.users));
        if (backup.userData) {
          Object.entries(backup.userData).forEach(([u, d]) => {
            localStorage.setItem(`planner_data_${u}`, JSON.stringify(d));
          });
        }
        loadUsersFromStorage();
        setRestoreStatus({ type: 'success', message: 'Restore complete.' });
      } catch (err) {
        setRestoreStatus({ type: 'error', message: 'Invalid backup file.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl rotate-3">
             <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Admin Panel</h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Management</p>
          </div>
        </div>
        <button onClick={onLogout} className="px-8 py-3 bg-red-600 text-white rounded-xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all">LOGOUT</button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-black mb-6 border-b-4 border-indigo-600 inline-block">Create User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input type="text" placeholder="Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-4 focus:ring-indigo-500/20 font-bold" />
              <input type="password" placeholder="Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-4 focus:ring-indigo-500/20 font-bold" />
              <button type="submit" className="w-full py-4 bg-gray-900 dark:bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-colors">REGISTER</button>
            </form>
          </section>

          <section className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-black mb-6 border-b-4 border-amber-500 inline-block">System Data</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleDownloadBackup} className="flex flex-col items-center gap-2 p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold hover:bg-indigo-100 transition-all">
                <DownloadIcon /> <span className="text-xs uppercase">Export</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl font-bold hover:bg-amber-100 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span className="text-xs uppercase">Import</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleRestoreFile} className="hidden" accept=".json" />
            </div>
            {restoreStatus && <p className={`mt-4 text-xs font-black uppercase text-center ${restoreStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{restoreStatus.message}</p>}
          </section>
        </div>

        {/* User List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-8 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-black uppercase tracking-tighter">User Directory</h2>
              <span className="px-4 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black">{Object.keys(users).length} TOTAL</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-700">
                    <th className="px-8 py-6">User Identity</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {/* Fixed: Cast Object.entries(users) as [string, UserData][] to ensure TypeScript correctly identifies 'data' properties */}
                  {(Object.entries(users) as [string, UserData][]).map(([name, data]) => (
                    <tr key={name} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-black text-indigo-600">{name.charAt(0).toUpperCase()}</div>
                          <span className="font-black text-lg">{name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {data.lastLogin ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{new Date(data.lastLogin).toLocaleDateString()}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(data.lastLogin).toLocaleTimeString()}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-gray-400">New User</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        {name.toLowerCase() === 'frazadmin' ? (
                          <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">System Owner</span>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {confirmDelete === name ? (
                              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                                <button onClick={() => executeDelete(name)} className="px-4 py-2 bg-red-600 text-white text-[10px] font-black rounded-lg shadow-lg">SURE?</button>
                                <button onClick={() => setConfirmDelete(null)} className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg hover:bg-gray-200"><XCircleIcon /></button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDelete(name)} className="p-3 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                <TrashIcon />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {Object.keys(users).length === 0 && (
                    <tr><td colSpan={3} className="px-8 py-20 text-center font-black text-gray-300 uppercase tracking-widest text-xl">Database Empty</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
