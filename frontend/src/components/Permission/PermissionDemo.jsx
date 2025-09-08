import React from 'react'
import { PermissionUtils } from '../utils/permissionUtils'
import { PermissionConfigGenerator } from '../utils/permissionUtils'

function PermissionDemo({ userPermissions = {} }) {
  const permissionUtils = new PermissionUtils(userPermissions)

  return (
    <div className="permission-demo">
      <h2>🔐 權限管理演示</h2>
      
      {/* 用戶資訊 */}
      <div className="user-info-section">
        <h3>👤 用戶資訊</h3>
        <div className="info-grid">
          <div className="info-item">
            <strong>角色：</strong> {permissionUtils.getUserRole()}
          </div>
          <div className="info-item">
            <strong>認證狀態：</strong> {permissionUtils.isAuthenticated() ? '✅ 已登入' : '❌ 未登入'}
          </div>
          <div className="info-item">
            <strong>管理員：</strong> {permissionUtils.isAdmin() ? '✅ 是' : '❌ 否'}
          </div>
        </div>
      </div>

      {/* 頁面權限測試 */}
      <div className="page-permissions-section">
        <h3>📄 頁面權限測試</h3>
        <div className="permission-grid">
          {['home', 'books', 'reports', 'admin', 'users', 'settings', 'about'].map(pageName => (
            <div key={pageName} className="permission-item">
              <span className="page-name">{pageName}</span>
              <span className={`permission-status ${permissionUtils.canAccessPage(pageName) ? 'allowed' : 'denied'}`}>
                {permissionUtils.canAccessPage(pageName) ? '✅ 可訪問' : '❌ 不可訪問'}
              </span>
              <span className="auth-status">
                {permissionUtils.requiresAuth(pageName) ? '🔒 需認證' : '🌐 公開'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 功能權限測試 */}
      <div className="feature-permissions-section">
        <h3>⚙️ 功能權限測試</h3>
        <div className="permission-grid">
          {['createBook', 'editBook', 'deleteBook', 'viewReports', 'manageUsers', 'systemSettings'].map(featureName => (
            <div key={featureName} className="permission-item">
              <span className="feature-name">{featureName}</span>
              <span className={`permission-status ${permissionUtils.canUseFeature(featureName) ? 'allowed' : 'denied'}`}>
                {permissionUtils.canUseFeature(featureName) ? '✅ 可使用' : '❌ 不可使用'}
              </span>
              <span className="auth-status">
                {permissionUtils.featureRequiresAuth(featureName) ? '🔒 需認證' : '🌐 公開'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 權限報告 */}
      <div className="permission-report-section">
        <h3>📊 權限報告</h3>
        <div className="report-content">
          <div className="report-item">
            <strong>可訪問的頁面：</strong>
            <ul>
              {permissionUtils.getAccessiblePages().map(page => (
                <li key={page}>✅ {page}</li>
              ))}
            </ul>
          </div>
          <div className="report-item">
            <strong>可使用的功能：</strong>
            <ul>
              {permissionUtils.getAccessibleFeatures().map(feature => (
                <li key={feature}>✅ {feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 配置生成器演示 */}
      <div className="config-generator-section">
        <h3>🔧 配置生成器演示</h3>
        <div className="config-examples">
          <div className="config-item">
            <strong>公開頁面配置：</strong>
            <pre>{JSON.stringify(PermissionConfigGenerator.generatePublicPageConfig(), null, 2)}</pre>
          </div>
          <div className="config-item">
            <strong>需要認證的頁面配置：</strong>
            <pre>{JSON.stringify(PermissionConfigGenerator.generateAuthPageConfig(['canManageBooks']), null, 2)}</pre>
          </div>
          <div className="config-item">
            <strong>管理員頁面配置：</strong>
            <pre>{JSON.stringify(PermissionConfigGenerator.generateAdminPageConfig(), null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PermissionDemo 