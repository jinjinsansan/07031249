import React, { useState, useEffect } from 'react';
import { Calculator, Heart, AlertTriangle, ExternalLink, Clipboard, Save, Edit3 } from 'lucide-react';

const FirstSteps: React.FC = () => {
  const [scores, setScores] = useState({
    selfEsteemScore: '',
    worthlessnessScore: '',
    measurementMonth: '',
    measurementDay: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // ローカルストレージからデータを読み込み
  useEffect(() => {
    const savedScores = localStorage.getItem('initialScores');
    if (savedScores) {
      const parsedScores = JSON.parse(savedScores);
      setScores(parsedScores);
      setIsSaved(true);
    }
  }, []);

  // 自己肯定感スコア変更時の無価値感スコア自動計算
  const handleSelfEsteemChange = (value: string) => {
    // 空の文字列の場合は空のまま保持
    if (value === '') {
      setScores({
        ...scores,
        selfEsteemScore: '',
        worthlessnessScore: ''
      });
      return;
    }
    
    const numValue = parseInt(value);
    // 値を0〜100の間に制限
    const clampedValue = isNaN(numValue) ? 0 : Math.min(Math.max(numValue, 0), 100);
    const worthlessness = clampedValue > 0 ? (100 - clampedValue).toString() : '';
    setScores({
      ...scores,
      selfEsteemScore: clampedValue.toString(),
      worthlessnessScore: worthlessness
    });
  };

  // 無価値感スコア変更時の自己肯定感スコア自動計算
  const handleWorthlessnessChange = (value: string) => {
    // 空の文字列の場合は空のまま保持
    if (value === '') {
      setScores({
        ...scores,
        worthlessnessScore: '',
        selfEsteemScore: ''
      });
      return;
    }
    
    const numValue = parseInt(value);
    // 値を0〜100の間に制限
    const clampedValue = isNaN(numValue) ? 0 : Math.min(Math.max(numValue, 0), 100);
    const selfEsteem = clampedValue > 0 ? (100 - clampedValue).toString() : '';
    setScores({
      ...scores,
      worthlessnessScore: clampedValue.toString(),
      selfEsteemScore: selfEsteem
    });
  };

  // 保存処理
  const handleSave = () => {
    if (scores.selfEsteemScore && scores.worthlessnessScore && scores.measurementMonth && scores.measurementDay) {
      // スコアが0〜100の範囲内かチェック（文字列型の場合も考慮）
      const selfEsteemScore = typeof scores.selfEsteemScore === 'string'
        ? parseInt(scores.selfEsteemScore) || 0
        : scores.selfEsteemScore || 0;
      const worthlessnessScore = typeof scores.worthlessnessScore === 'string'
        ? parseInt(scores.worthlessnessScore) || 0
        : scores.worthlessnessScore || 0;
      
      if (selfEsteemScore < 0 || selfEsteemScore > 100 || worthlessnessScore < 0 || worthlessnessScore > 100) {
        alert('スコアは0〜100の範囲内で入力してください。');
        return;
      }
      
      // 保存前に値を数値型に変換して確実に計算が正しくなるようにする
      const numericScores = {
        selfEsteemScore: Number(selfEsteemScore) || 0,
        worthlessnessScore: Number(worthlessnessScore) || 0,
        measurementMonth: scores.measurementMonth,
        measurementDay: scores.measurementDay
      };
      
      console.log('保存するスコア:', numericScores);
      localStorage.setItem('initialScores', JSON.stringify(numericScores));
      setIsSaved(true);
      setIsEditing(false);
      alert('スコアを保存しました！');
    } else {
      alert('すべての項目を入力してください。');
    }
  };

  // 編集開始
  const handleEdit = () => {
    setIsEditing(true);
    setIsSaved(false);
  };

  return (
    <div className="w-full space-y-6 px-2">
      <div className="bg-white rounded-xl shadow-lg p-6 diary-card">
        <h1 className="text-2xl font-jp-bold text-gray-900 text-center mb-8">
          最初にやること
        </h1>
        
        <div className="space-y-8">
          {/* 自己肯定感スコアアプリで計測 */}
          <div className="bg-blue-50 rounded-xl p-4 sm:p-8 border border-blue-200">
            <div className="flex items-start space-x-4 mb-6">
              <Calculator className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-jp-bold text-gray-900 mb-4">
                  📱 自己肯定感スコアアプリで計測
                </h2>
                <p className="text-gray-700 font-jp-normal leading-relaxed mb-4 text-sm sm:text-base">
                  初回に限り、あなたの自己肯定感スコアを計測します。その際に<span className="text-red-600 font-jp-bold">無価値感スコアも同時に表示される</span>ので<span className="font-jp-bold">必ずメモしてください</span>。
                </p>
              </div>
            </div>

            {/* アプリアイコンとボタン */}
            <div className="bg-white rounded-lg p-4 sm:p-8 border-2 border-dashed border-blue-300 text-center mb-6">
              <div className="w-24 h-24 bg-pink-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-12 h-12 text-pink-500" />
              </div>
              <p className="text-blue-600 font-jp-medium mb-4 text-sm sm:text-base">自己肯定感スコアアプリ</p>
              <a 
                href="https://app.namisapo3.love" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 rounded-lg font-jp-bold transition-colors shadow-md text-sm sm:text-base"
              >
                <ExternalLink className="w-4 h-4" />
                <span>アプリを開く</span>
              </a>
            </div>
          </div>

          {/* 記録例 */}
          <div className="bg-green-50 rounded-xl p-4 sm:p-8 border border-green-200">
            <div className="flex items-start space-x-4 mb-6">
              <Clipboard className="w-8 h-8 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-jp-bold text-gray-900 mb-4">
                  📝 記録例
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm font-jp-normal mb-4">
                  無価値感スコア＝100-自己肯定感スコア
                </p>
              </div>
            </div>

            {/* スコア表示エリア */}
            <div className="bg-white rounded-lg p-4 sm:p-6 border border-green-300 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700 font-jp-medium text-sm sm:text-base">自己肯定感スコア</span>
                <span className="text-2xl sm:text-4xl font-jp-bold text-blue-600">53</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-jp-medium text-sm sm:text-base">無価値感スコア</span>
                <span className="text-2xl sm:text-4xl font-jp-bold text-red-600">47</span>
              </div>
            </div>

            {/* メモ欄（入力可能） */}
            <div className="bg-yellow-50 rounded-lg p-4 sm:p-6 border border-yellow-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-jp-bold text-gray-900 text-sm sm:text-base">あなたのスコアをメモしてください</h3>
                {isSaved && !isEditing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-jp-medium transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>編集</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <label className="text-gray-700 font-jp-medium text-sm sm:text-base sm:min-w-[120px]">自己肯定感スコア</label>
                  <div className="flex-1">
                    {isEditing || !isSaved ? (
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={scores.selfEsteemScore}
                        onChange={(e) => handleSelfEsteemChange(e.target.value)}
                        className="w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none font-jp-normal text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="数値を入力"
                      />
                    ) : (
                      <div className="border-b-2 border-gray-300 pb-1">
                        <span className="text-blue-600 font-jp-bold text-base sm:text-lg">{scores.selfEsteemScore}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <label className="text-gray-700 font-jp-medium text-sm sm:text-base sm:min-w-[120px]">無価値感スコア</label>
                  <div className="flex-1">
                    {isEditing || !isSaved ? (
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={scores.worthlessnessScore}
                        onChange={(e) => handleWorthlessnessChange(e.target.value)}
                        className="w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none font-jp-normal text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="数値を入力"
                      />
                    ) : (
                      <div className="border-b-2 border-gray-300 pb-1">
                        <span className="text-red-600 font-jp-bold text-base sm:text-lg">{scores.worthlessnessScore}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <label className="text-gray-700 font-jp-medium text-sm sm:text-base sm:min-w-[120px]">計測日：</label>
                  <div className="flex space-x-2 items-center flex-wrap">
                    {isEditing || !isSaved ? (
                      <>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={scores.measurementMonth || ''}
                          onChange={(e) => setScores({...scores, measurementMonth: e.target.value})}
                          className="w-12 sm:w-16 px-2 py-1 border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none font-jp-normal text-center text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="月"
                        />
                        <span className="text-gray-700 font-jp-medium text-sm sm:text-base">月</span>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={scores.measurementDay || ''}
                          onChange={(e) => setScores({...scores, measurementDay: e.target.value})}
                          className="w-12 sm:w-16 px-2 py-1 border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none font-jp-normal text-center text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="日"
                        />
                        <span className="text-gray-700 font-jp-medium text-sm sm:text-base">日</span>
                      </>
                    ) : (
                      <div className="flex space-x-2 items-center">
                        <div className="border-b-2 border-gray-300 pb-1 px-2">
                          <span className="text-gray-800 font-jp-bold text-sm sm:text-base">{scores.measurementMonth}</span>
                        </div>
                        <span className="text-gray-700 font-jp-medium text-sm sm:text-base">月</span>
                        <div className="border-b-2 border-gray-300 pb-1 px-2">
                          <span className="text-gray-800 font-jp-bold text-sm sm:text-base">{scores.measurementDay}</span>
                        </div>
                        <span className="text-gray-700 font-jp-medium text-sm sm:text-base">日</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 自動計算の説明 */}
              {(isEditing || !isSaved) && (
                <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="text-xs text-blue-800 font-jp-normal space-y-1">
                    <p className="font-jp-medium">💡 自動計算機能</p>
                    <p>• 自己肯定感スコアを入力すると、無価値感スコアが自動で計算されます</p>
                    <p>• 計算式：無価値感スコア = 100 - 自己肯定感スコア</p>
                    <p>• どちらの項目からでも入力可能です</p>
                  </div>
                </div>
              )}

              {/* 保存ボタン */}
              {(isEditing || !isSaved) && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 rounded-lg font-jp-bold transition-colors shadow-md mx-auto text-sm sm:text-base"
                  >
                    <Save className="w-5 h-5" />
                    <span>スコアを保存</span>
                  </button>
                </div>
              )}

              {/* 保存完了メッセージ */}
              {isSaved && !isEditing && (
                <div className="mt-4 bg-green-100 rounded-lg p-3 border border-green-200 text-center">
                  <p className="text-green-800 font-jp-medium">
                    ✅ 保存しました
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 重要な注意事項 */}
          <div className="bg-orange-50 rounded-xl p-4 sm:p-8 border border-orange-200">
            <div className="flex flex-col items-center text-center mb-6">
              <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0 mb-3" />
              <h2 className="text-lg sm:text-xl font-jp-bold text-gray-900 mb-4">
                ⚠️ 重要
              </h2>
            </div>
            <div>
                <div className="space-y-4">
                  <p className="text-gray-700 font-jp-normal leading-relaxed text-sm sm:text-base">
                    このスコアは<span className="font-jp-bold text-orange-600">今後の日記で使用する基準値</span>となります。<span className="font-jp-bold">必ず正確にメモして、大切に保管してください</span>。
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <h3 className="font-jp-bold text-orange-900 mb-2 text-sm sm:text-base">計算式</h3>
                    <p className="text-orange-800 font-jp-medium text-center text-base sm:text-lg">
                      無価値感スコア ＝ 100 - 自己肯定感スコア
                    </p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstSteps;