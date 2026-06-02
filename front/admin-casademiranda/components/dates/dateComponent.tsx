interface DateProps {
    label: string,
    date: Date
}

export default function DateComponent({ label, date }: DateProps) {
    const formatted = date ? new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
    return (
        <div>
            <p className="text-xs text-gray uppercase tracking-wide">{label ?? 'Fecha'}</p>
            <p className="text-gray-dark font-medium">{formatted}</p>
        </div>
    );
}