import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import classes from './Admin.module.scss';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };

      const result = await authService.getAllUsers(params);
      
      if (result.success) {
        setUsers(result.data.users);
        setTotalPages(result.data.pagination.pages);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('載入用戶列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      const result = await authService.updateUserStatus(userId, !currentStatus);
      
      if (result.success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, is_active: !currentStatus }
            : user
        ));
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('更新用戶狀態失敗');
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      const result = await authService.updateUserRole(userId, newRole);
      
      if (result.success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        ));
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('更新用戶角色失敗');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('確定要刪除此用戶嗎？此操作無法撤銷。')) {
      return;
    }

    try {
      const result = await authService.deleteUser(userId);
      
      if (result.success) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('刪除用戶失敗');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleBatchDelete = async () => {
    if (!window.confirm(`確定要刪除選中的 ${selectedUsers.length} 個用戶嗎？`)) {
      return;
    }

    try {
      const promises = selectedUsers.map(userId => authService.deleteUser(userId));
      await Promise.all(promises);
      
      setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
    } catch (error) {
      setError('批量刪除失敗');
    }
  };

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.loadingSpinner}>載入中...</div>
      </div>
    );
  }

  return (
    <div className={classes.adminContainer}>
      <div className={classes.adminHeader}>
        <h2>用戶管理</h2>
        <div className={classes.adminActions}>
          <form onSubmit={handleSearch} className={classes.searchForm}>
            <input
              type="text"
              placeholder="搜尋用戶..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={classes.searchInput}
            />
            <button type="submit" className={classes.searchButton}>
              搜尋
            </button>
          </form>
          
          {selectedUsers.length > 0 && (
            <button
              onClick={handleBatchDelete}
              className={classes.deleteButton}
            >
              刪除選中 ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={classes.errorMessage}>
          {error}
        </div>
      )}

      <div className={classes.tableContainer}>
        <table className={classes.adminTable}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>用戶名</th>
              <th>電子郵件</th>
              <th>角色</th>
              <th>狀態</th>
              <th>註冊時間</th>
              <th>最後登入</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                    className={classes.roleSelect}
                  >
                    <option value="user">一般用戶</option>
                     <option value="author">作者</option>
                    <option value="admin">管理員</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => handleUserStatusToggle(user.id, user.is_active)}
                    className={`${classes.statusButton} ${user.is_active ? classes.active : classes.inactive}`}
                  >
                    {user.is_active ? '啟用' : '停用'}
                  </button>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  {user.last_login 
                    ? new Date(user.last_login).toLocaleDateString()
                    : '從未登入'
                  }
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className={classes.deleteButton}
                    disabled={user.role === 'admin'}
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={classes.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={classes.pageButton}
          >
            上一頁
          </button>
          
          <span className={classes.pageInfo}>
            第 {currentPage} 頁，共 {totalPages} 頁
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={classes.pageButton}
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
