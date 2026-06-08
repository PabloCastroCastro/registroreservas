'use client';
import { useState, useEffect } from 'react';
import { getLastBookingSync } from '../services/bookings';

export type SyncStatus = 'ok' | 'warning' | 'danger' | 'never';

export type SyncInfo = {
    status: SyncStatus;
    lastSyncDate: Date | null;
    daysAgo: number | null;
    setForcedRed: () => void;
    clearForcedRed: () => void;
    markSynced: () => void;
};

const FORCED_RED_KEY = 'booking_sync_forced_red';

export function useSyncStatus(): SyncInfo {
    const [lastSyncTs, setLastSyncTs] = useState<number | null>(null);
    const [forcedRed, setForcedRedState] = useState(false);

    useEffect(() => {
        const forced = localStorage.getItem(FORCED_RED_KEY) === 'true';
        setForcedRedState(forced);

        getLastBookingSync().then(isoDate => {
            if (isoDate) setLastSyncTs(new Date(isoDate).getTime());
        });
    }, []);

    const daysAgo = lastSyncTs
        ? Math.floor((Date.now() - lastSyncTs) / (1000 * 60 * 60 * 24))
        : null;

    let status: SyncStatus = 'never';
    if (forcedRed) {
        status = 'danger';
    } else if (lastSyncTs !== null && daysAgo !== null) {
        if (daysAgo === 0) status = 'ok';
        else if (daysAgo === 1) status = 'warning';
        else status = 'danger';
    }

    function setForcedRed() {
        localStorage.setItem(FORCED_RED_KEY, 'true');
        setForcedRedState(true);
    }

    function clearForcedRed() {
        localStorage.removeItem(FORCED_RED_KEY);
        setForcedRedState(false);
    }

    function markSynced() {
        // La fecha se actualiza en el backend; aquí solo refrescamos el estado local
        localStorage.removeItem(FORCED_RED_KEY);
        setLastSyncTs(Date.now());
        setForcedRedState(false);
    }

    return {
        status,
        lastSyncDate: lastSyncTs ? new Date(lastSyncTs) : null,
        daysAgo,
        setForcedRed,
        clearForcedRed,
        markSynced,
    };
}
