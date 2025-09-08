import React, { useState, useEffect } from 'react'
import auditService from '../../services/auditService'

function AuditLog() {
  const [auditLogs, setAuditLogs] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    type: '',
    startDate: '',
    endDate: ''
  })

  // 獲取審計日誌
  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filter.type) params.append('type', filter.type)
      if (filter.startDate) params.append('startDate', filter.startDate)
      if (filter.endDate) params.append('endDate', filter.endDate)
      
      const response = await fetch(`/api/audit/logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.logs || [])
      }
    } catch (error) {
      console.error('獲取審計日誌失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  // 獲取審計統計
  const fetchAuditStats = async () => {
    try {
      const response = await fetch('/api/audit/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error('獲取審計統計失敗:', error)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
    fetchAuditStats()
  }, [filter])

  // 格式化時間
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-TW')
  }

  // 獲取事件類型顏色
  const getEventColor = (type) => {
    switch (type) {
      case 'PERMISSION_DENIED': return 'text-red-600'
      case 'PERMISSION_GRANTED': return 'text-green-600'
      case 'ROLE_SWITCH': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  // 獲取事件類型圖示
  const getEventIcon = (type) => {
    switch (type) {
      case 'PERMISSION_DENIED': return '❌'
      case 'PERMISSION_GRANTED': return '✅'
      case 'ROLE_SWITCH': return '🔄'
      default: return '📝'
    }
  }

  return (
    <div className="audit-log-container">
      <h2 className="text-2xl font-bold mb-6">🔮 奧術權限審計日誌</h2>
      
      {/* 統計卡片 */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-number">{stats.totalEvents || 0}</div>
          <div className="stat-label">總事件數</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-green-600">{stats.permissionGranted || 0}</div>
          <div className="stat-label">權限通過</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-red-600">{stats.permissionDenied || 0}</div>
          <div className="stat-label">權限拒絕</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-blue-600">{stats.roleSwitches || 0}</div>
          <div className="stat-label">角色切換</div>
        </div>
      </div>

      {/* 篩選器 */}
      <div className="filter-section mb-4">
        <div className="filter-grid">
          <select 
            value={filter.type} 
            onChange={(e) => setFilter({...filter, type: e.target.value})}
            className="filter-select"
          >
            <option value="">所有事件類型</option>
            <option value="PERMISSION_DENIED">權限拒絕</option>
            <option value="PERMISSION_GRANTED">權限通過</option>
            <option value="ROLE_SWITCH">角色切換</option>
          </select>
          
          <input 
            type="date" 
            value={filter.startDate}
            onChange={(e) => setFilter({...filter, startDate: e.target.value})}
            className="filter-input"
            placeholder="開始日期"
          />
          
          <input 
            type="date" 
            value={filter.endDate}
            onChange={(e) => setFilter({...filter, endDate: e.target.value})}
            className="filter-input"
            placeholder="結束日期"
          />
        </div>
      </div>

      {/* 審計日誌列表 */}
      <div className="audit-logs">
        {loading ? (
          <div className="loading">載入中...</div>
        ) : auditLogs.length === 0 ? (
          <div className="no-data">暫無審計記錄</div>
        ) : (
          <div className="logs-list">
            {auditLogs.map((log) => (
              <div key={log.id} className="log-item">
                <div className="log-header">
                  <span className={`log-type ${getEventColor(log.type)}`}>
                    {getEventIcon(log.type)} {log.type}
                  </span>
                  <span className="log-time">{formatTime(log.timestamp)}</span>
                </div>
                
                <div className="log-details">
                  {log.path && (
                    <div className="log-path">
                      <strong>路徑:</strong> {log.path}
                    </div>
                  )}
                  
                  {log.oldRole && log.newRole && (
                    <div className="log-role-switch">
                      <strong>角色切換:</strong> {log.oldRole} → {log.newRole}
                    </div>
                  )}
                  
                  {log.userId && (
                    <div className="log-user">
                      <strong>用戶ID:</strong> {log.userId}
                    </div>
                  )}
                  
                  {log.userAgent && (
                    <div className="log-user-agent">
                      <strong>用戶代理:</strong> {log.userAgent}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .audit-log-container {
          padding: 20px;
          max-width: 100%;
          margin: 0 auto;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }
        
        .filter-section {
          background: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .filter-select,
        .filter-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .logs-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .log-item {
          background: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .log-type {
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .log-time {
          color: #666;
          font-size: 0.9rem;
        }
        
        .log-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .log-path,
        .log-role-switch,
        .log-user,
        .log-user-agent {
          font-size: 0.9rem;
        }
        
        .loading,
        .no-data {
          text-align: center;
          padding: 40px;
          color: #666;
        }
      `}</style>
    </div>
  )
}

export default AuditLog 