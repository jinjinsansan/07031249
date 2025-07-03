import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 日記エントリーをSupabase形式に変換する関数
export function formatDiaryForSupabase(entry: any, userId: string) {
  // 必須フィールドのみを含める
  const formattedEntry = {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    emotion: entry.emotion,
    event: entry.event || '',
    realization: entry.realization || '',
    self_esteem_score: typeof entry.selfEsteemScore === 'number' ? entry.selfEsteemScore : 
                      (typeof entry.selfEsteemScore === 'string' ? parseInt(entry.selfEsteemScore) : 
                       (typeof entry.self_esteem_score === 'number' ? entry.self_esteem_score : 
                        (typeof entry.self_esteem_score === 'string' ? parseInt(entry.self_esteem_score) : 50))),
    worthlessness_score: typeof entry.worthlessnessScore === 'number' ? entry.worthlessnessScore : 
                        (typeof entry.worthlessnessScore === 'string' ? parseInt(entry.worthlessnessScore) : 
                         (typeof entry.worthlessness_score === 'number' ? entry.worthlessness_score : 
                          (typeof entry.worthlessness_score === 'string' ? parseInt(entry.worthlessness_score) : 50))),
    created_at: entry.created_at || new Date().toISOString()
  };
  
  // オプションフィールドは存在する場合のみ追加
  const optionalFields = {
    assigned_counselor: entry.assigned_counselor || entry.assignedCounselor || '',
    urgency_level: entry.urgency_level || entry.urgencyLevel || '',
    is_visible_to_user: entry.is_visible_to_user !== undefined ? entry.is_visible_to_user : 
                       (entry.isVisibleToUser !== undefined ? entry.isVisibleToUser : false),
    counselor_name: entry.counselor_name || entry.counselorName || '',
    counselor_memo: entry.counselor_memo || entry.counselorMemo || ''
  };
  
  // 値が存在するフィールドのみを追加
  for (const [key, value] of Object.entries(optionalFields)) {
    if (value !== undefined) {
      formattedEntry[key] = value;
    }
  }
  
  return formattedEntry;
}