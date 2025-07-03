import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Supabaseクライアントの作成
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isLocalMode = import.meta.env.VITE_LOCAL_MODE === 'true';

// ローカルモードの場合はsupabaseをnullに設定
export const supabase = !isLocalMode && supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// ユーザーサービス
export const userService = {
  // ユーザーの作成または取得
  async createOrGetUser(lineUsername: string) {
    if (!supabase) return null;
    
    try {
      // 既存のユーザーを検索
      const { data: existingUsers, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('line_username', lineUsername)
        .limit(1);
      
      if (searchError) {
        console.error('ユーザー検索エラー:', searchError);
        throw searchError;
      }
      
      // 既存のユーザーが見つかった場合はそれを返す
      if (existingUsers && existingUsers.length > 0) {
        return existingUsers[0];
      }
      
      // 新しいユーザーを作成
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ line_username: lineUsername }])
        .select()
        .single();
      
      if (createError) {
        console.error('ユーザー作成エラー:', createError);
        throw createError;
      }
      
      return newUser;
    } catch (error) {
      console.error('ユーザー作成/取得エラー:', error);
      throw error;
    }
  }
};

// 日記サービス
export const diaryService = {
  // 日記の同期
  async syncDiaries(userId: string, diaries: any[]) {
    if (!supabase) {
      console.log('ローカルモードで動作中: Supabase接続なし、同期をスキップします');
      return { success: true, error: null };
    }
    
    try {
      // 日記データの検証
      const validDiaries = diaries.filter(entry => {
        // 必須フィールドの検証
        if (!entry || !entry.id || !entry.date || !entry.emotion) {
          console.warn('無効なエントリーをスキップ:', entry);
          return false;
        }
        
        // スコアフィールドの検証
        if (entry.self_esteem_score === null || entry.self_esteem_score === undefined) {
          entry.self_esteem_score = 50;
          console.log('NULL self_esteem_score を 50 に設定:', entry.id);
        }
        
        if (entry.worthlessness_score === null || entry.worthlessness_score === undefined) {
          entry.worthlessness_score = 50;
          console.log('NULL worthlessness_score を 50 に設定:', entry.id);
        }
        
        // urgency_levelの検証
        if (entry.urgency_level && entry.urgency_level !== '' && 
            !['high', 'medium', 'low'].includes(entry.urgency_level)) {
          entry.urgency_level = '';
        }
        
        return true;
      });
      
      // 空の文字列をデフォルト値に設定
      validDiaries.forEach(entry => {
        entry.event = entry.event || '';
        entry.realization = entry.realization || '';
        entry.counselor_memo = entry.counselor_memo || '';
        entry.counselor_name = entry.counselor_name || '';
        entry.assigned_counselor = entry.assigned_counselor || '';
        entry.is_visible_to_user = entry.is_visible_to_user === undefined ? false : entry.is_visible_to_user;
      });
      
      if (validDiaries.length === 0) {
        console.log('有効な日記データがありません');
        return { success: true, error: null };
      }
      
      console.log(`${validDiaries.length}件の有効な日記データを同期します`);
      
      // 日記データをSupabaseに同期
      const { error } = await supabase
        .from('diary_entries')
        .upsert(validDiaries, {
          onConflict: 'id',
          ignoreDuplicates: true // 重複エラーを無視
        });
      
      if (error) {
        console.error('日記同期エラー:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('日記同期エラー:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '不明なエラー' 
      };
    }
  }
};

// チャットサービス
export const chatService = {
  // チャットメッセージの取得
  async getChatMessages(chatRoomId: string) {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('メッセージ取得エラー:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('メッセージ取得エラー:', error);
      return [];
    }
  },
  
  // メッセージの送信
  async sendMessage(chatRoomId: string, content: string, senderId?: string, counselorId?: string) {
    if (!supabase) return null;
    
    try {
      const isCounselor = !!counselorId;
      
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          chat_room_id: chatRoomId,
          sender_id: senderId,
          counselor_id: counselorId,
          content,
          is_counselor: isCounselor
        }])
        .select()
        .single();
      
      if (error) {
        console.error('メッセージ送信エラー:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      return null;
    }
  }
};

// 同意履歴サービス
export const consentService = {
  // 同意履歴の取得
  async getAllConsentHistories() {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('consent_histories')
        .select('*')
        .order('consent_date', { ascending: false });
      
      if (error) {
        console.error('同意履歴取得エラー:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('同意履歴取得エラー:', error);
      return [];
    }
  },
  
  // 同意履歴の追加
  async addConsentHistory(consentRecord: any) {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('consent_histories')
        .insert([consentRecord])
        .select()
        .single();
      
      if (error) {
        console.error('同意履歴追加エラー:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('同意履歴追加エラー:', error);
      return null;
    }
  }
};

// 同期サービス
export const syncService = {
  // 同意履歴の同期
  async syncConsentHistories() {
    if (!supabase) return false;
    
    try {
      // ローカルストレージから同意履歴を取得
      const savedHistories = localStorage.getItem('consent_histories');
      if (!savedHistories) return true; // 同期するデータがない場合は成功とみなす
      
      const histories = JSON.parse(savedHistories);
      if (!Array.isArray(histories) || histories.length === 0) return true;
      
      // Supabaseに同期
      const { error } = await supabase
        .from('consent_histories')
        .upsert(histories, {
          onConflict: 'id',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error('同意履歴同期エラー:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('同意履歴同期エラー:', error);
      return false;
    }
  },
  
  // 同意履歴をローカルに同期
  async syncConsentHistoriesToLocal() {
    if (!supabase) return false;
    
    try {
      // Supabaseから同意履歴を取得
      const { data, error } = await supabase
        .from('consent_histories')
        .select('*')
        .order('consent_date', { ascending: false });
      
      if (error) {
        console.error('同意履歴取得エラー:', error);
        return false;
      }
      
      if (data) {
        // ローカルストレージに保存
        localStorage.setItem('consent_histories', JSON.stringify(data));
      }
      
      return true;
    } catch (error) {
      console.error('同意履歴同期エラー:', error);
      return false;
    }
  }
};

export default supabase;