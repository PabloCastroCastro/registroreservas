'use client';
import { useState, useEffect } from 'react';

export type SyncStatus = 'ok' | 'warning' | 'danger' | 'never';

export type SyncInfo = {
    status: SyncStatus;
    lastSyncDate: Date | null;
    daysAgo: number | null;
    setForcedRed: () => void;
    clearForcedRed: () => void;
    markSynced: () => void;
};

const LAST_SYNC_KEY = 'booking_last_sync';
const FORCED_RED_KEY = 'booking_sync_forced_red';

export function useSyncStatus(): SyncInfo {
    const [lastSyncTs, setLastSyncTs] = useState<number | null>(null);
    const [forcedRed, setForcedRedState] = useState(false);

    useEffect(() => {
        const ts = localStorage.getItem(LAST_SYNC_KEY);
        const forced = localStorage.getItem(FORCED_RED_KEY) === 'true';
        if (ts) setLastSyncTs(parseInt(ts));
        setForcedRedState(forced);
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
        const now = Date.now();
        localStorage.setItem(LAST_SYNC_KEY, String(now));
        localStorage.removeItem(FORCED_RED_KEY);
        setLastSyncTs(now);
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
