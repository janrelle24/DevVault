//import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Grid2x2, Trash2, Shield, ShieldOff } from 'lucide-react';
import { Breadcrumbs } from '../components/Bits';

export default function Dashboard() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Admin Dashboard' }]} />
      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-6">Admin Dashboard</h1>

      <div className="flex gap-1 border-b border-vault-border mb-6">
        
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors` }
          >
            
          </button>
        
      </div>


      
        <div>
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            <StatCard icon={FileText} label="Documents"  />
            <StatCard icon={Grid2x2} label="Categories" />
            <StatCard icon={Users} label="Users" />
          </div>

          <p className="text-xs font-semibold tracking-wide text-vault-faint mb-3">MOST VIEWED</p>
          <div className="space-y-2">
              <Link
                
                
                className="flex items-center justify-between rounded-lg border border-vault-border bg-vault-elevated px-4 py-3 hover:border-vault-accent/40 transition-colors"
              >
                <span className="flex items-center gap-2.5 text-sm text-white">
                  <span></span>
                </span>
                <span className="text-xs text-vault-faint tabular-nums"> views</span>
              </Link>
          </div>
        </div>

        <div className="rounded-xl border border-vault-border overflow-hidden">
          <table className="w-full text-sm">
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
              <tr className="border-t border-vault-border hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link className="text-white font-medium hover:text-vault-accent">
                    
                  </Link>
                </td>
                <td className="px-4 py-3 text-vault-muted"></td>
                <td className="px-4 py-3 text-vault-muted tabular-nums"></td>
                <td className="px-4 py-3 text-vault-faint"></td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="text-vault-faint hover:text-vault-danger transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-vault-border overflow-hidden">
          <table className="w-full text-sm">
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
                <tr className="border-t border-vault-border hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium"></td>
                  <td className="px-4 py-3 text-vault-muted"></td>
                  <td className="px-4 py-3">
                    <span>
                      
                    </span>
                  </td>
                  <td className="px-4 py-3 text-vault-faint"></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      
                      className="flex items-center gap-1.5 text-xs text-vault-muted hover:text-white transition-colors ml-auto"
                    >
                      <ShieldOff size={13} /> : <Shield size={13} />
                      
                    </button>
                  </td>
                </tr>
            
            </tbody>
          </table>
        </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-vault-border bg-vault-elevated p-4">
      <Icon size={18} className="text-vault-accent mb-2" />
      <p className="text-2xl font-bold text-white tabular-nums">{value ?? '—'}</p>
      <p className="text-xs text-vault-faint">{label}</p>
    </div>
  );
}