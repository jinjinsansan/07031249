import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Search, Eye, Trash2, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface JournalEntry {
  id: string;
  date: string;
  emotion: string;
  event: string;
  realization: string;
  selfEsteemScore?: number;
  worthlessnessScore?: number;
  counselorMemo?: string;
  isVisibleToUser?: boolean;
  counselorName?: string;
  assignedCounselor?: string;
  urgencyLevel?: string;
  user?: {
    line_username: string;
  };
  syncStatus?: string;
}

interface CalendarSearchProps {
  onViewEntry: (entry: JournalEntry) => void;
  onDeleteEntry?: (entryId: string) => void;
}

const CalendarSearch: React.FC<CalendarSearchProps> = ({ onViewEntry, onDeleteEntry }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [calendarData, setCalendarData] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      filterEntriesByDate(selectedDate);
    }
  }, [selectedDate, entries]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      console.log('カレンダー検索: データを読み込みます');
      // Supabaseから直接日記データを取得
      if (supabase) {
        try {
          const { data: diaryData, error } = await supabase
            .from('diary_entries')
            .select(`
              *,
              users (
                line_username
              )
            `)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Supabaseからの日記データ取得エラー:', error);
            throw error;
          } else if (diaryData && diaryData.length > 0) {
            console.log('Supabaseから日記データを取得しました:', diaryData.length, '件');
            
            // データをフォーマット
            const formattedEntries = diaryData.map(item => {
              return {
                id: item.id,
                date: item.date,
                emotion: item.emotion || '不明',
                event: item.event || '内容なし',
                realization: item.realization || '内容なし',
                selfEsteemScore: item.self_esteem_score || 0,
                worthlessnessScore: item.worthlessness_score || 0,
                created_at: item.created_at,
                user: item.users,
                counselorMemo: item.counselor_memo || '',
                isVisibleToUser: item.is_visible_to_user || false,
                counselorName: item.counselor_name || '',
                assignedCounselor: item.assigned_counselor || '',
                urgencyLevel: item.urgency_level || '',
                syncStatus: 'supabase'
              };
            });
            
            setEntries(formattedEntries);
            
            // カレンダーデータを生成
            console.log('カレンダーデータを生成します');
            generateCalendarData(formattedEntries);
            return;
          }
        } catch (supabaseError) {
          console.error('Supabase接続エラー:', supabaseError);
        }
      }
      
      // ローカルストレージからデータを取得
      const savedEntries = localStorage.getItem('journalEntries');
      if (savedEntries) {
        console.log('ローカルストレージから日記データを取得します');
        try {
          const parsedEntries = JSON.parse(savedEntries);
          
          // ローカルデータにsyncStatusを追加
          const localEntries = parsedEntries.map((entry: any) => ({
            ...entry,
            syncStatus: 'local'
          }));
          
          setEntries(localEntries);
          
          // カレンダーデータを生成
          console.log('カレンダーデータを生成します (ローカル)');
          generateCalendarData(localEntries);
        } catch (error) {
          console.error('ローカルデータの解析エラー:', error);
        }
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarData = (entries: JournalEntry[]) => {
    const data: {[key: string]: number} = {};
    
    console.log(`カレンダーデータ生成: ${entries.length}件のエントリーを処理`);
    entries.forEach(entry => {
      if (entry.date) {
        if (data[entry.date]) {
          data[entry.date]++;
        } else {
          data[entry.date] = 1;
        }
      }
    });
    
    setCalendarData(data);
    console.log('カレンダーデータを設定しました:', Object.keys(data).length, '日分');
  };

  const filterEntriesByDate = (date: string) => {
    const filtered = entries.filter(entry => entry.date === date);
    setFilteredEntries(filtered);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 月の最初の日と最後の日
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 月の最初の日の曜日（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
    const firstDayOfWeek = firstDay.getDay();
    
    // カレンダーの最初の日（前月の日を含む）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);
    
    const days = [];
    const current = new Date(startDate);
    
    // 6週間分のカレンダーを生成（前月と翌月の日を含む）
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
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

  const getUrgencyLevelColor = (level: string) => {
    const colorMap: { [key: string]: string } = {
      'high': 'bg-red-100 text-red-800 border-red-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-green-100 text-green-800 border-green-200'
    };
    return colorMap[level] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUrgencyLevelText = (level: string) => {
    const textMap: { [key: string]: string } = {
      'high': '高',
      'medium': '中',
      'low': '低'
    };
    return textMap[level] || '未設定';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-jp-bold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            カレンダー検索
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={loadEntries}
              className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-jp-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>更新</span>
            </button>
          </div>
        </div>

        {/* カレンダー */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-jp-bold text-gray-900">
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div 
                key={day} 
                className={`text-center text-sm font-jp-medium py-2 ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* カレンダー日付 */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((day, index) => {
              const dateString = formatDate(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = dateString === formatDate(new Date());
              const isSelected = dateString === selectedDate;
              const entryCount = calendarData[dateString] || 0;
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(dateString)}
                  className={`
                    h-14 p-1 rounded-lg transition-colors relative
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                    ${isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-100'}
                    ${isToday ? 'font-jp-bold' : ''}
                  `}
                >
                  <div className="text-right mb-1">
                    <span className={`text-sm ${
                      day.getDay() === 0 ? 'text-red-500' : 
                      day.getDay() === 6 ? 'text-blue-500' : 
                      'text-gray-700'
                    }`}>
                      {day.getDate()}
                    </span>
                  </div>
                  
                  {calendarData[dateString] > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs rounded-full">
                          {calendarData[dateString]}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 選択した日付の日記一覧 */}
        {selectedDate && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-jp-bold text-gray-900 mb-4">
              {formatDisplayDate(selectedDate)}の日記
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-jp-normal">読み込み中...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-jp-medium text-gray-500 mb-2">
                  この日の日記はありません
                </h3>
                <p className="text-gray-400 font-jp-normal">
                  別の日を選択してください
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-jp-medium border ${
                        getEmotionColor(entry.emotion)
                        }`}>
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
                        {entry.urgencyLevel && (
                          <span className={`px-2 py-1 rounded-full text-xs font-jp-medium ${getUrgencyLevelColor(entry.urgencyLevel)}`}>
                            {getUrgencyLevelText(entry.urgencyLevel)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {entry.user?.line_username && (
                          <span className="text-xs text-gray-500 font-jp-normal">
                            {entry.user.line_username || 'ユーザー'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <h4 className="font-jp-semibold text-gray-700 mb-1 text-sm">出来事</h4>
                        <p className="text-gray-600 text-xs sm:text-sm font-jp-normal leading-relaxed break-words">
                          {entry.event.length > 100 ? `${entry.event.substring(0, 100)}...` : entry.event}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-jp-semibold text-gray-700 mb-1 text-sm">気づき</h4>
                        <p className="text-gray-600 text-xs sm:text-sm font-jp-normal leading-relaxed break-words">
                          {entry.realization && entry.realization.length > 100 ? `${entry.realization.substring(0, 100)}...` : entry.realization}
                        </p>
                      </div>
                    </div>

                    {/* カウンセラーコメント */}
                    {((entry.is_visible_to_user || entry.isVisibleToUser) && (entry.counselor_memo || entry.counselorMemo)) && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-3">
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

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {(entry.assignedCounselor || entry.assigned_counselor) ?
                          `担当: ${entry.assignedCounselor || entry.assigned_counselor}` :
                          '未割り当て'}
                      </div>
                      <div className="flex space-x-2">
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSearch;