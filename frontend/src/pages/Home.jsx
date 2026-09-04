import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="px-6 lg:px-10 py-8 max-w-5xl">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                Welcome back
            </h1>
            <p className="text-vault-muted mb-8">
                Everything your team needs to build, ship, and maintain the stack — in one place.
            </p>

            <p className="text-xs font-semibold tracking-wide text-vault-faint mb-3">BROWSE BY CATEGORY</p>
            

            <p className="text-xs font-semibold tracking-wide text-vault-faint mb-3">RECENTLY UPDATED</p>
            
        </div>
    );
}