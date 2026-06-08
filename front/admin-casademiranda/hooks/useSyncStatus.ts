'use client';
import { useState, useEffect } from 'react';
import { getLastBookingSync, setForcedRedSync, clearForcedRedSync } from '../services/bookings';

export type SyncStatus = 'ok' | 'warning' | 'danger' | 'never';

export type SyncInfo = {
    status: SyncStatus;
    lastSyncDate: Date | null;
    daysAgo: number | null;
    setForcedRed: () => void;
    clearForcedRed: () => void;
    markSynced: () => void;
};

export function useSyncStatus(): SyncInfo {
    const [lastSyncTs, setLastSyncTs] = useState<number | null>(null);
    const [forcedRed, setForcedRedState] = useState(false);

    useEffect(() => {
        getLastBookingSync().then(({ lastSyncAt, forcedRed: fr }) => {
            if (lastSyncAt) setLastSyncTs(new Date(lastSyncAt).getTime());
            setForcedRedState(fr);
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
        setForcedRedState(true);
        setForcedRedSync();
    }

    function clearForcedRed() {
        setForcedRedState(false);
        clearForcedRedSync();
    }

    function markSynced() {
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
