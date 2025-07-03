import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 日記データをSupabase形式に変換する関数
 * @param diaryEntry ローカルの日記データ
 * @param userId ユーザーID
 * @returns Supabase形式の日記データ
 */
export function formatDiaryForSupabase(diaryEntry: any, userId: string) {
  const formattedEntry = {
    id: diaryEntry.id,
    user_id: diaryEntry.user_id || userId, // user_idが存在する場合はそれを使用、ない場合はuserIdを使用
    date: diaryEntry.date,
    emotion: diaryEntry.emotion,
    event: diaryEntry.event,
    realization: diaryEntry.realization,
    self_esteem_score: 
      typeof diaryEntry.selfEsteemScore === 'number' ? diaryEntry.selfEsteemScore : 
      (typeof diaryEntry.selfEsteemScore === 'string' && diaryEntry.selfEsteemScore !== '' ? parseInt(diaryEntry.selfEsteemScore) : 
       (typeof diaryEntry.self_esteem_score === 'number' ? diaryEntry.self_esteem_score : 
        (typeof diaryEntry.self_esteem_score === 'string' && diaryEntry.self_esteem_score !== '' ? parseInt(diaryEntry.self_esteem_score) : 50))),
    worthlessness_score: 
      typeof diaryEntry.worthlessnessScore === 'number' ? diaryEntry.worthlessnessScore : 
      (typeof diaryEntry.worthlessnessScore === 'string' && diaryEntry.worthlessnessScore !== '' ? parseInt(diaryEntry.worthlessnessScore) : 
       (typeof diaryEntry.worthlessness_score === 'number' ? diaryEntry.worthlessness_score : 
        (typeof diaryEntry.worthlessness_score === 'string' && diaryEntry.worthlessness_score !== '' ? parseInt(diaryEntry.worthlessness_score) : 50))),
    created_at: diaryEntry.created_at || new Date().toISOString()
  }
  
  // assigned_counselorフィールドが存在する場合のみ追加
  if (diaryEntry.assigned_counselor !== undefined || diaryEntry.assignedCounselor !== undefined) {
    formattedEntry.assigned_counselor = diaryEntry.assigned_counselor !== undefined ? 
                                        diaryEntry.assigned_counselor : 
                                        diaryEntry.assignedCounselor || '';
  }
  
  // urgency_levelフィールドが存在する場合のみ追加
  if (diaryEntry.urgency_level !== undefined || diaryEntry.urgencyLevel !== undefined) {
    // 緊急度の値を取得して設定
    let urgencyValue = diaryEntry.urgency_level !== undefined ? 
                      diaryEntry.urgency_level : 
                      diaryEntry.urgencyLevel || '';
                      
    // 許可された値のみを設定（high, medium, low、または空文字列）
    if (urgencyValue !== 'high' && urgencyValue !== 'medium' && urgencyValue !== 'low' && urgencyValue !== '') {
      // 無効な値の場合は空文字列に設定
      console.warn(`無効な緊急度の値: ${urgencyValue}、空に設定します`);
      urgencyValue = '';
    }
    
    formattedEntry.urgency_level = urgencyValue;
  }
  
  // is_visible_to_userフィールドが存在する場合のみ追加
  if (diaryEntry.is_visible_to_user !== undefined || diaryEntry.isVisibleToUser !== undefined) {
    formattedEntry.is_visible_to_user = diaryEntry.is_visible_to_user !== undefined ? 
                                        diaryEntry.is_visible_to_user : 
                                        diaryEntry.isVisibleToUser;
  }
  
  // counselor_nameフィールドが存在する場合のみ追加
  if (diaryEntry.counselor_name !== undefined || diaryEntry.counselorName !== undefined) {
    formattedEntry.counselor_name = diaryEntry.counselor_name !== undefined ? 
                                    diaryEntry.counselor_name : 
                                    diaryEntry.counselorName;
  }
  
  // counselor_memoフィールドが存在する場合のみ追加
  if (diaryEntry.counselor_memo !== undefined || diaryEntry.counselorMemo !== undefined) {
    formattedEntry.counselor_memo = diaryEntry.counselor_memo !== undefined ? 
                                    diaryEntry.counselor_memo : 
                                    diaryEntry.counselorMemo;
  }
  
  // NULL値を空文字列に変換
  if (formattedEntry.counselor_memo === null || formattedEntry.counselor_memo === undefined) {
    formattedEntry.counselor_memo = '';
  }
  
  if (formattedEntry.counselor_name === null || formattedEntry.counselor_name === undefined) {
    formattedEntry.counselor_name = '';
  }
  
  if (formattedEntry.assigned_counselor === null || formattedEntry.assigned_counselor === undefined) {
    formattedEntry.assigned_counselor = '';
  }
  
  if (formattedEntry.urgency_level === null || formattedEntry.urgency_level === undefined) {
    formattedEntry.urgency_level = '';
  }
  
  // is_visible_to_userがNULLの場合はfalseに設定
  if (formattedEntry.is_visible_to_user === null || formattedEntry.is_visible_to_user === undefined) {
    formattedEntry.is_visible_to_user = false;
  }
  
  return formattedEntry;
}

/**
 * Supabaseデータをローカル形式に変換する関数
 * @param supabaseEntry Supabaseの日記データ
 * @returns ローカル形式の日記データ
 */
export function formatDiaryForLocal(supabaseEntry: any) {
  return {
    id: supabaseEntry.id,
    user_id: supabaseEntry.user_id,
    date: supabaseEntry.date,
    emotion: supabaseEntry.emotion,
    event: supabaseEntry.event,
    realization: supabaseEntry.realization,
    selfEsteemScore: supabaseEntry.self_esteem_score || 0,
    worthlessnessScore: supabaseEntry.worthlessness_score || 0,
    counselor_memo: supabaseEntry.counselor_memo || '', 
    is_visible_to_user: supabaseEntry.is_visible_to_user || false,
    counselor_name: supabaseEntry.counselor_name || '',
    assigned_counselor: supabaseEntry.assigned_counselor || null,
    urgency_level: supabaseEntry.urgency_level || null,
    created_at: supabaseEntry.created_at || new Date().toISOString(),
    user: supabaseEntry.users || { line_username: 'Unknown User' }
  };
}