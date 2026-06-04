'use client';
import Link from 'next/link';
import { SyncInfo } from '../../hooks/useSyncStatus';

type Props = {
    sync: SyncInfo;
    showForceButton?: boolean;
};

const STATUS_CONFIG = {
    ok:      { dot: 'bg-green',  text: 'text-green',  label: 'Booking sincronizado' },
    warning: { dot: 'bg-yellow', text: 'text-yellow',  label: 'Sync recomendada' },
    danger:  { dot: 'bg-orange', text: 'text-orange',  label: 'Sync necesaria' },
    never:   { dot: 'bg-gray',   text: 'text-gray',    label: 'Sin sincronización' },
};

export default function SyncIndicator({ sync, showForceButton = false }: Props) {
    const { status, lastSyncDate, daysAgo } = sync;
    const cfg = STATUS_CONFIG[status];

    const dateLabel = lastSyncDate
        ? daysAgo === 0
            ? 'hoy'
            : daysAgo === 1
            ? 'hace 1 día'
            : `hace ${daysAgo} días`
        : null;

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                <span className={`text-sm font-medium ${cfg.text}`}>
                    {cfg.label}{dateLabel ? ` · ${dateLabel}` : ''}
                </span>
            </div>

            <Link
                href="/booking/load-booking"
                className="text-xs rounded-full bg-gray-light text-gray-dark px-3 py-1 font-semibold"
            >
                Cargar reservas
            </Link>

            {showForceButton && status !== 'danger' && (
                <button
                    onClick={sync.setForcedRed}
                    className="text-xs rounded-full border border-orange text-orange px-3 py-1 font-semibold"
                >
                    Marcar como pendiente
                </button>
            )}

            {showForceButton && status === 'danger' && sync.lastSyncDate && (
                <button
                    onClick={sync.clearForcedRed}
                    className="text-xs rounded-full border border-gray-light text-gray px-3 py-1 font-semibold"
                >
                    Quitar aviso
                </button>
            )}
        </div>
    );
}
