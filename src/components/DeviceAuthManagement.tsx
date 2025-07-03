import React, { useState, useEffect } from 'react';
import { Shield, Users, AlertTriangle, Eye, Trash2, RefreshCw, Download, Search, Filter, Calendar, Lock, Unlock, UserX, Activity, BarChart3, TrendingUp, Clock, Database } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  getAuthSession, 
  getUserCredentials, 
  getSecurityQuestions, 
  getLoginAttempts, 
  isAccountLocked,
  resetLoginAttempts,
  lockAccount,
  clearAuthSession,
  STORAGE_KEYS
} from '../lib/deviceAuth';

interface DeviceAuthUser {
  lineUsername: string;
  deviceId: string;
  createdAt: string;
  lastActivity: string;
  loginAttempts: number;
  isLocked: boolean;
  hasSecurityQuestions: boolean;
}

interface SecurityEvent {
  id: string;
  type: 'login_success' | 'login_failed' | 'account_locked' | 'security_question_used' | 'device_registered';
  username: string;
  timestamp: string;
  details: string;
}

const DeviceAuthManagement: React.FC = () => {
  const [users, setUsers] = useState<DeviceAuthUser[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<DeviceAuthUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    todayLogins: 0,
    failedAttempts: 0
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 30000); // 30秒ごとに更新（ローディング表示なし）
    return () => clearInterval(interval);
  }, []);

  const loadData = (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      loadUsers();
      loadSecurityEvents();
      calculateStats();
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadUsers = async () => {
    const usersList: DeviceAuthUser[] = [];
    
    try {
      // 管理者モードの場合はSupabaseから全ユーザーを取得
      if (supabase) {
        const { data: supabaseUsers, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabaseからのユーザー取得エラー:', error);
        } else if (supabaseUsers && supabaseUsers.length > 0) {
          console.log(`Supabaseから${supabaseUsers.length}人のユーザーを取得しました`);
          
          // Supabaseから取得したユーザーをリストに追加
          supabaseUsers.forEach(user => {
            usersList.push({
              lineUsername: user.line_username,
              deviceId: user.id, // ユーザーIDをデバイスIDとして使用
              createdAt: user.created_at,
              lastActivity: user.created_at, // 最終活動時間はcreated_atを使用
              loginAttempts: 0, // デフォルト値
              isLocked: false, // デフォルト値
              hasSecurityQuestions: false // デフォルト値
            });
          });
          
          setUsers(usersList);
          return;
        }
      }
      
      // Supabaseからの取得に失敗した場合はローカルストレージから取得
      console.log('ローカルストレージからユーザーデータを取得します');
      
      // ローカルストレージから全ユーザーデータを収集
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key === STORAGE_KEYS.USER_CREDENTIALS) {
          const credentials = getUserCredentials();
          if (credentials) {
            const session = getAuthSession();
            const loginAttempts = getLoginAttempts(credentials.lineUsername);
            const locked = isAccountLocked(credentials.lineUsername);
            const securityQuestions = getSecurityQuestions();
            
            usersList.push({
              lineUsername: credentials.lineUsername,
              deviceId: credentials.deviceId,
              createdAt: credentials.createdAt,
              lastActivity: session?.lastActivity || credentials.createdAt,
              loginAttempts,
              isLocked: locked,
              hasSecurityQuestions: securityQuestions.length > 0
            });
          }
        }
      }
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error);
    }
    
    setUsers(usersList);
  };

  const loadSecurityEvents = () => {
    const events = localStorage.getItem('security_events');
    if (events) {
      setSecurityEvents(JSON.parse(events));
    } else {
      // デモ用のサンプルイベント
      const sampleEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'login_success',
          username: 'テストユーザー',
          timestamp: new Date().toISOString(),
          details: 'デバイス認証によるログイン成功'
        },
        {
          id: '2',
          type: 'device_registered',
          username: 'テストユーザー',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: '新しいデバイスが登録されました'
        }
      ];
      setSecurityEvents(sampleEvents);
    }
  };

  const calculateStats = () => {
    const credentials = getUserCredentials();
    
    // Supabaseから統計情報を取得
    if (supabase) {
      Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        // アクティブユーザー数（最近7日以内にログインしたユーザー）を取得
        supabase.from('users').select('id', { count: 'exact' })
      ]).then(([totalResult, activeResult]) => {
        const totalUsers = totalResult.count || 0;
        const activeUsers = activeResult.count || 0; // 実際には最近のアクティブユーザー数を取得する必要がある
        
        setStats({
          totalUsers,
          activeUsers,
          lockedUsers: 0, // 実際のロックされたアカウント数
          todayLogins: Math.min(totalUsers, 5), // 仮の値
          failedAttempts: credentials ? getLoginAttempts(credentials.lineUsername) : 0
        });
      }).catch(error => {
        console.error('統計情報取得エラー:', error);
        // エラー時はローカルの情報を使用
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter(u => !u.isLocked).length,
          lockedUsers: users.filter(u => u.isLocked).length,
          todayLogins: Math.min(users.length, 3),
          failedAttempts: credentials ? getLoginAttempts(credentials.lineUsername) : 0
        });
      });
    } else {
      // Supabase接続がない場合はローカルの情報を使用
      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => !u.isLocked).length,
        lockedUsers: users.filter(u => u.isLocked).length,
        todayLogins: Math.min(users.length, 3),
        failedAttempts: credentials ? getLoginAttempts(credentials.lineUsername) : 0
      });
    }
  };

  const handleUserAction = (action: string, user: DeviceAuthUser) => {
    switch (action) {
      case 'unlock':
        resetLoginAttempts(user.lineUsername);
        localStorage.removeItem(`${STORAGE_KEYS.ACCOUNT_LOCKED}_${user.lineUsername}`);
        addSecurityEvent('account_unlocked', user.lineUsername, 'アカウントロックが解除されました');
        break;
      case 'lock':
        lockAccount(user.lineUsername);
        addSecurityEvent('account_locked', user.lineUsername, '管理者によりアカウントがロックされました');
        break;
      case 'reset_attempts':
        resetLoginAttempts(user.lineUsername);
        addSecurityEvent('attempts_reset', user.lineUsername, 'ログイン試行回数がリセットされました');
        break;
      case 'force_logout':
        clearAuthSession();
        addSecurityEvent('force_logout', user.lineUsername, '管理者により強制ログアウトされました');
        window.location.reload(); // 強制ログアウト後にページをリロード
        break;
    }
    loadData();
  };

  const addSecurityEvent = (type: string, username: string, details: string) => {
    const newEvent: SecurityEvent = {
      id: Date.now().toString(),
      type: type as any,
      username,
      timestamp: new Date().toISOString(),
      details
    };
    
    const events = [...securityEvents, newEvent];
    setSecurityEvents(events);
    localStorage.setItem('security_events', JSON.stringify(events));
  };

  const exportData = () => {
    const data = {
      users: users.map(user => ({
        ...user,
        deviceId: user.deviceId.substring(0, 8) + '...' // デバイスIDを短縮して表示
      })),
      securityEvents,
      stats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `device-auth-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.lineUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user =>
        statusFilter === 'locked' ? user.isLocked : !user.isLocked
      );
    }
    
    return filtered;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      login_success: 'bg-green-100 text-green-800 border-green-200',
      login_failed: 'bg-red-100 text-red-800 border-red-200',
      account_locked: 'bg-orange-100 text-orange-800 border-orange-200',
      security_question_used: 'bg-blue-100 text-blue-800 border-blue-200',
      device_registered: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEventTypeLabel = (type: string) => {
    const labels = {
      login_success: 'ログイン成功',
      login_failed: 'ログイン失敗',
      account_locked: 'アカウントロック',
      security_question_used: '秘密の質問使用',
      device_registered: 'デバイス登録'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const renderUserDetailsModal = () => {
    if (!selectedUser || !showUserDetails) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-jp-bold text-gray-900">ユーザー詳細</h2>
              <button
                onClick={() => setShowUserDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-jp-bold text-gray-900 mb-2">基本情報</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ユーザー名:</span>
                      <span className="font-jp-medium">{selectedUser.lineUsername}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">デバイスID:</span>
                      <span className="font-mono text-xs">{selectedUser.deviceId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">登録日:</span>
                      <span>{formatDateTime(selectedUser.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">最終活動:</span>
                      <span>{formatDateTime(selectedUser.lastActivity)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-jp-bold text-gray-900 mb-2">セキュリティ状態</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ログイン試行:</span>
                      <span className={`font-jp-bold ${selectedUser.loginAttempts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedUser.loginAttempts}/5
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">アカウント状態:</span>
                      <span className={`font-jp-bold ${selectedUser.isLocked ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedUser.isLocked ? 'ロック中' : 'アクティブ'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">秘密の質問:</span>
                      <span className={`font-jp-bold ${selectedUser.hasSecurityQuestions ? 'text-green-600' : 'text-orange-600'}`}>
                        {selectedUser.hasSecurityQuestions ? '設定済み' : '未設定'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h3 className="font-jp-bold text-gray-900 mb-3">管理操作</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedUser.isLocked ? (
                    <button
                      onClick={() => handleUserAction('unlock', selectedUser)}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>ロック解除</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUserAction('lock', selectedUser)}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      <span>アカウントロック</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleUserAction('reset_attempts', selectedUser)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>試行回数リセット</span>
                  </button>
                  
                  <button
                    onClick={() => handleUserAction('force_logout', selectedUser)}
                    className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
                  >
                    <UserX className="w-4 h-4" />
                    <span>強制ログアウト</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-jp-bold text-gray-900">デバイス認証管理</h2>
          <p className="text-gray-600 font-jp-normal text-sm mt-1">
            デバイス認証システムの監視と管理
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>更新</span>
          </button>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>エクスポート</span>
          </button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-jp-medium text-gray-700">総ユーザー数</span>
          </div>
          <p className="text-2xl font-jp-bold text-blue-600 mt-1">{stats.totalUsers}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-sm font-jp-medium text-gray-700">アクティブ</span>
          </div>
          <p className="text-2xl font-jp-bold text-green-600 mt-1">{stats.activeUsers}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-red-600" />
            <span className="text-sm font-jp-medium text-gray-700">ロック中</span>
          </div>
          <p className="text-2xl font-jp-bold text-red-600 mt-1">{stats.lockedUsers}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-jp-medium text-gray-700">今日のログイン</span>
          </div>
          <p className="text-2xl font-jp-bold text-purple-600 mt-1">{stats.todayLogins}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-jp-medium text-gray-700">失敗試行</span>
          </div>
          <p className="text-2xl font-jp-bold text-orange-600 mt-1">{stats.failedAttempts}</p>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ユーザー名、デバイスIDで検索"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
            >
              <option value="all">すべて</option>
              <option value="active">アクティブ</option>
              <option value="locked">ロック中</option>
            </select>
          </div>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-jp-bold text-gray-900">登録ユーザー</h3>
        </div>
        
        {getFilteredUsers().length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-jp-medium text-gray-500 mb-2">
              ユーザーが見つかりません
            </h3>
            <p className="text-gray-400 font-jp-normal">
              検索条件を変更するか、新しいユーザーの登録をお待ちください
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    デバイス情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    セキュリティ状態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    最終活動
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredUsers().map((user) => (
                  <tr key={user.deviceId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.isLocked ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          <Shield className={`w-5 h-5 ${
                            user.isLocked ? 'text-red-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-jp-medium text-gray-900">
                            {user.lineUsername}
                          </div>
                          <div className="text-sm text-gray-500">
                            登録: {formatDateTime(user.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-mono text-xs bg-gray-100 rounded px-2 py-1">
                          {user.deviceId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-jp-medium ${
                          user.isLocked
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isLocked ? 'ロック中' : 'アクティブ'}
                        </span>
                        <div className="text-xs text-gray-500">
                          試行: {user.loginAttempts}/5
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(user.lastActivity)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-jp-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="詳細"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* セキュリティイベント */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-jp-bold text-gray-900">セキュリティイベント</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {securityEvents.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-jp-medium text-gray-500 mb-2">
                イベントがありません
              </h3>
              <p className="text-gray-400 font-jp-normal">
                セキュリティイベントが発生すると表示されます
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {securityEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-jp-medium border ${getEventTypeColor(event.type)}`}>
                      {getEventTypeLabel(event.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-jp-medium text-gray-900">
                            {event.username}
                          </p>
                          <p className="text-sm text-gray-600">
                            {event.details}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ユーザー詳細モーダル */}
      {renderUserDetailsModal()}
    </div>
  );
};

export default DeviceAuthManagement;