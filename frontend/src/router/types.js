/**
 * 路由配置類型定義
 * 
 * @typedef {Object} RouteConfig
 * @property {string} path - 路由路徑
 * @property {React.ReactElement} element - 路由元件
 * @property {string} title - 路由標題
 * @property {string} description - 路由描述
 * @property {Object} [meta] - 路由元資料
 * @property {boolean} [meta.requiresAuth] - 是否需要認證
 * @property {string[]} [meta.permissions] - 所需權限
 * @property {string} [meta.icon] - 路由圖示
 */

/**
 * 導航選單項目類型定義
 * 
 * @typedef {Object} NavigationItem
 * @property {string} path - 路由路徑
 * @property {string} title - 顯示標題
 * @property {string} description - 描述文字
 */

/**
 * 路由守衛結果類型定義
 * 
 * @typedef {Object} GuardResult
 * @property {boolean} allowed - 是否允許訪問
 * @property {string} [redirect] - 重定向路徑（當不允許時）
 */

/**
 * 用戶權限類型定義
 * 
 * @typedef {Object} UserPermissions
 * @property {boolean} [canManageBooks] - 是否可以管理書籍
 * @property {boolean} [canViewBooks] - 是否可以查看書籍
 * @property {boolean} [isAdmin] - 是否為管理員
 */

export {} 