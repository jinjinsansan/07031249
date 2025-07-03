import { supabase } from './supabase';

// テストデータを削除する関数
export const cleanupTestData = async (): Promise<{
  localRemoved: number;
  supabaseRemoved: number;
  success: boolean;
}> => {
  try {
    // ローカルストレージからのテストデータ削除
    let localRemoved = 0;
    const savedEntries = localStorage.getItem('journalEntries');
    
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      if (Array.isArray(entries)) {
        // テストデータの特徴を持つエントリーをフィルタリング
        const filteredEntries = entries.filter(entry => {
          // テストデータの特徴（例: 特定のキーワードを含む）
          const isTestData = 
            (entry.event && entry.event.includes('テスト')) || 
            (entry.realization && entry.realization.includes('テスト')) ||
            (entry.event && entry.event.includes('サンプル')) ||
            (entry.realization && entry.realization.includes('サンプル')) ||
            (entry.event && entry.event.includes('test')) ||
            (entry.realization && entry.realization.includes('test'));
          
          // テストデータでない場合は保持
          return !isTestData;
        });
        
        // 削除されたエントリー数を計算
        localRemoved = entries.length - filteredEntries.length;
        
        // フィルタリングされたエントリーを保存
        localStorage.setItem('journalEntries', JSON.stringify(filteredEntries));
      }
    }
    
    // Supabaseからのテストデータ削除
    let supabaseRemoved = 0;
    
    if (supabase) {
      try {
        // テストデータの特徴を持つエントリーを削除
        const { data, error } = await supabase
          .from('diary_entries')
          .delete()
          .or('event.ilike.%テスト%,realization.ilike.%テスト%,event.ilike.%サンプル%,realization.ilike.%サンプル%,event.ilike.%test%,realization.ilike.%test%')
          .select();
        
        if (error) {
          console.error('Supabaseテストデータ削除エラー:', error);
        } else if (data) {
          supabaseRemoved = data.length;
        }
      } catch (error) {
        console.error('Supabaseテストデータ削除エラー:', error);
      }
    }
    
    return {
      localRemoved,
      supabaseRemoved,
      success: true
    };
  } catch (error) {
    console.error('テストデータ削除エラー:', error);
    return {
      localRemoved: 0,
      supabaseRemoved: 0,
      success: false
    };
  }
};

// すべての日記データを削除する関数
export const deleteAllDiaries = async (): Promise<{
  localRemoved: number;
  supabaseRemoved: number;
  success: boolean;
}> => {
  try {
    // ローカルストレージからの削除
    let localRemoved = 0;
    const savedEntries = localStorage.getItem('journalEntries');
    
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      if (Array.isArray(entries)) {
        localRemoved = entries.length;
        // 空の配列で上書き
        localStorage.setItem('journalEntries', JSON.stringify([]));
      }
    }
    
    // Supabaseからの削除
    let supabaseRemoved = 0;
    
    if (supabase) {
      try {
        // 現在のユーザーのIDを取得
        const lineUsername = localStorage.getItem('line-username');
        if (lineUsername) {
          // ユーザーIDを取得
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('line_username', lineUsername)
            .single();
          
          if (userError) {
            console.error('ユーザー取得エラー:', userError);
          } else if (userData) {
            // ユーザーの日記を削除
            const { data, error } = await supabase
              .from('diary_entries')
              .delete()
              .eq('user_id', userData.id)
              .select();
            
            if (error) {
              console.error('Supabase日記削除エラー:', error);
            } else if (data) {
              supabaseRemoved = data.length;
            }
          }
        }
      } catch (error) {
        console.error('Supabase日記削除エラー:', error);
      }
    }
    
    return {
      localRemoved,
      supabaseRemoved,
      success: true
    };
  } catch (error) {
    console.error('日記削除エラー:', error);
    return {
      localRemoved: 0,
      supabaseRemoved: 0,
      success: false
    };
  }
};

// 重複エントリーを削除する関数
export const removeDuplicateEntries = async (): Promise<{
  localRemoved: number;
  supabaseRemoved: number;
  success: boolean;
}> => {
  try {
    // ローカルストレージからの重複削除
    let localRemoved = 0;
    const savedEntries = localStorage.getItem('journalEntries');
    
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      if (Array.isArray(entries)) {
        // 重複チェック用のマップ
        const uniqueMap = new Map();
        const uniqueEntries = [];
        
        for (const entry of entries) {
          // 重複チェック用のキーを作成（日付+感情+内容の先頭50文字）
          const key = `${entry.date}_${entry.emotion}_${entry.event?.substring(0, 50)}`;
          
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, entry);
            uniqueEntries.push(entry);
          }
        }
        
        // 削除された重複数
        localRemoved = entries.length - uniqueEntries.length;
        
        // 重複を除去したエントリーを保存
        localStorage.setItem('journalEntries', JSON.stringify(uniqueEntries));
      }
    }
    
    // Supabaseからの重複削除
    let supabaseRemoved = 0;
    
    if (supabase) {
      try {
        // 重複を検出して削除するSQL関数を実行
        const { data, error } = await supabase.rpc('remove_duplicate_diary_entries');
        
        if (error) {
          console.error('Supabase重複削除エラー:', error);
        } else if (data) {
          supabaseRemoved = data;
        }
      } catch (error) {
        console.error('Supabase重複削除エラー:', error);
      }
    }
    
    return {
      localRemoved,
      supabaseRemoved,
      success: true
    };
  } catch (error) {
    console.error('重複削除エラー:', error);
    return {
      localRemoved: 0,
      supabaseRemoved: 0,
      success: false
    };
  }
};