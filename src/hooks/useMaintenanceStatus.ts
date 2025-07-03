import { useState, useEffect } from 'react';
import { getAuthSession } from '../lib/deviceAuth';

interface MaintenanceConfig {
  isEnabled: boolean;
  message: string;
  endTime?: string;
  type: 'scheduled' | 'emergency' | 'completed';
  progress?: number;
  estimatedDuration?: string;
  affectedFeatures?: string[];
  contactInfo?: string;
}

interface MaintenanceStatus {
  isMaintenanceMode: boolean;
  isAdminBypass: boolean;
  config: MaintenanceConfig | null;
  loading: boolean;
  error: string | null;
}

export const useMaintenanceStatus = () => {
  const [status, setStatus] = useState<MaintenanceStatus>({
    isMaintenanceMode: false,
    isAdminBypass: false,
    config: null,
    loading: true,
    error: null
  });

  const checkMaintenanceStatus = async (showLoading = false) => {
    try {
      // 管理者バイパスチェック
      const isAdmin = checkAdminStatus();
      
      setStatus(prev => ({ ...prev, loading: showLoading, error: null }));

      // 1. 環境変数をチェック
      const envMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
      const envMaintenanceMessage = import.meta.env.VITE_MAINTENANCE_MESSAGE || 'システムメンテナンス中です';
      const envMaintenanceEndTime = import.meta.env.VITE_MAINTENANCE_END_TIME;

      if (envMaintenanceMode) {
        setStatus(prev => ({
          ...prev,
          isMaintenanceMode: true,
          isAdminBypass: isAdmin,
          config: {
            isEnabled: true,
            message: envMaintenanceMessage,
            endTime: envMaintenanceEndTime,
            type: 'scheduled',
            estimatedDuration: '約30分',
            affectedFeatures: ['日記作成', '検索機能', 'データ同期'],
            contactInfo: 'info@namisapo.com'
          },
          loading: false
        }));
        return;
      }

      // 2. リモート設定をチェック（Supabase Functions経由）
      try {
        const response = await fetch('/api/maintenance-status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const remoteConfig = await response.json();
          if (remoteConfig.isEnabled) {
            setStatus(prev => ({
              isMaintenanceMode: true,
              isAdminBypass: isAdmin,
              config: remoteConfig,
              loading: false,
              error: null
            }));
            return;
          }
        }
      } catch (remoteError) {
        console.log('リモート設定の取得に失敗しました（環境変数を使用）:', remoteError);
      }

      // 3. ローカル設定をチェック（開発・テスト用）
      const localConfig = localStorage.getItem('maintenance_config');
      if (localConfig) {
        try {
          const parsedConfig = JSON.parse(localConfig);
          if (parsedConfig.isEnabled) {
            setStatus({
              isAdminBypass: isAdmin,
              isMaintenanceMode: true,              
              config: parsedConfig,
              loading: false,
              error: null
            });
            return;
          }
        } catch (parseError) {
          console.error('ローカル設定の解析に失敗:', parseError);
        }
      }

      // 4. メンテナンスモードではない
      setStatus(prev => ({
        ...prev,
        isAdminBypass: false,
        isMaintenanceMode: false,        
        config: null,
        loading: false
      }));

    } catch (error) {
      console.error('メンテナンス状態の確認に失敗:', error);
      setStatus(prev => ({
        isMaintenanceMode: false,
        isAdminBypass: false,        
        config: null,
        loading: false,
        error: error instanceof Error ? error.message : '不明なエラー'
      }));
    }
  };

  // 管理者ステータスをチェック
  const checkAdminStatus = (): boolean => {
    try {
      // 1. 現在のカウンセラー名をチェック
      const currentCounselor = localStorage.getItem('current_counselor');
      if (currentCounselor) {
        return true;
      }
      
      // 2. 認証セッションをチェック
      const session = getAuthSession();
      if (session) {
        // 管理者ユーザー名リスト（実際の実装ではデータベースから取得するべき）
        const adminUsernames = [
          'jin@namisapo.com',
          'aoi@namisapo.com',
          'asami@namisapo.com',
          'shu@namisapo.com',
          'yucha@namisapo.com',
          'sammy@namisapo.com'
        ];
        
        // ユーザー名が管理者リストに含まれているかチェック
        if (adminUsernames.includes(session.lineUsername)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('管理者ステータスチェックエラー:', error);
      return false;
    }
  };

  // 定期的にメンテナンス状態をチェック
  useEffect(() => {
    // 初回は loading 状態を表示
    checkMaintenanceStatus(true);

    // 30秒ごとにバックグラウンドでチェック（loading状態は変更しない）
    const interval = setInterval(() => checkMaintenanceStatus(false), 30000);

    return () => clearInterval(interval);
  }, []);

  // 手動でステータスを更新
  const refreshStatus = () => {
    checkMaintenanceStatus(true);
  };

  // 開発・テスト用：ローカルでメンテナンスモードを設定
  const setLocalMaintenanceMode = (config: MaintenanceConfig) => {
    localStorage.setItem('maintenance_config', JSON.stringify(config));
    
    // 管理者バイパスを設定
    const isAdmin = checkAdminStatus();
        
    // 状態を更新
    setStatus(prev => ({
      ...prev,
      isMaintenanceMode: true,
      isAdminBypass: isAdmin,
      config
    }));
    
    checkMaintenanceStatus(true);
  };

  // 開発・テスト用：ローカルメンテナンスモードを解除
  const clearLocalMaintenanceMode = () => {
    localStorage.removeItem('maintenance_config');
    checkMaintenanceStatus(true);
  };

  return {
    ...status,
    refreshStatus,
    setLocalMaintenanceMode,
    clearLocalMaintenanceMode
  };
};