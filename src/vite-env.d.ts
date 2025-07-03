/// <reference types="vite/client" />

// グローバルオブジェクトの型定義
interface Window {
  // SupabaseクライアントとautoSyncをwindowオブジェクトに追加
  supabase: import('@supabase/supabase-js').SupabaseClient | null;
  autoSync: {
    triggerManualSync: () => Promise<boolean>;
    syncDeleteDiary: (diaryId: string) => Promise<boolean>;
    syncBulkDeleteDiaries: (diaryIds: string[]) => Promise<boolean>;
  } | null;
}