import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, Button, Box } from '@mui/material';
import { WifiOff, Wifi, BugReport } from '@mui/icons-material';
import networkDiagnostics from '../../utils/networkDiagnostics';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);
  const [showDiagnosticAlert, setShowDiagnosticAlert] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState(null);

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

  // 執行網路診斷
  const runDiagnosis = async () => {
    try {
      const results = await networkDiagnostics.runFullDiagnosis();
      const report = networkDiagnostics.generateReport(results);
      setDiagnosticResults(report);
      setShowDiagnosticAlert(true);
    } catch (error) {
      console.error('診斷執行失敗:', error);
    }
  };

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
          action={
            <Button color="inherit" size="small" onClick={runDiagnosis}>
              診斷
            </Button>
          }
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

      {/* 診斷結果通知 */}
      <Snackbar
        open={showDiagnosticAlert}
        autoHideDuration={10000}
        onClose={() => setShowDiagnosticAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={diagnosticResults?.summary?.totalIssues > 0 ? "error" : "success"}
          icon={<BugReport />}
          onClose={() => setShowDiagnosticAlert(false)}
          sx={{ width: '100%' }}
        >
          <Box>
            <div>診斷完成：發現 {diagnosticResults?.summary?.totalIssues || 0} 個問題</div>
            {diagnosticResults?.summary?.issues?.length > 0 && (
              <div style={{ fontSize: '0.8em', marginTop: '4px' }}>
                {diagnosticResults.summary.issues.slice(0, 2).join(', ')}
                {diagnosticResults.summary.issues.length > 2 && '...'}
              </div>
            )}
          </Box>
        </Alert>
      </Snackbar>
    </>
  );
};

export default NetworkStatus;
