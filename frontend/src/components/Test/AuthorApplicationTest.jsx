import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import classes from './AuthorApplicationTest.module.scss';

export default function AuthorApplicationTest() {
  const { user, userPermissions, handleApplyForAuthor, updateAuthState } = useAuth();
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 監聽認證狀態變化
  useEffect(() => {
    console.log('🧪 測試組件認證狀態變化:', {
      user: user ? { id: user.id, role: user.role } : null,
      userPermissions,
      isAuthor: userPermissions.isAuthor,
      isAdmin: userPermissions.isAdmin
    });
  }, [user, userPermissions]);

  const testAuthorApplication = async () => {
    setIsLoading(true);
    setTestResult('開始測試申請成為作者...');
    
    try {
      const result = await handleApplyForAuthor({ termsAccepted: true });
      
      if (result?.success) {
        setTestResult('✅ 申請成功！正在更新狀態...');
        
        // 立即更新狀態
        updateAuthState();
        
        // 延遲檢查狀態
        setTimeout(() => {
          const currentUser = user;
          const currentPermissions = userPermissions;
          
          setTestResult(`
            ✅ 申請完成！
            用戶角色: ${currentUser?.role || '未知'}
            是否為作者: ${currentPermissions.isAuthor ? '是' : '否'}
            是否為管理員: ${currentPermissions.isAdmin ? '是' : '否'}
            權限更新時間: ${new Date().toLocaleTimeString()}
          `);
        }, 500);
      } else {
        setTestResult(`❌ 申請失敗: ${result?.message || '未知錯誤'}`);
      }
    } catch (error) {
      setTestResult(`❌ 測試錯誤: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.testContainer}>
      <h3>🧪 作者申請測試</h3>
      
      <div className={classes.statusInfo}>
        <h4>當前狀態:</h4>
        <p>用戶 ID: {user?.id || '未登入'}</p>
        <p>用戶角色: {user?.role || '未知'}</p>
        <p>是否為作者: {userPermissions.isAuthor ? '是' : '否'}</p>
        <p>是否為管理員: {userPermissions.isAdmin ? '是' : '否'}</p>
      </div>

      <div className={classes.testActions}>
        <button 
          onClick={testAuthorApplication}
          disabled={isLoading || userPermissions.isAuthor || userPermissions.isAdmin}
          className={classes.testButton}
        >
          {isLoading ? '測試中...' : '測試申請成為作者'}
        </button>
        
        <button 
          onClick={() => {
            updateAuthState();
            setTestResult('🔄 手動更新認證狀態');
          }}
          className={classes.updateButton}
        >
          手動更新狀態
        </button>
      </div>

      {testResult && (
        <div className={classes.testResult}>
          <h4>測試結果:</h4>
          <pre>{testResult}</pre>
        </div>
      )}
    </div>
  );
}
