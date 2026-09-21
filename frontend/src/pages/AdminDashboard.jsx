import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Grid2x2, Trash2, Shield, ShieldOff } from 'lucide-react';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/Bits';

const tabs = ['Overview', 'Documents', 'Users'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAdminStats().then(({ stats, topDocuments }) => setStats({ ...stats, topDocuments })).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (tab === 'Documents') {
      api.getAdminDocuments().then(({ documents }) => setDocuments(documents)).catch((e) => setError(e.message));
    }
    if (tab === 'Users') {
      api.getAdminUsers().then(({ users }) => setUsers(users)).catch((e) => setError(e.message));
    }
  }, [tab]);

  async function handleDeleteDoc(slug) {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try {
      await api.deleteDocument(slug);
      setDocuments((prev) => prev.filter((d) => d.slug !== slug));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleToggleRole(user) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.setUserRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Admin Dashboard' }]} />
      <h1 className="text-3xl font-extrabold text-vault-text tracking-tight mb-6">Admin Dashboard</h1>

      <div className="flex gap-1 border-b border-vault-border mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-vault-accent text-vault-text' : 'border-transparent text-vault-muted hover:text-vault-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-vault-danger mb-4">{error}</p>}

      {tab === 'Overview' && (
        <div>
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            <StatCard icon={FileText} label="Documents" value={stats?.docCount} />
            <StatCard icon={Grid2x2} label="Categories" value={stats?.categoryCount} />
            <StatCard icon={Users} label="Users" value={stats?.userCount} />
          </div>

          <p className="text-xs font-semibold tracking-wide text-vault-faint mb-3">MOST VIEWED</p>
          <div className="space-y-2">
            {stats?.topDocuments?.map((d) => (
              <Link
                key={d.id}
                to={`/docs/${d.slug}`}
                className="flex items-center justify-between rounded-lg border border-vault-border bg-vault-elevated px-4 py-3 hover:border-vault-accent/40 transition-colors"
              >
                <span className="flex items-center gap-2.5 text-sm text-vault-text">
                  <span>{d.icon}</span> {d.title}
                </span>
                <span className="text-xs text-vault-faint tabular-nums">{d.views} views</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tab === 'Documents' && (
        <div className="rounded-xl border border-vault-border overflow-hidden">
          <div className= "overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-vault-elevated text-left text-xs text-vault-faint uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Views</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id} className="border-t border-vault-border hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="px-4 py-3">
                      <Link to={`/docs/${d.slug}`} className="text-vault-text font-medium hover:text-vault-accent">
                        {d.icon} {d.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-vault-muted">{d.category_name || '—'}</td>
                    <td className="px-4 py-3 text-vault-muted tabular-nums">{d.views}</td>
                    <td className="px-4 py-3 text-vault-faint">{new Date(d.updated_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteDoc(d.slug)}
                        className="text-vault-faint hover:text-vault-danger transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Users' && (
        <div className="rounded-xl border border-vault-border overflow-hidden">
          <div className= "overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-vault-elevated text-left text-xs text-vault-faint uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-vault-border hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="px-4 py-3 text-vault-text font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-vault-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium rounded-md px-2 py-0.5 border ${
                          u.role === 'admin'
                            ? 'border-vault-accent/40 text-vault-accent bg-vault-accent-soft'
                            : 'border-vault-border text-vault-muted'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-vault-faint">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleRole(u)}
                        className="flex items-center gap-1.5 text-xs text-vault-muted hover:text-vault-text transition-colors ml-auto"
                      >
                        {u.role === 'admin' ? <ShieldOff size={13} /> : <Shield size={13} />}
                        {u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-vault-border bg-vault-elevated p-4">
      <Icon size={18} className="text-vault-accent mb-2" />
      <p className="text-2xl font-bold text-vault-text tabular-nums">{value ?? '—'}</p>
      <p className="text-xs text-vault-faint">{label}</p>
    </div>
  );
}
