import React, { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { WifiOff, Wifi } from '@mui/icons-material';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
      setShowOnlineAlert(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineAlert(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* 離線警告 */}
      <Snackbar
        open={showOfflineAlert}
        autoHideDuration={null} // 不自動關閉
        onClose={() => setShowOfflineAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="warning" 
          icon={<WifiOff />}
          onClose={() => setShowOfflineAlert(false)}
          sx={{ width: '100%' }}
        >
          網路連線已中斷，部分功能可能無法正常使用
        </Alert>
      </Snackbar>

      {/* 線上恢復通知 */}
      <Snackbar
        open={showOnlineAlert}
        autoHideDuration={6000}
        onClose={() => setShowOnlineAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          icon={<Wifi />}
          onClose={() => setShowOnlineAlert(false)}
          sx={{ width: '100%' }}
        >
          網路連線已恢復
        </Alert>
      </Snackbar>
    </>
  );
};

export default NetworkStatus;
