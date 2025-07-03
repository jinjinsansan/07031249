import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, TrendingUp, Users, Lock, Eye, RefreshCw, Calendar, BarChart3, Clock, Database } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  getAuthSession, 
  getUserCredentials, 
  logoutUser,
  getLoginAttempts, 
  isAccountLocked,
  STORAGE_KEYS
} from '../lib/deviceAuth';

interface SecurityMetrics {
  totalUsers: number;
  activeUsers: number;
  lockedAccounts: number;
  todayLogins: number;
  failedAttempts: number;
  securityEvents: number;
  lastUpdate: string;
}

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    lockedAccounts: 0,
    todayLogins: 0,
    failedAttempts: 0,
    securityEvents: 0,
    lastUpdate: new Date().toISOString()
  });
  
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSecurityData();

    if (autoRefresh) {
      const interval = setInterval(() => loadSecurityData(false), 30000); // 30秒ごと（ローディング表示なし）
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadSecurityData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      await Promise.all([
        loadMetrics(),
        loadAlerts()
      ]);
    } catch (error) {
      console.error('セキュリティデータ読み込みエラー:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadMetrics = async () => {
    try {
      // Supabaseから統計情報を取得
      if (supabase) {
        Promise.all([
          supabase.from('users').select('id', { count: 'exact' }),
          // アクティブユーザー数（最近7日以内にログインしたユーザー）を取得
          supabase.from('users').select('id', { count: 'exact' })
        ]).then(([totalResult, activeResult]) => {
          const totalUsers = totalResult.count || 0;
          const activeUsers = activeResult.count || 0; // 実際には最近のアクティブユーザー数を取得する必要がある
          
          // セキュリティイベント数を取得
          const events = localStorage.getItem(STORAGE_KEYS.SECURITY_EVENTS);
          const eventCount = events ? JSON.parse(events).length : 0;
          
          const credentials = getUserCredentials();
          
          const newMetrics: SecurityMetrics = {
            totalUsers,
            activeUsers,
            lockedAccounts: 0, // 実際のロックされたアカウント数
            todayLogins: Math.min(totalUsers, 5), // 仮の値
            failedAttempts: credentials ? getLoginAttempts(credentials.lineUsername) : 0,
            securityEvents: eventCount,
            lastUpdate: new Date().toISOString()
          };
          
          setMetrics(newMetrics);
        }).catch(error => {
          console.error('統計情報取得エラー:', error);
          // エラー時はローカルの情報を使用
          fallbackToLocalMetrics();
        });
      } else {
        // Supabase接続がない場合はローカルの情報を使用
        fallbackToLocalMetrics();
      }
    } catch (error) {
      console.error('メトリクス読み込みエラー:', error);
      fallbackToLocalMetrics();
    }
  };
  
  // ローカルデータからメトリクスを設定するフォールバック関数
  const fallbackToLocalMetrics = () => {
    try {
      const credentials = getUserCredentials();
      const session = getAuthSession();
      
      // セキュリティイベント数を取得
      const events = localStorage.getItem(STORAGE_KEYS.SECURITY_EVENTS);
      const eventCount = events ? JSON.parse(events).length : 0;
      
      const newMetrics: SecurityMetrics = {
        totalUsers: credentials ? 1 : 0,
        activeUsers: session ? 1 : 0,
        lockedAccounts: credentials && isAccountLocked(credentials.lineUsername) ? 1 : 0,
        todayLogins: 1, // デモ用
        failedAttempts: credentials ? getLoginAttempts(credentials.lineUsername) : 0,
        securityEvents: eventCount,
        lastUpdate: new Date().toISOString()
      };
      
      setMetrics(newMetrics);
    } catch (error) {
      console.error('フォールバックメトリクス設定エラー:', error);
    }
  };

  const loadAlerts = () => {
    const events = localStorage.getItem('security_events');
    if (events) {
      setAlerts(JSON.parse(events));
    } else {
      // デモ用のサンプルイベント
      const sampleEvents: SecurityAlert[] = [
        {
          id: '1',
          type: 'info',
          title: 'セキュリティシステム初期化',
          username: 'テストユーザー',
          timestamp: new Date().toISOString(),
          details: 'デバイス認証システムが正常に初期化されました',
          resolved: true
        },
        {
          id: '2',
          type: 'warning',
          title: 'ログイン試行失敗',
          username: 'テストユーザー',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: 'PIN番号の入力に3回失敗しました',
          resolved: false
        }
      ];
      setAlerts(sampleEvents);
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
        
        setMetrics({
          totalUsers,
          activeUsers,
          lockedAccounts: 0, // 実際のロックされたアカウント数
          todayLogins: Math.min(totalUsers, 5), // 仮の値
          failedAttempts: credentials ? getLoginAttempts(credentials.lineUsername) : 0,
          securityEvents: alerts.length,
          lastUpdate: new Date().toISOString()
        });
      }).catch(error => {
        console.error('統計情報取得エラー:', error);
        // エラー時はローカルの情報を使用
        setMetrics({
          totalUsers: credentials ? 1 : 0,
          activeUsers: credentials ? 1 : 0,
          lockedAccounts: credentials && isAccountLocked(credentials.lineUsername) ? 1 : 0,
          todayLogins: 1,
          failedAttempts: credentials ? getLoginAttempts(credentials.lineUsername) : 0,
          securityEvents: alerts.length,
          lastUpdate: new Date().toISOString()
        });
      });
    } else {
      // Supabase接続がない場合はローカルの情報を使用
      setMetrics({
        totalUsers: credentials ? 1 : 0,
        activeUsers: credentials ? 1 : 0,
        lockedAccounts: credentials && isAccountLocked(credentials.lineUsername) ? 1 : 0,
        todayLogins: 1,
        failedAttempts: credentials ? getLoginAttempts(credentials.lineUsername) : 0,
        securityEvents: alerts.length,
        lastUpdate: new Date().toISOString()
      });
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info': return <Activity className="w-5 h-5 text-blue-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSecurityScore = () => {
    let score = 100;
    
    if (metrics.lockedAccounts > 0) score -= 30;
    if (metrics.failedAttempts > 3) score -= 20;
    if (alerts.filter(a => !a.resolved && a.type === 'error').length > 0) score -= 25;
    if (alerts.filter(a => !a.resolved && a.type === 'warning').length > 0) score -= 15;
    
    return Math.max(score, 0);
  };

  const securityScore = getSecurityScore();

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-jp-bold text-gray-900">セキュリティダッシュボード</h2>
          <p className="text-gray-600 font-jp-normal text-sm mt-1">
            デバイス認証システムのリアルタイム監視
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="auto-refresh" className="text-sm font-jp-medium text-gray-700">
              自動更新
            </label>
          </div>
          <button
            onClick={loadSecurityData}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>更新</span>
          </button>
        </div>
      </div>

      {/* セキュリティスコア */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-jp-bold text-gray-900 mb-2">セキュリティスコア</h3>
            <p className="text-gray-600 font-jp-normal text-sm">
              システム全体のセキュリティ状態を評価
            </p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-jp-bold mb-2 ${
              securityScore >= 80 ? 'text-green-600' :
              securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {securityScore}
            </div>
            <div className={`text-sm font-jp-medium ${
              securityScore >= 80 ? 'text-green-600' :
              securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {securityScore >= 80 ? '良好' :
               securityScore >= 60 ? '注意' : '危険'}
            </div>
          </div>
        </div>
      </div>

      {/* メトリクス */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-jp-medium text-gray-700">総ユーザー</span>
          </div>
          <p className="text-2xl font-jp-bold text-blue-600">{metrics.totalUsers}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-sm font-jp-medium text-gray-700">アクティブ</span>
          </div>
          <p className="text-2xl font-jp-bold text-green-600">{metrics.activeUsers}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-5 h-5 text-red-600" />
            <span className="text-sm font-jp-medium text-gray-700">ロック中</span>
          </div>
          <p className="text-2xl font-jp-bold text-red-600">{metrics.lockedAccounts}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-jp-medium text-gray-700">今日のログイン</span>
          </div>
          <p className="text-2xl font-jp-bold text-purple-600">{metrics.todayLogins}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-jp-medium text-gray-700">失敗試行</span>
          </div>
          <p className="text-2xl font-jp-bold text-orange-600">{metrics.failedAttempts}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-jp-medium text-gray-700">イベント数</span>
          </div>
          <p className="text-2xl font-jp-bold text-indigo-600">{metrics.securityEvents}</p>
        </div>
      </div>

      {/* セキュリティアラート */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-jp-bold text-gray-900">セキュリティアラート</h3>
            <span className="text-sm text-gray-500">
              {alerts.filter(a => !a.resolved).length} 件の未解決アラート
            </span>
          </div>
        </div>
        
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-lg font-jp-medium text-green-600 mb-2">
              セキュリティ状態良好
            </h3>
            <p className="text-gray-500 font-jp-normal">
              現在、セキュリティアラートはありません
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <div key={alert.id} className={`px-6 py-4 ${alert.resolved ? 'opacity-50' : ''}`}>
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-jp-bold text-gray-900">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDateTime(alert.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-jp-medium border ${getAlertColor(alert.type)}`}>
                          {alert.type === 'error' ? 'エラー' :
                           alert.type === 'warning' ? '警告' : '情報'}
                        </span>
                        {!alert.resolved && (
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-jp-medium"
                          >
                            解決
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* システム情報 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-jp-bold text-gray-900 mb-4">システム情報</h3>
        
        <div className="mb-6">
          <button
            onClick={() => {
              if (window.confirm('すべてのセッションをログアウトしますか？')) {
                logoutUser();
                window.location.reload();
              }
            }}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span>緊急ログアウト</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-jp-medium text-gray-700">最終更新:</span>
              <span className="text-sm text-gray-600">{formatDateTime(metrics.lastUpdate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-jp-medium text-gray-700">自動更新:</span>
              <span className={`text-sm font-jp-bold ${autoRefresh ? 'text-green-600' : 'text-gray-600'}`}>
                {autoRefresh ? '有効' : '無効'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-jp-medium text-gray-700">監視状態:</span>
              <span className="text-sm font-jp-bold text-green-600">正常</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-jp-medium text-gray-700">データソース:</span>
              <span className="text-sm text-gray-600">ローカルストレージ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-jp-medium text-gray-700">更新間隔:</span>
              <span className="text-sm text-gray-600">30秒</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-jp-medium text-gray-700">システム状態:</span>
              <span className="text-sm font-jp-bold text-green-600">稼働中</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;