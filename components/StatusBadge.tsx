'use client';

interface StatusBadgeProps {
    status: 'brouillon' | 'en-cours' | 'publie' | 'en-attente' | 'complete';
    className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const styles = {
        'brouillon': 'bg-gray-100 text-gray-700 border border-gray-300',
        'en-cours': 'bg-blue-50 text-blue-700 border border-blue-200',
        'publie': 'bg-green-50 text-green-700 border border-green-300',
        'en-attente': 'bg-amber-50 text-amber-700 border border-amber-300',
        'complete': 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    };

    const labels = {
        'brouillon': 'Brouillon',
        'en-cours': 'En cours',
        'publie': 'Publié',
        'en-attente': 'En attente',
        'complete': 'Complété',
    };

    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status]} ${className}`}>
            {labels[status]}
        </span>
    );
}
