import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, AlertTriangle, Tag, ChevronDown, ChevronUp, RotateCcw, Download, Eye, Trash2, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SearchFilters {
  keyword: string;
  emotion: string;
  urgency: string;
  counselor: string;
  dateRange: {
    start: string;
    end: string;
  };
  userSearch: string;
  hasNotes: boolean | null;
  scoreRange: {
    selfEsteemMin: number;
    selfEsteemMax: number;
    worthlessnessMin: number;
    worthlessnessMax: number;
  };
}

interface JournalEntry {
  id: string;
  date: string;
  emotion: string;
  event: string;
  realization: string;
  self_esteem_score?: number;
  selfEsteemScore?: number;
  worthlessness_score?: number;
  worthlessnessScore?: number;
  created_at: string;
  user?: {
    line_username: string;
  };
  assigned_counselor?: string;
  assignedCounselor?: string;
  urgency_level?: 'high' | 'medium' | 'low';
  urgencyLevel?: 'high' | 'medium' | 'low';
  counselor_memo?: string;
  counselorMemo?: string;
  is_visible_to_user?: boolean;
  isVisibleToUser?: boolean;
  counselor_name?: string;
  counselorName?: string;
  syncStatus?: string;
}

interface AdvancedSearchFilterProps {
  entries: JournalEntry[];
  onFilteredResults: (filtered: JournalEntry[]) => void;
  onViewEntry: (entry: JournalEntry) => void; 
  onDeleteEntry?: (entryId: string) => void;
}

const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  entries,
  onFilteredResults,
  onViewEntry,
  onDeleteEntry
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    emotion: '',
    urgency: '',
    counselor: '',
    dateRange: {
      start: '',
      end: ''
    },
    userSearch: '',
    hasNotes: null,
    scoreRange: {
      selfEsteemMin: 1,
      selfEsteemMax: 100,
      worthlessnessMin: 1,
      worthlessnessMax: 100
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>(entries);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // 日記ページと同じ感情リスト
  const negativeEmotions = [
    '恐怖', '悲しみ', '怒り', '悔しい', '無価値感', '罪悪感', '寂しさ', '恥ずかしさ'
  ];
  
  const positiveEmotions = [
    '嬉しい', '感謝', '達成感', '幸せ'
  ];
  
  // 全ての感情を結合
  const emotions = [...negativeEmotions, ...positiveEmotions];

  const urgencyLevels = [
    { value: 'high', label: '高', color: 'text-red-600' },
    { value: 'medium', label: '中', color: 'text-yellow-600' },
    { value: 'low', label: '低', color: 'text-green-600' }
  ];

  // 初期化時にエントリーを設定
  useEffect(() => {
    setFilteredEntries(entries);
  }, [entries]);

  // 管理者モードの場合はSupabaseから検索
  const handleSearch = () => {
    if (isAdminMode) {
      console.log('管理者モードで検索を実行します');
      setSearchLoading(true);
      searchAllDiaries();
    } else {
      console.log('通常モードで検索を実行します');
      // 通常モードでは既存のフィルタリングロジックを使用
      filterEntries();
    }
  };

  // フィルタリング処理を関数として抽出
  const filterEntries = () => {
    let filtered = [...entries];

    // キーワード検索
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(entry =>
        (entry.event && entry.event.toLowerCase().includes(keyword)) ||
        (entry.realization && entry.realization.toLowerCase().includes(keyword)) ||
        ((entry.counselor_memo || entry.counselorMemo) && 
         ((entry.counselor_memo && entry.counselor_memo.toLowerCase().includes(keyword)) || 
          (entry.counselorMemo && entry.counselorMemo.toLowerCase().includes(keyword))))
      );
    }

    // 感情フィルター
    if (filters.emotion) {
      filtered = filtered.filter(entry => entry.emotion === filters.emotion);
    }

    // 緊急度フィルター
    if (filters.urgency) {
      filtered = filtered.filter(entry => 
        entry.urgency_level === filters.urgency || entry.urgencyLevel === filters.urgency
      );
    }

    // カウンセラーフィルター
    if (filters.counselor) {
      filtered = filtered.filter(entry => 
        entry.assigned_counselor === filters.counselor || entry.assignedCounselor === filters.counselor
      );
    }

    // 日付範囲フィルター
    if (filters.dateRange.start) {
      filtered = filtered.filter(entry => entry.date >= filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(entry => entry.date <= filters.dateRange.end);
    }

    // ユーザー検索
    if (filters.userSearch) {
      const userKeyword = filters.userSearch.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.user?.line_username?.toLowerCase().includes(userKeyword)
      );
    }

    // メモの有無フィルター
    if (filters.hasNotes !== null) {
      filtered = filtered.filter(entry => {
        const hasNotes = (entry.counselor_memo && entry.counselor_memo.trim().length > 0) || 
                         (entry.counselorMemo && entry.counselorMemo.trim().length > 0);
        return filters.hasNotes ? hasNotes : !hasNotes;
      });
    }

    // スコア範囲フィルター
    filtered = filtered.filter(entry => {
      const selfEsteemScore = entry.self_esteem_score || entry.selfEsteemScore || 50;
      const worthlessnessScore = entry.worthlessness_score || entry.worthlessnessScore || 50;
      
      return selfEsteemScore >= filters.scoreRange.selfEsteemMin &&
             selfEsteemScore <= filters.scoreRange.selfEsteemMax &&
             worthlessnessScore >= filters.scoreRange.worthlessnessMin &&
             worthlessnessScore <= filters.scoreRange.worthlessnessMax;
    });

    setFilteredEntries(filtered);
    onFilteredResults(filtered);
  };

  // Supabaseから全ての日記を検索する関数
  const searchAllDiaries = async () => {
    try {
      setSupabaseError(null);
      console.log('Supabaseから日記を検索します');
      
      if (!supabase) {
        console.error('Supabase接続がありません');
        setSupabaseError('Supabase接続がありません');
        setSearchLoading(false);
        return;
      }
      
      let query = supabase
        .from('diary_entries')
        .select(`
          *,
          users (
            line_username
          )
        `);

      // 検索条件を適用
      if (filters.keyword) {
        const keyword = filters.keyword;
        query = query.or(`event.ilike.%${keyword}%,realization.ilike.%${keyword}%,counselor_memo.ilike.%${keyword}%`);
      }
      
      if (filters.emotion) {
        query = query.eq('emotion', filters.emotion);
      }
      
      // 日付範囲フィルター
      if (filters.dateRange.start) {
        query = query.gte('date', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        query = query.lte('date', filters.dateRange.end);
      }
      
      // ユーザー検索
      if (filters.userSearch.trim()) {
        query = query.ilike('users.line_username', `%${filters.userSearch.trim()}%`);
      }

      // 緊急度フィルター
      if (filters.urgency) {
        query = query.eq('urgency_level', filters.urgency);
      }

      // カウンセラーフィルター
      if (filters.counselor) {
        query = query.eq('assigned_counselor', filters.counselor);
      }

      // メモの有無フィルター
      if (filters.hasNotes !== null) {
        if (filters.hasNotes) {
          query = query.not('counselor_memo', 'is', null).not('counselor_memo', 'eq', '');
        } else {
          query = query.or('counselor_memo.is.null,counselor_memo.eq.');
        }
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Supabase検索エラー:', error);
        setSupabaseError(`検索エラー: ${error.message}`);
        setFilteredEntries([]);
        onFilteredResults([]);
        return;
      }
      
      // 検索結果を処理して表示
      if (data && data.length > 0) {
        console.log(`Supabaseから${data.length}件の日記を取得しました`);
        const formattedResults = data.map(item => ({
          id: item.id,
          date: item.date,
          emotion: item.emotion,
          event: item.event,
          realization: item.realization,
          self_esteem_score: item.self_esteem_score,
          worthlessness_score: item.worthlessness_score,
          created_at: item.created_at,
          user: item.users,
          assigned_counselor: item.assigned_counselor,
          urgency_level: item.urgency_level,
          counselor_memo: item.counselor_memo,
          is_visible_to_user: item.is_visible_to_user,
          counselor_name: item.counselor_name
        }));
        
        setFilteredEntries(formattedResults);
        onFilteredResults(formattedResults);
      } else {
        console.log('検索結果が0件でした');
        setFilteredEntries([]);
        onFilteredResults([]);
      }
      
    } catch (error) {
      console.error('検索エラー:', error);
      setSupabaseError(`検索処理エラー: ${error instanceof Error ? error.message : String(error)}`);
      setFilteredEntries([]);
      onFilteredResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // フィルタリング処理
  useEffect(() => {
    if (isAdminMode) return; // 管理者モードの場合はローカルフィルタリングをスキップ
    filterEntries();
  }, [filters, entries, isAdminMode]);

  // フィルターリセット
  const resetFilters = () => {
    setFilters({
      keyword: '',
      emotion: '',
      urgency: '',
      counselor: '',
      dateRange: {
        start: '',
        end: ''
      },
      userSearch: '',
      hasNotes: null,
      scoreRange: {
        selfEsteemMin: 1,
        selfEsteemMax: 100,
        worthlessnessMin: 1,
        worthlessnessMax: 100
      }
    });
  };

  // 検索結果のエクスポート
  const exportResults = () => {
    const csvContent = [
      ['日付', '感情', '出来事', '気づき', '自尊心スコア', '無価値感スコア', 'ユーザー', 'カウンセラー', '緊急度', 'メモ'],
      ...filteredEntries.map(entry => [
        entry.date,
        entry.emotion,
        entry.event,
        entry.realization,
        entry.self_esteem_score || entry.selfEsteemScore || '',
        entry.worthlessness_score || entry.worthlessnessScore || '',
        entry.user?.line_username || '',
        entry.assigned_counselor || entry.assignedCounselor || '',
        entry.urgency_level || entry.urgencyLevel || '',
        entry.counselor_memo || entry.counselorMemo || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `journal_search_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ユニークなカウンセラーリストを取得
  const uniqueCounselors = [...new Set(
    entries
      .map(entry => entry.assigned_counselor || entry.assignedCounselor)
      .filter(Boolean)
  )];

  // 感情に対応する背景色を取得
  const getEmotionColor = (emotion: string) => {
    const colorMap: { [key: string]: string } = {
      // ネガティブな感情
      '恐怖': 'bg-purple-100 text-purple-800 border-purple-200',
      '悲しみ': 'bg-blue-100 text-blue-800 border-blue-200',
      '怒り': 'bg-red-100 text-red-800 border-red-200',
      '悔しい': 'bg-green-100 text-green-800 border-green-200',
      '無価値感': 'bg-gray-100 text-gray-800 border-gray-300',
      '罪悪感': 'bg-orange-100 text-orange-800 border-orange-200',
      '寂しさ': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      '恥ずかしさ': 'bg-pink-100 text-pink-800 border-pink-200',
      // ポジティブな感情
      '嬉しい': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '感謝': 'bg-teal-100 text-teal-800 border-teal-200',
      '達成感': 'bg-lime-100 text-lime-800 border-lime-200',
      '幸せ': 'bg-amber-100 text-amber-800 border-amber-200'
    };
    return colorMap[emotion] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* 検索フィルター */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-jp-bold text-gray-900 flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            高度検索フィルター
          </h3>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={isAdminMode}
                onChange={(e) => setIsAdminMode(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-jp-medium">管理者モード</span>
            </label>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-jp-medium"
            >
              <Filter className="w-4 h-4" />
              <span>詳細フィルター</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 基本検索 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-jp-medium text-gray-700 mb-1">キーワード検索</label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              placeholder="出来事、気づき、メモから検索..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
            />
          </div>

          <div>
            <label className="block text-sm font-jp-medium text-gray-700 mb-1">感情</label>
            <select
              value={filters.emotion}
              onChange={(e) => setFilters(prev => ({ ...prev, emotion: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
            >
              <option value="">すべての感情</option>
              {emotions.map(emotion => (
                <option key={emotion} value={emotion}>{emotion}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-jp-medium text-gray-700 mb-1">緊急度</label>
            <select
              value={filters.urgency}
              onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
            >
              <option value="">すべての緊急度</option>
              {urgencyLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 詳細フィルター */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-1">担当カウンセラー</label>
                <select
                  value={filters.counselor}
                  onChange={(e) => setFilters(prev => ({ ...prev, counselor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                >
                  <option value="">すべてのカウンセラー</option>
                  {uniqueCounselors.map(counselor => (
                    <option key={counselor} value={counselor}>{counselor}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-1">ユーザー検索</label>
                <input
                  type="text"
                  value={filters.userSearch}
                  onChange={(e) => setFilters(prev => ({ ...prev, userSearch: e.target.value }))}
                  placeholder="ユーザー名で検索..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                />
              </div>

              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-1">メモの有無</label>
                <select
                  value={filters.hasNotes === null ? '' : filters.hasNotes.toString()}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    hasNotes: e.target.value === '' ? null : e.target.value === 'true' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                >
                  <option value="">すべて</option>
                  <option value="true">メモあり</option>
                  <option value="false">メモなし</option>
                </select>
              </div>
            </div>

            {/* 日付範囲 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  開始日
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value } 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                />
              </div>
              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  終了日
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value } 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                />
              </div>
            </div>

            {/* スコア範囲 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">自尊心スコア範囲</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters.scoreRange.selfEsteemMin}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      scoreRange: { ...prev.scoreRange, selfEsteemMin: parseInt(e.target.value) } 
                    }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-jp-normal w-8">{filters.scoreRange.selfEsteemMin}</span>
                  <span className="text-sm text-gray-500">〜</span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters.scoreRange.selfEsteemMax}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      scoreRange: { ...prev.scoreRange, selfEsteemMax: parseInt(e.target.value) } 
                    }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-jp-normal w-8">{filters.scoreRange.selfEsteemMax}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">無価値感スコア範囲</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters.scoreRange.worthlessnessMin}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      scoreRange: { ...prev.scoreRange, worthlessnessMin: parseInt(e.target.value) } 
                    }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-jp-normal w-8">{filters.scoreRange.worthlessnessMin}</span>
                  <span className="text-sm text-gray-500">〜</span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters.scoreRange.worthlessnessMax}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      scoreRange: { ...prev.scoreRange, worthlessnessMax: parseInt(e.target.value) } 
                    }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-jp-normal w-8">{filters.scoreRange.worthlessnessMax}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm font-jp-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>リセット</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportResults}
              className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-jp-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>エクスポート</span>
            </button>
            <button
              onClick={handleSearch}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-jp-medium transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>検索</span>
            </button>
          </div>
        </div>
      </div>

      {/* 検索結果 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-jp-bold text-gray-900">検索結果</h3>
          <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 text-sm text-gray-600">
            {searchLoading ? (
              <div className="flex items-center space-x-2">
                <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                <span>検索中...</span>
              </div>
            ) : (
              <>
                <span>表示: {filteredEntries.length}件</span>
                {filteredEntries.length !== entries.length && (
                  <span>/ 全体: {entries.length}件</span>
                )}
              </>
            )}
            {supabaseError && (
              <div className="text-red-600 text-xs">
                {supabaseError}
              </div>
            )}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-jp-normal">検索条件に一致する日記が見つかりませんでした。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                entry.emotion === '恐怖' ? 'bg-purple-50' :
                entry.emotion === '悲しみ' ? 'bg-blue-50' :
                entry.emotion === '怒り' ? 'bg-red-50' :
                entry.emotion === '悔しい' ? 'bg-green-50' :
                entry.emotion === '無価値感' ? 'bg-gray-50' :
                entry.emotion === '罪悪感' ? 'bg-orange-50' :
                entry.emotion === '寂しさ' ? 'bg-indigo-50' :
                entry.emotion === '恥ずかしさ' ? 'bg-pink-50' :
                entry.emotion === '嬉しい' ? 'bg-yellow-50' :
                entry.emotion === '感謝' ? 'bg-teal-50' :
                entry.emotion === '達成感' ? 'bg-lime-50' :
                entry.emotion === '幸せ' ? 'bg-amber-50' :
                'bg-white'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-jp-medium text-gray-900">{entry.date}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-jp-medium border ${getEmotionColor(entry.emotion)}`}>
                      {entry.emotion}
                    </span>
                    {entry.syncStatus && (
                      <span className={`px-2 py-1 rounded-full text-xs font-jp-medium ${
                        entry.syncStatus === 'supabase' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {entry.syncStatus === 'supabase' ? 'Supabase' : 'ローカル'}
                      </span>
                    )}
                    {(entry.urgency_level || entry.urgencyLevel) && (
                      <span className={`px-2 py-1 rounded-full text-xs font-jp-medium ${
                        (entry.urgency_level || entry.urgencyLevel) === 'high' ? 'bg-red-100 text-red-800' :
                        (entry.urgency_level || entry.urgencyLevel) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {urgencyLevels.find(l => l.value === (entry.urgency_level || entry.urgencyLevel))?.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {entry.user?.line_username && (
                      <span className="text-xs text-gray-500 font-jp-normal flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {entry.user.line_username}
                      </span>
                    )}
                    {(entry.self_esteem_score || entry.selfEsteemScore || entry.worthlessness_score || entry.worthlessnessScore) && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Tag className="w-3 h-3" />
                        <span>自己肯定感: {entry.self_esteem_score || entry.selfEsteemScore || 'N/A'}</span>
                        <span>無価値感: {entry.worthlessness_score || entry.worthlessnessScore || 'N/A'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-jp-medium text-gray-700">出来事: </span>
                    <span className="text-sm text-gray-900 font-jp-normal">{entry.event}</span>
                  </div>
                  <div>
                    <span className="text-sm font-jp-medium text-gray-700">気づき: </span>
                    <span className="text-sm text-gray-900 font-jp-normal">{entry.realization}</span>
                  </div>
                  {(entry.counselor_memo || entry.counselorMemo) && (
                    <div className="bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                      <span className="text-sm font-jp-medium text-gray-700">カウンセラーメモ: </span>
                      <span className="text-sm text-gray-900 font-jp-normal">{entry.counselor_memo || entry.counselorMemo}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-jp-normal">
                      {entry.assigned_counselor || entry.assignedCounselor || '未割り当て'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onViewEntry(entry)}
                        className="text-blue-600 hover:text-blue-700 p-1 cursor-pointer"
                        title="詳細を見る"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {onDeleteEntry && (
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearchFilter;