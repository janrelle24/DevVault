import { Loader2 } from 'lucide-react';


export default function ButtonSpinner({ size = 16, className = '' }) {
    return <Loader2 size={size} className={`animate-spin ${className}`} />;
}
