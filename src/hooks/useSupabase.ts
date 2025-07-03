import { useState, useEffect, useCallback } from 'react';
import { supabase, userService } from '../lib/supabase';
import { getCurrentUser } from '../lib/deviceAuth';

interface SupabaseState {
  isConnected: boolean;
  error: string | null;
  currentUser: any | null;
  retryConnection: () => void;
  initializeUser: () => Promise<void>;
}

export const useSupabase = (): SupabaseState => {
  const [isConnected, setIsConnected] = useState<boolean>(!!supabase);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  
  // Supabase接続の確認
  const checkConnection = useCallback(async () => {
    if (!supabase) {
      setIsConnected(false);
      setError('ローカルモードで動作中: Supabase接続なし');
      return;
    }
    
    try {
      // 簡単な接続テスト
      const { error } = await supabase.from('users').select('id').limit(1);
      
      if (error) {
        console.error('Supabase接続エラー:', error);
        setIsConnected(false);
        setError(`Supabase接続エラー: ${error.message}`);
      } else {
        setIsConnected(true);
        setError(null);
      }
    } catch (err) {
      console.error('Supabase接続確認エラー:', err);
      setIsConnected(false);
      setError('Supabase接続に失敗しました');
    }
  }, []);
  
  // ユーザー情報の初期化
  const initializeUser = useCallback(async () => {
    if (!supabase) {
      console.log('ローカルモードで動作中: ユーザー初期化をスキップ');
      return;
    }
    
    try {
      // 現在のユーザーを取得
      const user = getCurrentUser();
      if (!user) {
        console.log('ユーザーがログインしていません');
        return;
      }
      
      // Supabaseでユーザーを作成または取得
      const supabaseUser = await userService.createOrGetUser(user.lineUsername);
      if (supabaseUser) {
        setCurrentUser(supabaseUser);
        console.log('ユーザー初期化完了:', supabaseUser.line_username);
      }
    } catch (error) {
      console.error('ユーザー初期化エラー:', error);
      setError('ユーザー初期化に失敗しました');
    }
  }, []);
  
  // 初期化
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);
  
  // 接続の再試行
  const retryConnection = useCallback(() => {
    checkConnection();
  }, [checkConnection]);
  
  return {
    isConnected,
    error,
    currentUser,
    retryConnection,
    initializeUser
  };
};