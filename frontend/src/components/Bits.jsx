import { Link } from 'react-router-dom';
//import { ChevronRight } from 'lucide-react';

export function Breadcrumbs() {
  return (
    <div className="flex items-center gap-2 text-sm text-vault-muted mb-4 flex-wrap">
      
    </div>
  );
}

const tagColors = {
  react: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  vite: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  javascript: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'node.js': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  postgresql: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  express: 'bg-neutral-500/10 text-neutral-300 border-neutral-500/20',
  auth: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
};

