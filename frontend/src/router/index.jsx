import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../components/Home/Home'
import Books from '../components/Books/Books'
import About from '../components/About/About'
import EbookList from '../components/Ebook/EbookList'
import EbookReader from '../components/Ebook/EbookReader'
import EbookUpload from '../components/Ebook/EbookUpload'
import EbookEditor from '../components/Ebook/EbookEditor'
import ChapterTest from '../components/Test/ChapterTest'
import AuthTest from '../components/Test/AuthTest'
import RouteAnimationTest from '../components/Test/RouteAnimationTest'
import UserLibrary from '../components/UserLibrary/UserLibrary'
import UserManagement from '../components/Admin/UserManagement'
import AuthPage from '../components/Auth/AuthPage'
import { getPageConfig } from './permissionMap'
import { Icon } from '../components/icons'
import UserInfo from '../components/UserInfo/UserInfo'

// 路由配置 - 使用統一權限管理系統
const routes = [
  {
    path: '/',
    element: <Home />,
    title: '首頁',
    description: '書籍管理系統首頁',
    meta: {
      ...getPageConfig('home'), // 自動獲取認證要求和權限
      icon: 'home',
      iconComponent: <Icon name="home" size={20} />
    }
  },
  {
    path: '/auth',
    element: <AuthPage />,
    title: '登入/註冊',
    description: '用戶認證頁面',
    meta: {
      ...getPageConfig('auth'), // 自動獲取認證要求和權限
      icon: 'auth',
      iconComponent: <Icon name="auth" size={20} />
    }
  },
  {
    path: '/books',
    element: <Books />,
    title: '書籍管理',
    description: '管理書籍資料',
    meta: {
      ...getPageConfig('books'), // 自動獲取認證要求和權限
      icon: 'books',
      iconComponent: <Icon name="books" size={20} />
    }
  },
  {
    path: '/my-library',
    element: <UserLibrary />,
    title: '我的書庫',
    description: '管理個人書庫',
    meta: {
      ...getPageConfig('userLibrary'), // 自動獲取認證要求和權限
      icon: 'library',
      iconComponent: <Icon name="library" size={20} />
    }
  },
  {
    path: '/admin/users',
    element: <UserManagement />,
    title: '用戶管理',
    description: '管理所有用戶',
    meta: {
      ...getPageConfig('userManagement'), // 自動獲取認證要求和權限
      icon: 'users',
      iconComponent: <Icon name="users" size={20} />
    }
  },
  {
    path: '/ebooks',
    element: <EbookList />,
    title: '電子書庫',
    description: '瀏覽所有電子書',
    meta: {
      ...getPageConfig('ebooks'), // 自動獲取認證要求和權限
      icon: 'ebooks',
      iconComponent: <Icon name="ebooks" size={20} />
    }
  },
  {
    path: '/user-info',
    element: <UserInfo />,
    title: '個人資訊',
    description: '個人統計資訊',
    meta: {
      requiresAuth: true,
      permissions: []
    }
  },
  {
    path: '/ebooks/:id/read',
    element: <EbookReader />,
    title: '電子書閱讀',
    description: '閱讀電子書內容',
    meta: {
      ...getPageConfig('ebookReader'), // 自動獲取認證要求和權限
      icon: 'read',
      iconComponent: <Icon name="read" size={20} />
    }
  },
  {
    path: '/ebooks/upload',
    element: <EbookUpload />,
    title: '上傳電子書',
    description: '上傳新的電子書',
    meta: {
      ...getPageConfig('ebookUpload'), // 自動獲取認證要求和權限
      icon: 'upload',
      iconComponent: <Icon name="upload" size={20} />
    }
  },
  {
    path: '/ebooks/:id/edit',
    element: <EbookEditor />,
    title: '編輯電子書',
    description: '編輯電子書內容',
    meta: {
      ...getPageConfig('ebookEditor'), // 自動獲取認證要求和權限
      icon: 'edit',
      iconComponent: <Icon name="edit" size={20} />
    }
  },
  {
    path: '/about',
    element: <About />,
    title: '關於',
    description: '關於系統資訊',
    meta: {
      ...getPageConfig('about'), // 自動獲取認證要求和權限
      icon: 'about',
      iconComponent: <Icon name="about" size={20} />
    }
  },

]

// 路由元件
function AppRoutes({ userPermissions = {} }) {
  return (
    <Routes>
      <Route path="/" element={<Home userPermissions={userPermissions} />} />
      <Route path="/auth" element={<AuthPage userPermissions={userPermissions} />} />
      <Route path="/books" element={<Books userPermissions={userPermissions} />} />
      <Route path="/my-library" element={<UserLibrary userPermissions={userPermissions} />} />
      <Route path="/admin/users" element={<UserManagement userPermissions={userPermissions} />} />
      <Route path="/ebooks" element={<EbookList userPermissions={userPermissions} />} />
      <Route path="/user-info" element={<UserInfo userPermissions={userPermissions} />} />
      <Route path="/ebooks/:id/read" element={<EbookReader userPermissions={userPermissions} />} />
      <Route path="/ebooks/:id/edit" element={<EbookEditor userPermissions={userPermissions} />} />
      <Route path="/ebooks/upload" element={<EbookUpload userPermissions={userPermissions} />} />
      <Route path="/about" element={<About userPermissions={userPermissions} />} />
      <Route path="/chapter-test" element={<ChapterTest userPermissions={userPermissions} />} />
      <Route path="/auth-test" element={<AuthTest />} />
      <Route path="/route-animation-test" element={<RouteAnimationTest />} />
    </Routes>
  )
}

// 導出路由配置和元件
export { routes }
export default AppRoutes 