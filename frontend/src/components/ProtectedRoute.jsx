import { Navigate, useLocation } from 'react-router-dom';
//import { useAuth } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, adminOnly = false }) { /**adminOnly = false */
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="p-8 text-vault-muted text-sm">Loading…</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (adminOnly && user.role !== 'admin') {
        return (
        <div className="p-10 text-center">
            <p className="text-lg font-semibold text-white mb-1">Admin access required</p>
            <p className="text-sm text-vault-muted">You don't have permission to view this page.</p>
        </div>
        );
    }

    return children;
}
