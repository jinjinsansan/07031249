import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { getCurrentUser } from '../lib/deviceAuth';
import dayjs from 'dayjs';

// 日本時間を取得する関数
const getJapaneseDate = (): Date => {
  // 日本時間（UTC+9）を取得
  const now = new Date();
  // 日本時間のオフセット（ミリ秒）
  const japanOffset = 9 * 60 * 60 * 1000;
  // UTCミリ秒 + 日本時間オフセット
  const japanTime = new Date(now.getTime() + japanOffset);
  return japanTime;
};

const DiaryPage: React.FC = () => {
  const currentUser = getCurrentUser();
  const [formData, setFormData] = useState({
    date: getJapaneseDate().toISOString().split('T')[0],
    event: '',
    emotion: '',
    selfEsteemScore: 50,
    worthlessnessScore: 50,
    realization: ''
  });

  // 無価値感スコア用の状態
  const [worthlessnessScores, setWorthlessnessScores] = useState({
    yesterdaySelfEsteem: 50,
    yesterdayWorthlessness: 50,
    todaySelfEsteem: 50,
    todayWorthlessness: 50
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [saving, setSaving] = useState(false);

  // 現在の日本時間
  const today = getJapaneseDate();
  const todayString = today.toISOString().split('T')[0];

  const negativeEmotions = [
    { 
      name: '恐怖', 
      bgColor: 'bg-purple-100', 
      borderColor: 'border-purple-300',
      textColor: 'text-purple-800',
      selectedBg: 'bg-purple-200',
      selectedBorder: 'border-purple-500'
    },
    { 
      name: '悲しみ', 
      bgColor: 'bg-blue-100', 
      borderColor: 'border-blue-300',
      textColor: 'text-blue-800',
      selectedBg: 'bg-blue-200',
      selectedBorder: 'border-blue-500'
    },
    { 
      name: '怒り', 
      bgColor: 'bg-red-100', 
      borderColor: 'border-red-300',
      textColor: 'text-red-800',
      selectedBg: 'bg-red-200',
      selectedBorder: 'border-red-500'
    },
    { 
      name: '悔しい', 
      bgColor: 'bg-green-100', 
      borderColor: 'border-green-300',
      textColor: 'text-green-800',
      selectedBg: 'bg-green-200',
      selectedBorder: 'border-green-500'
    },
    { 
      name: '無価値感', 
      bgColor: 'bg-gray-100', 
      borderColor: 'border-gray-400',
      textColor: 'text-gray-800',
      selectedBg: 'bg-gray-200',
      selectedBorder: 'border-gray-600',
      highlighted: true
    },
    { 
      name: '罪悪感', 
      bgColor: 'bg-orange-100', 
      borderColor: 'border-orange-300',
      textColor: 'text-orange-800',
      selectedBg: 'bg-orange-200',
      selectedBorder: 'border-orange-500'
    },
    { 
      name: '寂しさ', 
      bgColor: 'bg-indigo-100', 
      borderColor: 'border-indigo-300',
      textColor: 'text-indigo-800',
      selectedBg: 'bg-indigo-200',
      selectedBorder: 'border-indigo-500'
    },
    { 
      name: '恥ずかしさ', 
      bgColor: 'bg-pink-100', 
      borderColor: 'border-pink-300',
      textColor: 'text-pink-800',
      selectedBg: 'bg-pink-200',
      selectedBorder: 'border-pink-500'
    }
  ];

  const positiveEmotions = [
    { 
      name: '嬉しい', 
      bgColor: 'bg-yellow-100', 
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-800',
      selectedBg: 'bg-yellow-200',
      selectedBorder: 'border-yellow-500'
    },
    { 
      name: '感謝', 
      bgColor: 'bg-teal-100', 
      borderColor: 'border-teal-300',
      textColor: 'text-teal-800',
      selectedBg: 'bg-teal-200',
      selectedBorder: 'border-teal-500'
    },
    { 
      name: '達成感', 
      bgColor: 'bg-lime-100', 
      borderColor: 'border-lime-300',
      textColor: 'text-lime-800',
      selectedBg: 'bg-lime-200',
      selectedBorder: 'border-lime-500'
    },
    { 
      name: '幸せ', 
      bgColor: 'bg-amber-100', 
      borderColor: 'border-amber-300',
      textColor: 'text-amber-800',
      selectedBg: 'bg-amber-200',
      selectedBorder: 'border-amber-500',
      highlighted: true
    }
  ];

  // すべての感情を結合
  const emotions = [
    ...negativeEmotions,
    ...positiveEmotions
  ];

  // 前回の無価値感日記のスコアを取得
  useEffect(() => {
    try {
      // 最初にやることページで保存されたスコアを取得
      const savedInitialScores = localStorage.getItem('initialScores');
      if (savedInitialScores) {
        try {
          const initialScores = JSON.parse(savedInitialScores);
          // 数値型と文字列型の両方に対応
          const selfEsteemScore = typeof initialScores.selfEsteemScore === 'string' 
            ? parseInt(initialScores.selfEsteemScore) 
            : initialScores.selfEsteemScore;
            
          const worthlessnessScore = typeof initialScores.worthlessnessScore === 'string'
            ? parseInt(initialScores.worthlessnessScore)
            : initialScores.worthlessnessScore;
            
          if (!isNaN(selfEsteemScore) && !isNaN(worthlessnessScore)) {
            // 無価値感スコアの状態を更新
            setWorthlessnessScores(prev => ({
              ...prev,
              yesterdaySelfEsteem: selfEsteemScore,
              yesterdayWorthlessness: worthlessnessScore
            }));
            
            console.log('初期スコアを読み込みました:', { selfEsteemScore, worthlessnessScore });
          }
        } catch (error) {
          console.error('初期スコアの解析エラー:', error);
        }
      }
      
      // ローカルストレージから日記データを取得して前回の無価値感日記のスコアも取得
      const savedEntries = localStorage.getItem('journalEntries');
      if (savedEntries) {
        const entries = JSON.parse(savedEntries);
        
        // 無価値感の日記を日付順に並べる
        const worthlessnessEntries = entries
          .filter((entry: any) => entry.emotion === '無価値感')
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // 最新の無価値感日記があれば、そのスコアを前日のスコアとして設定
        if (worthlessnessEntries.length > 0) {
          const latestEntry = worthlessnessEntries[0];
          setWorthlessnessScores(prev => ({
            ...prev,
            yesterdaySelfEsteem: latestEntry.selfEsteemScore,
            yesterdayWorthlessness: latestEntry.worthlessnessScore
          }));
        }
      }
    } catch (error) {
      console.error('前回の無価値感スコア取得エラー:', error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力バリデーション
    if (!formData.emotion) {
      alert('感情を選択してください。');
      return;
    }
    
    if (!formData.event.trim()) {
      alert('出来事を入力してください。');
      return;
    }
    
    // 無価値感を選んだ場合、スコアが0〜100の範囲内かチェック
    if (formData.emotion === '無価値感') {
      if (worthlessnessScores.todaySelfEsteem < 0 || worthlessnessScores.todaySelfEsteem > 100 ||
          worthlessnessScores.todayWorthlessness < 0 || worthlessnessScores.todayWorthlessness > 100) {
        alert('スコアは0〜100の範囲内で入力してください。');
        return;
      }
      
      if (worthlessnessScores.yesterdaySelfEsteem < 0 || worthlessnessScores.yesterdaySelfEsteem > 100 ||
          worthlessnessScores.yesterdayWorthlessness < 0 || worthlessnessScores.yesterdayWorthlessness > 100) {
        alert('前日のスコアは0〜100の範囲内で入力してください。');
        return;
      }
    }
    
    if (formData.emotion === '無価値感' && 
        (worthlessnessScores.todaySelfEsteem + worthlessnessScores.todayWorthlessness !== 100)) {
      alert('自己肯定感スコアと無価値感スコアの合計は100になるように設定してください。');
      return;
    }

    setSaving(true);

    try {
      // 最初にやることページで保存されたスコアを取得
      const savedInitialScores = localStorage.getItem('initialScores');
      let finalFormData = { ...formData };
      let finalWorthlessnessScores = { ...worthlessnessScores };
      
      // 一番最初の日記で無価値感を選んだ場合、保存されたスコアを使用
      if (formData.emotion === '無価値感' && savedInitialScores) {
        const existingEntries = localStorage.getItem('journalEntries');
        const entries = existingEntries ? JSON.parse(existingEntries) : [];
        
        // 無価値感の日記が初回の場合
        const worthlessnessEntries = entries.filter((entry: any) => entry.emotion === '無価値感');
        
        if (worthlessnessEntries.length === 0) {
          // 初回の無価値感日記の場合、保存されたスコアを使用
          try {
            const initialScores = JSON.parse(savedInitialScores);
            // 数値型と文字列型の両方に対応
            const selfEsteemScore = typeof initialScores.selfEsteemScore === 'string' 
              ? parseInt(initialScores.selfEsteemScore) 
              : initialScores.selfEsteemScore;
            
            // 値を0〜100の間に制限
            const clampedSelfEsteemScore = Math.min(Math.max(selfEsteemScore, 0), 100);
            
            const worthlessnessScore = typeof initialScores.worthlessnessScore === 'string'
              ? parseInt(initialScores.worthlessnessScore)
              : initialScores.worthlessnessScore;
            
            // 値を0〜100の間に制限
            const clampedWorthlessnessScore = Math.min(Math.max(worthlessnessScore, 0), 100);
            
            if (!isNaN(clampedSelfEsteemScore) && !isNaN(clampedWorthlessnessScore)) {
              finalFormData = {
                ...formData,
                selfEsteemScore: clampedSelfEsteemScore,
                worthlessnessScore: clampedWorthlessnessScore
              };
              
              // worthlessnessScoresの状態も更新
              finalWorthlessnessScores = {
                ...worthlessnessScores,
                todaySelfEsteem: clampedSelfEsteemScore,
                todayWorthlessness: clampedWorthlessnessScore
              };
              
              setWorthlessnessScores(finalWorthlessnessScores);
            }
          } catch (error) {
            console.error('初期スコアの解析エラー:', error);
          }
        }
      }
      
      // ローカルストレージに保存
      const existingEntries = localStorage.getItem('journalEntries');
      let entries = [];
      try {
        entries = existingEntries ? JSON.parse(existingEntries) : [];
        if (!Array.isArray(entries)) {
          console.error('journalEntriesが配列ではありません:', entries);
          entries = [];
        }
      } catch (error) {
        console.error('journalEntriesの解析エラー:', error);
      }
      
      // 現在のユーザー名を取得
      const user = getCurrentUser();
      const username = user?.lineUsername || localStorage.getItem('line-username') || 'Unknown User';
      
      const newEntry = {
        id: Date.now().toString(),
        date: finalFormData.date || new Date().toISOString().split('T')[0],
        emotion: finalFormData.emotion,
        event: finalFormData.event,
        realization: finalFormData.realization,
        user: { line_username: username },
        created_at: new Date().toISOString(),
        urgency_level: null,
        assigned_counselor: null,
        counselor_memo: null,
        is_visible_to_user: false,
        counselor_name: null
      };
      
      // 無価値感を選んだ場合はスコアを追加
      if (finalFormData.emotion === '無価値感' || 
          finalFormData.emotion === '嬉しい' || 
          finalFormData.emotion === '感謝' || 
          finalFormData.emotion === '達成感' || 
          finalFormData.emotion === '幸せ') {
        // 数値型として保存（NaNを防ぐため0をデフォルト値に）
        newEntry.selfEsteemScore = Number(finalWorthlessnessScores.todaySelfEsteem) || 50;
        newEntry.worthlessnessScore = Number(finalWorthlessnessScores.todayWorthlessness) || 50;
      }
      
      console.log('保存する日記データ:', newEntry);
      entries.unshift(newEntry);
      localStorage.setItem('journalEntries', JSON.stringify(entries));
      
      alert('日記を保存しました！');
    
      // フォームをリセット
      setFormData({
        date: getJapaneseDate().toISOString().split('T')[0],
        event: '',
        emotion: '',
        selfEsteemScore: 50,
        worthlessnessScore: 50,
        realization: ''
      });
      
      // 無価値感を選んだ場合、次回のために今回のスコアを前日のスコアとして設定
      if (formData.emotion === '無価値感' || 
          formData.emotion === '嬉しい' || 
          formData.emotion === '感謝' || 
          formData.emotion === '達成感' || 
          formData.emotion === '幸せ') {
        setWorthlessnessScores({
          yesterdaySelfEsteem: Number(finalWorthlessnessScores.todaySelfEsteem) || 0,
          yesterdayWorthlessness: Number(finalWorthlessnessScores.todayWorthlessness) || 0,
          todaySelfEsteem: 50,
          todayWorthlessness: 50
        });
      } else {
        setWorthlessnessScores({
          yesterdaySelfEsteem: 50,
          yesterdayWorthlessness: 50,
          todaySelfEsteem: 50,
          todayWorthlessness: 50
        });
      }
      
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    const username = currentUser?.lineUsername || 'ユーザー';
    
    // 気づきの一部を含める（プライバシーに配慮して最初の20文字まで）
    const realizationPreview = formData.realization.trim() ? 
      (formData.realization.length > 20 ? formData.realization.substring(0, 20) + '...' : formData.realization) : 
      '';
    
    // 日記内容の一部を含める（プライバシーに配慮して最初の20文字まで）
    const eventPreview = formData.event.trim() ? 
      (formData.event.length > 20 ? formData.event.substring(0, 20) + '...' : formData.event) : 
      '';
    
    // 感情に対応する絵文字を追加
    const emotionEmoji = getEmotionEmoji(formData.emotion);
    
    let shareText = `${username}の今日の感情日記 📝\n\n${emotionEmoji} 感情: ${formData.emotion}`;
    
    // 内容があれば追加
    if (eventPreview) {
      shareText += `\n\n💭 出来事: ${eventPreview}`;
    }
    
    // 気づきがあれば追加
    if (realizationPreview) {
      shareText += `\n\n✨ 気づき: ${realizationPreview}`;
    }
    
    // ハッシュタグとURLを追加
    shareText += `\n\n#かんじょうにっき #感情日記 #自己肯定感\n\nhttps://namisapo.vercel.app/`;
    
    if (navigator.share) {
      // Web Share API が利用可能な場合
      navigator.share({
        title: 'かんじょうにっき',
        text: shareText,
      }).catch((error) => {
        console.log('シェアがキャンセルされました:', error);
      });
    } else {
      // Web Share API が利用できない場合はクリップボードにコピー
      navigator.clipboard.writeText(shareText).then(() => {
        alert('シェア用テキストをクリップボードにコピーしました！\nSNSに貼り付けてシェアしてください。');
      }).catch(() => {
        // クリップボードAPIも使えない場合は手動でテキストを表示
        prompt('以下のテキストをコピーしてSNSでシェアしてください:', shareText);
      });
    }
  };

  // 感情に対応する絵文字を取得
  const getEmotionEmoji = (emotion: string): string => {
    const emojiMap: { [key: string]: string } = {
      // ネガティブな感情
      '恐怖': '😨',
      '悲しみ': '😢',
      '怒り': '😠',
      '悔しい': '😣',
      '無価値感': '😔',
      '罪悪感': '😓',
      '寂しさ': '🥺',
      '恥ずかしさ': '😳',
      // ポジティブな感情
      '嬉しい': '😄',
      '感謝': '🙏',
      '達成感': '🏆',
      '幸せ': '😊'
    };
    return emojiMap[emotion] || '📝';
  };

  // Twitterでシェア
  const handleTwitterShare = () => {
    const username = currentUser?.lineUsername || 'ユーザー';
    
    // 日記内容の一部を含める（プライバシーに配慮して最初の20文字まで）
    const eventPreview = formData.event.trim() ? 
      (formData.event.length > 20 ? formData.event.substring(0, 20) + '...' : formData.event) : 
      '';
    
    // 気づきの一部を含める（プライバシーに配慮して最初の20文字まで）
    const realizationPreview = formData.realization.trim() ? 
      (formData.realization.length > 20 ? formData.realization.substring(0, 20) + '...' : formData.realization) : 
      '';
    
    // 感情に対応する絵文字を追加
    const emotionEmoji = getEmotionEmoji(formData.emotion);
    
    let shareText = `${username}の今日の感情日記 📝\n\n${emotionEmoji} 感情: ${formData.emotion}`;
    
    // 内容があれば追加
    if (eventPreview) {
      shareText += `\n\n💭 出来事: ${eventPreview}`;
    }
    
    // 気づきがあれば追加
    if (realizationPreview) {
      shareText += `\n\n✨ 気づき: ${realizationPreview}`;
    }
    
    // ハッシュタグとURLを追加
    shareText += `\n\n#かんじょうにっき #感情日記 #自己肯定感\n\nhttps://namisapo.vercel.app/`;
    
    const encodedShareText = encodeURIComponent(shareText);
    
    // Twitterシェア用URL
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedShareText}`;
    
    // 新しいウィンドウでTwitterシェアを開く
    window.open(twitterUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日 (${dayOfWeek})`;
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
    // タイムゾーンを考慮した正確な日付文字列を生成
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    setFormData({...formData, date: dateString});
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

  // 自己肯定感スコア変更時の無価値感スコア自動計算
  const handleSelfEsteemChange = (field: 'yesterdaySelfEsteem' | 'todaySelfEsteem', value: number) => {
    const worthlessnessField = field === 'yesterdaySelfEsteem' ? 'yesterdayWorthlessness' : 'todayWorthlessness';
    
    // 値が空の場合は両方のフィールドを空にする
    if (value === null || isNaN(value)) {
      setWorthlessnessScores(prev => ({
        ...prev,
        [field]: '',
        [worthlessnessField]: ''
      }));
      return;
    }
    
    // 値を0〜100の間に制限
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const calculatedWorthlessness = 100 - clampedValue;
    
    setWorthlessnessScores(prev => ({
      ...prev,
      [field]: clampedValue,
      [worthlessnessField]: calculatedWorthlessness
    }));
  };

  // 無価値感スコア直接変更時の自己肯定感スコア自動計算
  const handleWorthlessnessChange = (field: 'yesterdayWorthlessness' | 'todayWorthlessness', value: number) => {
    const selfEsteemField = field === 'yesterdayWorthlessness' ? 'yesterdaySelfEsteem' : 'todaySelfEsteem';

    // 値が空の場合は両方のフィールドを空にする
    if (value === null || isNaN(value)) {
      setWorthlessnessScores(prev => ({
        ...prev,
        [field]: '',
        [selfEsteemField]: ''
      }));
      return;
    }

    // 値を0〜100の間に制限
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const calculatedSelfEsteem = 100 - clampedValue;

    setWorthlessnessScores(prev => ({
      ...prev,
      [field]: clampedValue,
      [selfEsteemField]: calculatedSelfEsteem
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-2">
      {/* 今日の出来事セクション - diary-cardクラスを追加 */}
      <div className="bg-white rounded-xl shadow-lg p-6 diary-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-jp-bold text-gray-900">今日の出来事</h2>
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 font-jp-normal hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>{formatDate(formData.date)}</span>
            </button>

            {/* カレンダーポップアップ */}
            {showCalendar && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-80 max-w-[calc(100vw-2rem)]">
                {/* カレンダーヘッダー */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h3 className="font-jp-bold text-gray-900">
                    {calendarDate.getFullYear()}年{calendarDate.getMonth() + 1}月
                  </h3>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
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
                    const dayString = day.toISOString().split('T')[0];
                    const isSelected = dayString === formData.date;
                    const isToday = dayString === todayString;
                    const isFuture = day > today;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(day)}
                        disabled={isFuture}
                        className={`
                          w-8 h-8 text-xs font-jp-normal rounded transition-colors
                          ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                          ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                          ${isToday && !isSelected ? 'bg-blue-100 text-blue-600' : ''}
                          ${isFuture ? 'opacity-30 cursor-not-allowed' : ''}
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
                    className="text-sm text-gray-500 hover:text-gray-700 font-jp-normal mt-2"
                  >
                    閉じる
                  </button>
                </div>
                
                {/* 凡例 */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-100 rounded-full"></div>
                      <span>今日</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 opacity-30 bg-gray-400 rounded-full"></div>
                      <span>選択不可</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-4">
          <p className="text-gray-600 font-jp-normal text-sm mb-4">
            今日の出来事を書いてみましょう
          </p>
          <div className="relative overflow-hidden">
            {/* 罫線背景 */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden" style={{
                backgroundImage: `
                  linear-gradient(to bottom, transparent 0px, transparent 31px, #e5e7eb 31px, #e5e7eb 32px),
                  linear-gradient(to right, #ef4444 0px, #ef4444 2px, transparent 2px)
                `,
                backgroundSize: '100% 32px, 100% 100%',
                backgroundPosition: '0 16px, 24px 0'
              }}>
                {/* 左マージン線 */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-red-300"></div>
                {/* 穴あけ部分（3つ穴） */}
                <div className="absolute left-3 top-8">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mb-16"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full mb-16"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* テキストエリア */}
            <textarea
              value={formData.event}
              onChange={(e) => setFormData({...formData, event: e.target.value})}
              className="relative w-full h-64 p-4 pl-8 bg-transparent border-none resize-none focus:outline-none font-jp-normal text-gray-800 leading-8 overflow-hidden"
              placeholder=""
              style={{
                lineHeight: '32px',
                paddingTop: '16px'
              }}
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 text-lg">💡</span>
            <div className="text-sm text-blue-800 font-jp-normal">
              <p className="font-jp-medium">思い出すのがつらい場合は、無理をしないでください。</p>
              <p>書ける範囲で、あなたのペースで大丈夫です。</p>
            </div>
          </div>
        </div>

      </div>

      {/* 今日の気持ちセクション */}
      <div className="bg-white rounded-xl shadow-lg p-6 diary-card">
        <h2 className="text-xl font-jp-bold text-gray-900 mb-4">今日の気持ち</h2>

        <div className="mb-6">
          <p className="text-gray-700 font-jp-normal mb-4 text-sm">
            どの気持ちに近いですか？
          </p>
          
          <div className="mb-4">
            <h3 className="text-base font-jp-semibold text-gray-800 mb-2">ネガティブな感情</h3>
            <div className="grid grid-cols-2 gap-3">
              {negativeEmotions.map((emotion) => (
                <label
                  key={emotion.name}
                  className={`flex items-center space-x-2 p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 text-sm sm:text-base ${
                    formData.emotion === emotion.name
                      ? `${emotion.selectedBg} ${emotion.selectedBorder} shadow-md transform scale-105`
                      : `${emotion.bgColor} ${emotion.borderColor} hover:shadow-sm hover:scale-102`
                  }`}
                >
                  <input
                    type="radio"
                    name="emotion"
                    value={emotion.name}
                    checked={formData.emotion === emotion.name}
                    onChange={(e) => setFormData({...formData, emotion: e.target.value})}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className={`w-3 h-3 rounded-full ${
                    formData.emotion === emotion.name 
                      ? emotion.selectedBorder.replace('border-', 'bg-')
                      : emotion.borderColor.replace('border-', 'bg-')
                  }`}></div>
                  <span className={`font-jp-semibold text-sm sm:text-base ${emotion.textColor} ${
                    formData.emotion === emotion.name ? 'font-jp-bold' : ''
                  }`}>
                    {emotion.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-base font-jp-semibold text-gray-800 mb-2">ポジティブな感情</h3>
            <div className="grid grid-cols-2 gap-3">
              {positiveEmotions.map((emotion) => (
                <label
                  key={emotion.name}
                  className={`flex items-center space-x-2 p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 text-sm sm:text-base ${
                    formData.emotion === emotion.name
                      ? `${emotion.selectedBg} ${emotion.selectedBorder} shadow-md transform scale-105`
                      : `${emotion.bgColor} ${emotion.borderColor} hover:shadow-sm hover:scale-102`
                  }`}
                >
                  <input
                    type="radio"
                    name="emotion"
                    value={emotion.name}
                    checked={formData.emotion === emotion.name}
                    onChange={(e) => setFormData({...formData, emotion: e.target.value})}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className={`w-3 h-3 rounded-full ${
                    formData.emotion === emotion.name 
                      ? emotion.selectedBorder.replace('border-', 'bg-')
                      : emotion.borderColor.replace('border-', 'bg-')
                  }`}></div>
                  <span className={`font-jp-semibold text-sm sm:text-base ${emotion.textColor} ${
                    formData.emotion === emotion.name ? 'font-jp-bold' : ''
                  }`}>
                    {emotion.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 無価値感を選んだ場合のスコア入力 */}
        {(formData.emotion === '無価値感' || 
          formData.emotion === '嬉しい' || 
          formData.emotion === '感謝' || 
          formData.emotion === '達成感' || 
          formData.emotion === '幸せ') && (
          <div className="bg-red-50 rounded-lg p-4 sm:p-6 border border-red-200 mb-6">
            <h3 className={`${formData.emotion === '無価値感' ? 'text-red-800' : 'text-green-800'} font-jp-bold mb-4`}>
              「{formData.emotion}」を選んだ場合の入力
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 前日のスコア */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-jp-bold text-gray-700 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  前日のスコア
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-jp-medium text-gray-600 mb-1">
                      自己肯定感
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={worthlessnessScores.yesterdaySelfEsteem || ''}
                      onChange={(e) => handleSelfEsteemChange('yesterdaySelfEsteem', e.target.value === '' ? NaN : parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-jp-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-jp-medium text-gray-600 mb-1">
                      無価値感
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={worthlessnessScores.yesterdayWorthlessness || ''}
                      onChange={(e) => handleWorthlessnessChange('yesterdayWorthlessness', e.target.value === '' ? NaN : parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-jp-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="50"
                    />
                  </div>
                </div>
              </div>

              {/* 今日のスコア */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-jp-bold text-gray-700 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                  今日のスコア
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-jp-medium text-gray-600 mb-1">
                      自己肯定感
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={worthlessnessScores.todaySelfEsteem || ''}
                      onChange={(e) => handleSelfEsteemChange('todaySelfEsteem', e.target.value === '' ? NaN : parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-jp-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-jp-medium text-gray-600 mb-1">
                      無価値感
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={worthlessnessScores.todayWorthlessness || ''}
                      onChange={(e) => handleWorthlessnessChange('todayWorthlessness', e.target.value === '' ? NaN : parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-jp-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="50"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-blue-800 font-jp-normal space-y-1">
                <p className="font-jp-medium">💡 自動計算機能</p>
                <p>• 自己肯定感スコアを入力すると、無価値感スコアが自動で計算されます</p>
                <p>• 計算式：無価値感スコア = 100 - 自己肯定感スコア</p>
                <p>• どちらの項目からでも入力可能です</p>
              </div>
            </div>
          </div>
        )}

        {/* 今日の小さな気づき */}
        <div className="mb-6">
          <h3 className="text-lg font-jp-bold text-gray-900 mb-4">今日の小さな気づき</h3>
          <textarea
            value={formData.realization}
            onChange={(e) => setFormData({...formData, realization: e.target.value})}
           className="relative w-full h-32 p-4 pl-8 bg-white border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-gray-800 leading-8 overflow-hidden"
            placeholder=""
           style={{
             backgroundImage: `
               linear-gradient(to bottom, transparent 0px, transparent 31px, #e5e7eb 31px, #e5e7eb 32px),
               linear-gradient(to right, #ef4444 0px, #ef4444 2px, transparent 2px)
             `,
             backgroundSize: '100% 32px, 100% 100%',
             backgroundPosition: '0 16px, 24px 0',
             lineHeight: '32px',
             paddingTop: '16px'
           }}
          />
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 text-lg">⭐</span>
            <div className="text-sm text-yellow-800 font-jp-normal">
              <p className="font-jp-medium">感情に良い悪いはありません。すべて大切な気持ちです。</p>
              <p>小さな変化も大きな成長です。自分を褒めてあげてください。</p>
            </div>
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-8">
        {/* シェアプレビュー（日記内容がある場合のみ表示） */}
        {formData.event.trim() && (
          <div className="w-full bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
            <h3 className="font-jp-bold text-gray-900 mb-2 flex items-center">
              <Share2 className="w-4 h-4 mr-2 text-blue-600" />
              シェアプレビュー
            </h3>
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-sm">
              <p className="font-jp-medium mb-2">{currentUser?.lineUsername || 'ユーザー'}の今日の感情日記 📝</p>
              <p className="mb-1">{getEmotionEmoji(formData.emotion)} 感情: {formData.emotion}</p>
              {formData.event.trim() && (
                <p className="mb-1">💭 出来事: {formData.event.length > 20 ? formData.event.substring(0, 20) + '...' : formData.event}</p>
              )}
              {formData.realization.trim() && (
                <p className="mb-1">✨ 気づき: {formData.realization.length > 20 ? formData.realization.substring(0, 20) + '...' : formData.realization}</p>
              )}
              <p className="text-gray-500 text-xs mt-2">#かんじょうにっき #感情日記 #自己肯定感</p>
            </div>
          </div>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg font-jp-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>保存中...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>日記を保存</span>
            </>
          )}
        </button>
        
        <button
          onClick={formData.event.trim() ? handleShare : () => alert('日記を入力してから共有してください')}
          disabled={saving}
          className={`w-full sm:w-auto ${formData.event.trim() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} text-white px-6 sm:px-8 py-3 rounded-lg font-jp-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2`}
        >
          <Share2 className="w-5 h-5" />
          <span>SNSでシェア</span>
        </button>
        
        <button
          onClick={formData.event.trim() ? handleTwitterShare : () => alert('日記を入力してから共有してください')}
          disabled={saving}
          className={`w-full sm:w-auto ${formData.event.trim() ? 'bg-black hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'} text-white px-6 sm:px-8 py-3 rounded-lg font-jp-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Xでシェア</span>
        </button>
      </div>
      
      {/* ローカル保存モード表示 */}
      <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-800 font-jp-medium text-sm">ローカル保存モード</span>
        </div>
      </div>
    </div>
  );
};

export default DiaryPage;