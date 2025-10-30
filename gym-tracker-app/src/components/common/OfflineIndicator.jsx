import { useEffect, useState } from "react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { useAuth } from "../../hooks/useAuth";
import { performFullSync } from "../../services/syncService";
import { getStorageInfo } from "../../utils/offlineStorage";

export default function OfflineIndicator() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);

  useEffect(() => {
    setStorageInfo(getStorageInfo());
  }, [isOnline]);

  useEffect(() => {
    if (wasOffline && isOnline && user) {
      handleSync();
    }
  }, [wasOffline, isOnline, user]);

  const handleSync = async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    setSyncComplete(false);

    try {
      const result = await performFullSync(user.uid);

      if (result.success) {
        setSyncComplete(true);
        setStorageInfo(getStorageInfo());

        setTimeout(() => {
          setSyncComplete(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isSyncing) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2 text-sm text-center">
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Syncing your data...</span>
        </div>
      </div>
    );
  }

  if (syncComplete) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-2 text-sm text-center">
        <div className="flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>All data synced successfully!</span>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    const hasPendingData =
      storageInfo &&
      (storageInfo.pendingCount > 0 || storageInfo.syncQueueCount > 0);

    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white px-4 py-2 text-sm">
        <div className="flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          <span>
            You're offline.{" "}
            {hasPendingData && "Changes will sync when reconnected."}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
