import React from 'react'
import { useAuth } from '../../hooks/useAuth'

function AuthTest() {
  const {
    user,
    userPermissions,
    currentRole,
    loading,
    reinitializeAuth,
    updateAuthState
  } = useAuth()

  const handleTestReinitialize = async () => {
    console.log('手動觸發重新初始化認證狀態')
    await reinitializeAuth()
  }

  const handleTestUpdateAuth = () => {
    console.log('手動觸發更新認證狀態')
    updateAuthState()
  }

  // 權限驗證函數
  const validatePermissions = () => {
    const role = user?.role || 'guest'
    const expectedPermissions = {
      guest: {
        isAuthenticated: false,
        canManageBooks: false,
        canUploadBooks: false,
        canDeleteBooks: false,
        canViewReports: false,
        canManageUsers: false,
        isAdmin: false,
        isAuthor: false,
        canViewBooks: false,
        canReadEbooks: false,
        canAccessLibrary: false
      },
      user: {
        isAuthenticated: true,
        canManageBooks: false,
        canUploadBooks: false,
        canDeleteBooks: false,
        canViewReports: false,
        canManageUsers: false,
        isAdmin: false,
        isAuthor: false,
        canViewBooks: true,
        canReadEbooks: true,
        canAccessLibrary: true
      },
      author: {
        isAuthenticated: true,
        canManageBooks: true,
        canUploadBooks: true,
        canDeleteBooks: false,
        canViewReports: false,
        canManageUsers: false,
        isAdmin: false,
        isAuthor: true,
        canViewBooks: true,
        canReadEbooks: true,
        canAccessLibrary: true
      },
      admin: {
        isAuthenticated: true,
        canManageBooks: true,
        canUploadBooks: true,
        canDeleteBooks: true,
        canViewReports: true,
        canManageUsers: true,
        isAdmin: true,
        isAuthor: false,
        canViewBooks: true,
        canReadEbooks: true,
        canAccessLibrary: true
      }
    }

    const expected = expectedPermissions[role] || expectedPermissions.guest
    const actual = userPermissions

    const mismatches = []
    Object.keys(expected).forEach(key => {
      if (expected[key] !== actual[key]) {
        mismatches.push(`${key}: 期望 ${expected[key]}, 實際 ${actual[key]}`)
      }
    })

    return {
      isValid: mismatches.length === 0,
      mismatches,
      role,
      expected,
      actual
    }
  }

  const validation = validatePermissions()

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>認證狀態測試</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>當前狀態：</h3>
        <p><strong>載入中：</strong> {loading ? '是' : '否'}</p>
        <p><strong>用戶：</strong> {user ? user.username : '未登入'}</p>
        <p><strong>角色：</strong> {currentRole}</p>
        <p><strong>已認證：</strong> {userPermissions.isAuthenticated ? '是' : '否'}</p>
        <p><strong>管理員：</strong> {userPermissions.isAdmin ? '是' : '否'}</p>
        <p><strong>作者：</strong> {userPermissions.isAuthor ? '是' : '否'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>權限驗證：</h3>
        <p><strong>權限是否正確：</strong> 
          <span style={{ color: validation.isValid ? 'green' : 'red', fontWeight: 'bold' }}>
            {validation.isValid ? '✓ 正確' : '✗ 錯誤'}
          </span>
        </p>
        {!validation.isValid && (
          <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
            <h4>權限不匹配：</h4>
            <ul>
              {validation.mismatches.map((mismatch, index) => (
                <li key={index} style={{ color: 'red' }}>{mismatch}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>權限詳情：</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify(userPermissions, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>用戶詳情：</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>測試功能：</h3>
        <button 
          onClick={handleTestReinitialize}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          重新初始化認證狀態
        </button>
        <button 
          onClick={handleTestUpdateAuth}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          更新認證狀態
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>權限測試：</h3>
        <p><strong>可以查看書籍：</strong> {userPermissions.canViewBooks ? '是' : '否'}</p>
        <p><strong>可以閱讀電子書：</strong> {userPermissions.canReadEbooks ? '是' : '否'}</p>
        <p><strong>可以訪問書庫：</strong> {userPermissions.canAccessLibrary ? '是' : '否'}</p>
        <p><strong>可以管理書籍：</strong> {userPermissions.canManageBooks ? '是' : '否'}</p>
        <p><strong>可以上傳書籍：</strong> {userPermissions.canUploadBooks ? '是' : '否'}</p>
        <p><strong>可以刪除書籍：</strong> {userPermissions.canDeleteBooks ? '是' : '否'}</p>
        <p><strong>可以查看報告：</strong> {userPermissions.canViewReports ? '是' : '否'}</p>
        <p><strong>可以管理用戶：</strong> {userPermissions.canManageUsers ? '是' : '否'}</p>
      </div>
    </div>
  )
}

export default AuthTest
