import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, X, Eye, Edit3, Trash2, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCurrentUser } from '../lib/deviceAuth';
import dayjs from 'dayjs';

interface JournalEntry {
  id: string;
  date: string;
  emotion: string;
  event: string;
  realization: string;
  selfEsteemScore: number;
  worthlessnessScore: number;
  counselor_memo?: string;
  is_visible_to_user?: boolean;
  counselor_name?: string;
}

const DiarySearchPage: React.FC = () => {
  const currentUser = getCurrentUser();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchType, setSearchType] = useState<'date' | 'keyword' | 'emotion'>('keyword');
  const [searchValue, setSearchValue] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editFormData, setEditFormData] = useState({
    date: '',
    emotion: '', 
    event: '',
    realization: '',
    selfEsteemScore: 50,
    worthlessnessScore: 50
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [syncing, setSyncing] = useState(false);

  const emotions = [
    // ネガティブな感情
    '恐怖', '悲しみ', '怒り', '悔しい', '無価値感', '罪悪感', '寂しさ', '恥ずかしさ',
    // ポジティブな感情
    '嬉しい', '感謝', '達成感', '幸せ'
  ];

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setSyncing(true);
    
    try {
      // ローカルストレージからデータを取得
      const savedEntries = localStorage.getItem('journalEntries');
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries);
        setEntries(parsedEntries);
        
        // 直近5日分の日記を取得
        const sortedEntries = [...parsedEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentEntries(sortedEntries.slice(0, 10));
        
        console.log('ローカルストレージからデータを読み込みました');
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // 検索条件に基づいてエントリーをフィルタリング
    let filtered = [...entries];

    if (searchType === 'keyword' && searchValue.trim()) {
      filtered = filtered.filter(entry => 
        entry.event.toLowerCase().includes(searchValue.toLowerCase()) ||
        entry.realization.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (searchType === 'emotion' && selectedEmotion) {
      filtered = filtered.filter(entry => entry.emotion === selectedEmotion);
    }

    if (searchType === 'date') {
      if (dateRange.start) {
        filtered = filtered.filter(entry => entry.date >= dateRange.start);
      }
      if (dateRange.end) {
        filtered = filtered.filter(entry => entry.date <= dateRange.end);
      }
    }

    // 日付順でソート（新しい順）
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredEntries(filtered);
  }, [entries, searchType, searchValue, selectedEmotion, dateRange]);

  const clearSearch = () => {
    setSearchValue('');
    setSelectedEmotion('');
    setDateRange({ start: '', end: '' });
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setEditFormData({
      date: entry.date,
      emotion: entry.emotion,
      event: entry.event,
      realization: entry.realization,
      selfEsteemScore: entry.selfEsteemScore,
      worthlessnessScore: entry.worthlessnessScore
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    setSyncing(true);

    try {
      const updatedEntry = {
        ...editingEntry,
        ...editFormData
      };

      // ローカルストレージのデータを更新
      const updatedEntries = entries.map(entry => 
        entry.id === editingEntry.id ? updatedEntry : entry
      );
      
      setEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      
      // 直近の日記も更新
      const sortedEntries = [...updatedEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentEntries(sortedEntries.slice(0, 5));
      
      setEditingEntry(null);
      alert('日記を更新しました！');
      
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました。もう一度お試しください。');
    } finally {
      setSyncing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditFormData({
      date: '',
      emotion: '',
      event: '',
      realization: '',
      selfEsteemScore: 50,
      worthlessnessScore: 50
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('この日記を削除しますか？')) {
      return;
    }

    setSyncing(true);

    try {
      // 1. ローカルストレージからの削除
      const savedEntries = localStorage.getItem('journalEntries');
      if (savedEntries) {
        const entries = JSON.parse(savedEntries);
        const updatedEntries = entries.filter((entry: any) => entry.id !== id);
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        
        // 2. Supabaseからの削除
        if (window.autoSync && typeof window.autoSync.syncDeleteDiary === 'function') {
          const syncResult = await window.autoSync.syncDeleteDiary(id);
          if (!syncResult) {
            console.warn('Supabaseとの同期に失敗しましたが、ローカルデータは削除されました');
          }
        } else {
          console.warn('自動同期機能が利用できないため、ローカルデータのみ削除されました');
        }
        
        // 3. UI表示の更新
        setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
        
        // 直近の日記も更新
        const sortedEntries = [...updatedEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentEntries(sortedEntries.slice(0, 5));
        
        alert('日記を削除しました！');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました。もう一度お試しください。');
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // 無効な日付の場合は元の文字列を返す
    if (isNaN(date.getTime())) {
      return dateString || '日付なし';
    }
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日 (${dayOfWeek})`;
  };

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

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim() || searchType !== 'keyword') return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const generateCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return { days, firstDay, lastDay };
  };

  const handleDateSelect = (selectedDate: Date) => {
    const dateString = selectedDate.toISOString().split('T')[0];
    setEditFormData({...editFormData, date: dateString});
    setShowCalendar(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCalendarDate(newDate);
  };

  // 編集モーダル
  const renderEditModal = () => {
    if (!editingEntry) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-jp-bold text-gray-900">日記を編集</h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 日付選択 */}
            <div className="mb-6">
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                日付
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 font-jp-normal hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors w-full justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(editFormData.date)}</span>
                  </div>
                </button>

                {/* カレンダーポップアップ */}
                {showCalendar && (
                  <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-80 max-w-[calc(100vw-2rem)]">
                    {/* カレンダーヘッダー */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => navigateMonth('prev')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <h3 className="font-jp-bold text-gray-900">
                        {calendarDate.getFullYear()}年{calendarDate.getMonth() + 1}月
                      </h3>
                      <button
                        onClick={() => navigateMonth('next')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    {/* 曜日ヘッダー */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                        <div key={day} className="text-center text-xs font-jp-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* カレンダー日付 */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendar(calendarDate).days.map((day, index) => {
                        const isCurrentMonth = day.getMonth() === calendarDate.getMonth();
                        const isSelected = day.toISOString().split('T')[0] === editFormData.date;
                        const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleDateSelect(day)}
                            className={`
                              w-8 h-8 text-xs font-jp-normal rounded transition-colors
                              ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                              ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                              ${isToday && !isSelected ? 'bg-blue-100 text-blue-600' : ''}
                            `}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    {/* 閉じるボタン */}
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setShowCalendar(false)}
                        className="text-sm text-gray-500 hover:text-gray-700 font-jp-normal"
                      >
                        閉じる
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 感情選択 */}
            <div className="mb-6">
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                感情
              </label>
              <div className="grid grid-cols-2 gap-2">
                {emotions.map((emotion) => (
                  <label
                    key={emotion}
                    className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                      editFormData.emotion === emotion
                        ? getEmotionColor(emotion) + ' shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="emotion"
                      value={emotion}
                      checked={editFormData.emotion === emotion}
                      onChange={(e) => setEditFormData({...editFormData, emotion: e.target.value})}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="font-jp-medium text-sm">
                      {emotion}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 出来事 */}
            <div className="mb-6">
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                出来事
              </label>
              <textarea
                value={editFormData.event}
                onChange={(e) => setEditFormData({...editFormData, event: e.target.value})}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal resize-none"
                placeholder="嫌な気持ちになった出来事を書いてください..."
              />
            </div>

            {/* 気づき */}
            <div className="mb-6">
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                今日の小さな気づき
              </label>
              <textarea
                value={editFormData.realization}
                onChange={(e) => setEditFormData({...editFormData, realization: e.target.value})}
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal resize-none"
                placeholder="小さな気づきを書いてください..."
              />
            </div>

            {/* 無価値感スコア（無価値感を選んだ場合のみ） */}
            {(editFormData.emotion === '無価値感' || 
              editFormData.emotion === '嬉しい' || 
              editFormData.emotion === '感謝' || 
              editFormData.emotion === '達成感' || 
              editFormData.emotion === '幸せ') && (
              <div className="mb-6 bg-red-50 rounded-lg p-4 border border-red-200">
                <h3 className={`${editFormData.emotion === '無価値感' ? 'text-red-800' : 'text-green-800'} font-jp-bold mb-4`}>
                  {editFormData.emotion === '無価値感' ? '無価値感スコア' : 'スコア設定'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                      自己肯定感スコア
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editFormData.selfEsteemScore}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setEditFormData({
                          ...editFormData,
                          selfEsteemScore: value,
                          worthlessnessScore: 100 - value
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                      無価値感スコア
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editFormData.worthlessnessScore}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setEditFormData({
                          ...editFormData,
                          worthlessnessScore: value,
                          selfEsteemScore: 100 - value
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ボタン */}
            <div className="flex space-x-4">
              <button
                onClick={handleSaveEdit}
                disabled={syncing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors flex items-center justify-center space-x-2"
              >
                {syncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>保存</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={syncing}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-jp-medium transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-2">
      {/* 検索ヘッダー */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-blue-200 diary-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-jp-bold text-blue-900">日記検索</h1>
            {syncing && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-600 font-jp-medium text-sm">同期中...</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-300 bg-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>フィルター</span>
          </button>
        </div>

        {/* 検索タイプ選択 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { type: 'keyword' as const, label: 'キーワード', icon: Search },
            { type: 'date' as const, label: '日付', icon: Calendar },
            { type: 'emotion' as const, label: '感情', icon: Filter }
          ].map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-jp-medium text-sm transition-colors ${
                searchType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* 検索入力エリア */}
        <div className="space-y-4">
          {searchType === 'keyword' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="出来事や気づきを検索..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {searchType === 'emotion' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => setSelectedEmotion(selectedEmotion === emotion ? '' : emotion)}
                  className={`p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm font-jp-medium transition-all ${
                    selectedEmotion === emotion
                      ? getEmotionColor(emotion) + ' shadow-md'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          )}

          {searchType === 'date' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                  開始日
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                />
              </div>
              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                  終了日
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                />
              </div>
            </div>
          )}
        </div>

        {/* 検索結果サマリー */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 font-jp-normal">
            {filteredEntries.length > 0 ? (
              <span>
                <span className="font-jp-bold text-blue-600">{filteredEntries.length}</span>件の日記が見つかりました
              </span>
            ) : (
              <span>検索条件に一致する日記がありません</span>
            )}
          </div>
          {(searchValue || selectedEmotion || dateRange.start || dateRange.end) && (
            <button
              onClick={clearSearch}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 font-jp-normal"
            >
              <X className="w-4 h-4" />
              <span>クリア</span>
            </button>
          )}
        </div>
      </div>

      {/* 検索条件がない場合は直近5日分を表示 */}
      {!searchValue && !selectedEmotion && !dateRange.start && !dateRange.end && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 diary-card">
          <h2 className="text-xl font-jp-bold text-gray-900 mb-6">直近の日記（10件）</h2>
          {recentEntries.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-jp-medium text-gray-500 mb-2">
                まだ日記がありません
              </h3>
              <p className="text-gray-400 font-jp-normal">
                最初の日記を書いてみましょう
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <div key={entry.id} className={`rounded-lg p-4 hover:shadow-md transition-shadow ${
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
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-jp-medium border ${getEmotionColor(entry.emotion)}`}>
                        {entry.emotion}
                      </span>
                      {entry.date && (
                        <span className="text-gray-500 text-xs sm:text-sm font-jp-normal">
                          {formatDate(entry.date)}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(entry)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="編集"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(entry)}
                        className="text-green-600 hover:text-green-700 p-1"
                        title="編集"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <h4 className="font-jp-semibold text-gray-700 mb-1 text-sm">出来事</h4>
                      <p className="text-gray-600 text-xs sm:text-sm font-jp-normal leading-relaxed break-words">
                        {entry.event}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-jp-semibold text-gray-700 mb-1 text-sm">気づき</h4>
                      <p className="text-gray-600 text-xs sm:text-sm font-jp-normal leading-relaxed break-words">
                        {entry.realization}
                      </p>
                    </div>
                  </div>
                  
                  {/* カウンセラーコメント表示（表示設定がtrueの場合のみ） */}
                  {(entry.is_visible_to_user || entry.isVisibleToUser) && (entry.counselor_memo || entry.counselorMemo) && (
                    <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-jp-medium text-blue-700 break-words">
                          {entry.counselor_name || entry.counselorName || 'カウンセラー'}からのコメント
                        </span>
                      </div>
                      <p className="text-blue-800 text-sm font-jp-normal leading-relaxed break-words">
                        {entry.counselor_memo || entry.counselorMemo}
                      </p>
                    </div>
                  )}

                  {(entry.emotion === '無価値感' || 
                    entry.emotion === '嬉しい' || 
                    entry.emotion === '感謝' || 
                    entry.emotion === '達成感' || 
                    entry.emotion === '幸せ') && (
                    <div className="flex flex-wrap gap-2 sm:gap-6 text-xs bg-white rounded-lg p-2 border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 font-jp-medium">自己肯定感:</span>
                        <span className="font-jp-semibold text-blue-600">
                          {entry.selfEsteemScore || 50}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 font-jp-medium">無価値感:</span>
                        <span className="font-jp-semibold text-red-600">
                          {entry.worthlessnessScore || 50}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 検索結果エリア */}
      <div className="space-y-4">
        {(searchValue || selectedEmotion || dateRange.start || dateRange.end) && filteredEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center diary-card">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-jp-medium text-gray-500 mb-2">
              検索結果がありません
            </h3>
            <p className="text-gray-400 font-jp-normal">
              別の検索条件を試してみてください
            </p>
          </div>
        ) : (searchValue || selectedEmotion || dateRange.start || dateRange.end) && (
          <div className="bg-white rounded-xl shadow-lg p-6 diary-card">
            <h2 className="text-xl font-jp-bold text-gray-900 mb-6">検索結果</h2>
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className={`rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
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
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-jp-medium border ${getEmotionColor(entry.emotion)}`}>
                        {entry.emotion}
                      </span>
                      <span className="text-gray-500 text-xs sm:text-sm font-jp-normal">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(entry)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="編集"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(entry)}
                        className="text-green-600 hover:text-green-700 p-1"
                        title="編集"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-jp-semibold text-gray-700 mb-2">出来事</h4>
                      <p className="text-gray-600 text-sm font-jp-normal leading-relaxed break-words whitespace-pre-wrap">
                        {highlightText(entry.event, searchValue)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-jp-semibold text-gray-700 mb-2">気づき</h4>
                      <p className="text-gray-600 text-sm font-jp-normal leading-relaxed break-words whitespace-pre-wrap">
                        {highlightText(entry.realization, searchValue)}
                      </p>
                    </div>
                  </div>
                  
                  {/* カウンセラーコメント表示（表示設定がtrueの場合のみ） */}
                  {(entry.is_visible_to_user || entry.isVisibleToUser) && (entry.counselor_memo || entry.counselorMemo) && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start space-x-2 mb-2">
                        <span className="text-sm font-jp-bold text-blue-700">
                          {entry.counselor_name || entry.counselorName || 'カウンセラー'}からのコメント
                        </span>
                      </div>
                      <p className="text-blue-800 text-sm font-jp-normal leading-relaxed break-words whitespace-pre-wrap">
                        {entry.counselor_memo || entry.counselorMemo}
                      </p>
                    </div>
                  )}

                  {(entry.emotion === '無価値感' || 
                    entry.emotion === '嬉しい' || 
                    entry.emotion === '感謝' || 
                    entry.emotion === '達成感' || 
                    entry.emotion === '幸せ') && (
                    <div className="flex flex-wrap gap-2 sm:gap-6 text-xs bg-white rounded-lg p-2 border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 font-jp-medium">自己肯定感:</span>
                        <span className="font-jp-semibold text-blue-600">
                          {entry.selfEsteemScore || 50}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 font-jp-medium">無価値感:</span>
                        <span className="font-jp-semibold text-red-600">
                          {entry.worthlessnessScore || 50}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      {renderEditModal()}
      
      {/* ローカル保存モード表示 */}
      <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-800 font-jp-medium text-sm">
            {currentUser?.lineUsername || 'ゲスト'}のデータ
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiarySearchPage;