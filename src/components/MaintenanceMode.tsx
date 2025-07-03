import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw, Wrench, Heart, CheckCircle, Info, Upload, Shield, Download } from 'lucide-react';

interface MaintenanceConfig {
  isEnabled: boolean;
  message: string;
  endTime?: string;
  type: 'scheduled' | 'emergency' | 'completed';
  progress?: number;
  estimatedDuration?: string;
  affectedFeatures?: string[];
  contactInfo?: string;
}

interface MaintenanceModeProps {
  config: MaintenanceConfig;
  onAdminLogin?: () => void;
  onRetry?: () => void;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ config, onAdminLogin, onRetry }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [adminLoginAttempts, setAdminLoginAttempts] = useState(0);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showBackupRestore, setShowBackupRestore] = useState(false);
  const [backupData, setBackupData] = useState<File | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));

      if (config.endTime) {
        const endTime = new Date(config.endTime);
        const diff = endTime.getTime() - now.getTime();
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          if (hours > 0) {
            setTimeRemaining(`${hours}時間${minutes}分${seconds}秒`);
          } else if (minutes > 0) {
            setTimeRemaining(`${minutes}分${seconds}秒`);
          } else {
            setTimeRemaining(`${seconds}秒`);
          }
        } else {
          setTimeRemaining('まもなく復旧予定');
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [config.endTime]);

  // 管理者ログイン処理
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginAttempts(prev => prev + 1);
    
    // 管理者パスワードをチェック（実際の実装ではより安全な方法を使用）
    if (adminPassword === 'counselor123') {
      // 管理者としてログイン
      localStorage.setItem('current_counselor', '管理者（緊急アクセス）');
      
      // 親コンポーネントに通知
      if (onAdminLogin) {
        onAdminLogin();
      } else {
        // 通知がない場合はページをリロード
        window.location.reload();
      }
    } else {
      if (adminLoginAttempts >= 2) {
        setLoginError('複数回失敗しました。正しいパスワードを入力してください。');
      } else {
        setLoginError('パスワードが正しくありません');
      }
    }
  };

  // バックアップファイルの選択
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBackupData(e.target.files[0]);
      setRestoreStatus(null);
    }
  };

  // バックアップからの復元
  const handleRestoreBackup = async () => {
    if (!backupData) {
      setRestoreStatus('バックアップファイルを選択してください。');
      return;
    }
    
    if (!window.confirm('バックアップからデータを復元しますか？')) {
      return;
    }
    
    setRestoreLoading(true);
    setRestoreStatus(null);
    
    try {
      // ファイルを読み込み
      const fileReader = new FileReader();
      
      fileReader.onload = (event) => {
        try {
          if (!event.target || typeof event.target.result !== 'string') {
            throw new Error('ファイルの読み込みに失敗しました。');
          }
          
          const backupObject = JSON.parse(event.target.result);
          
          // バージョンチェック
          if (!backupObject.version) {
            throw new Error('無効なバックアップファイルです。');
          }
          
          // データの復元
          if (backupObject.journalEntries) {
            localStorage.setItem('journalEntries', JSON.stringify(backupObject.journalEntries));
          }
          
          if (backupObject.initialScores) {
            localStorage.setItem('initialScores', JSON.stringify(backupObject.initialScores));
          }
          
          if (backupObject.consentHistories) {
            localStorage.setItem('consent_histories', JSON.stringify(backupObject.consentHistories));
          }
          
          if (backupObject.lineUsername) {
            localStorage.setItem('line-username', backupObject.lineUsername);
          }
          
          if (backupObject.privacyConsentGiven) {
            localStorage.setItem('privacyConsentGiven', backupObject.privacyConsentGiven);
          }
          
          if (backupObject.privacyConsentDate) {
            localStorage.setItem('privacyConsentDate', backupObject.privacyConsentDate);
          }
          
          setRestoreStatus('データが正常に復元されました！ページを再読み込みしてください。');
          
          // 5秒後に自動的にページを再読み込み
          setTimeout(() => {
            window.location.reload();
          }, 5000);
          
        } catch (error) {
          console.error('データ復元エラー:', error);
          setRestoreStatus('データの復元に失敗しました。有効なバックアップファイルか確認してください。');
          setRestoreLoading(false);
        }
      };
      
      fileReader.onerror = () => {
        setRestoreStatus('ファイルの読み込みに失敗しました。');
        setRestoreLoading(false);
      };
      
      fileReader.readAsText(backupData);
      
    } catch (error) {
      console.error('バックアップ復元エラー:', error);
      setRestoreStatus('バックアップの復元に失敗しました。');
      setRestoreLoading(false);
    }
  };

  // バックアップデータの作成
  const handleCreateBackup = () => {
    try {
      // ローカルストレージからデータを収集
      const backupObject = {
        journalEntries: localStorage.getItem('journalEntries') ? JSON.parse(localStorage.getItem('journalEntries')!) : [],
        initialScores: localStorage.getItem('initialScores') ? JSON.parse(localStorage.getItem('initialScores')!) : null,
        consentHistories: localStorage.getItem('consent_histories') ? JSON.parse(localStorage.getItem('consent_histories')!) : [],
        lineUsername: localStorage.getItem('line-username'),
        privacyConsentGiven: localStorage.getItem('privacyConsentGiven'),
        privacyConsentDate: localStorage.getItem('privacyConsentDate'),
        backupDate: new Date().toISOString(),
        version: '1.0'
      };
      
      // JSONに変換してダウンロード
      const dataStr = JSON.stringify(backupObject, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // ファイル名にユーザー名と日付を含める
      const username = localStorage.getItem('line-username') || 'user';
      const date = new Date().toISOString().split('T')[0];
      const fileName = `kanjou-nikki-backup-${username}-${date}.json`;
      
      // ダウンロードリンクを作成して自動クリック
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(dataBlob);
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      setRestoreStatus('バックアップが正常に作成されました！');
    } catch (error) {
      console.error('バックアップ作成エラー:', error);
      setRestoreStatus('バックアップの作成に失敗しました。');
    }
  };

  const getMaintenanceIcon = () => {
    switch (config.type) {
      case 'emergency':
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      default:
        return <Wrench className="w-12 h-12 text-blue-500" />;
    }
  };

  const getMaintenanceColor = () => {
    switch (config.type) {
      case 'emergency':
        return {
          bg: 'from-red-50 to-pink-100',
          border: 'border-red-200',
          text: 'text-red-800',
          accent: 'bg-red-500'
        };
      case 'completed':
        return {
          bg: 'from-green-50 to-emerald-100',
          border: 'border-green-200',
          text: 'text-green-800',
          accent: 'bg-green-500'
        };
      default:
        return {
          bg: 'from-blue-50 to-indigo-100',
          border: 'border-blue-200',
          text: 'text-blue-800',
          accent: 'bg-blue-500'
        };
    }
  };

  const colors = getMaintenanceColor();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg} flex items-center justify-center p-4`}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative overflow-hidden">
        {/* 装飾的な背景要素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full opacity-20 translate-y-12 -translate-x-12"></div>

        <div className="text-center relative z-10">
          {/* アイコン */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            {getMaintenanceIcon()}
          </div>

          {/* タイトル */}
          <h1 className="text-3xl font-jp-bold text-gray-900 mb-4">
            {config.type === 'emergency' ? '緊急メンテナンス中' :
             config.type === 'completed' ? 'メンテナンス完了' :
             'メンテナンス中'}
          </h1>

          {/* メッセージ */}
          <div className={`bg-gray-50 rounded-lg p-6 mb-6 border ${colors.border}`}>
            <p className="text-gray-800 font-jp-normal leading-relaxed text-lg">
              {config.message}
            </p>
          </div>

          {/* 進捗バー（進捗が設定されている場合） */}
          {config.progress !== undefined && config.type !== 'completed' && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-jp-medium text-gray-700">進捗状況</span>
                <span className="text-sm font-jp-bold text-gray-900">{config.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 ${colors.accent} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${config.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* 時間情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-jp-medium text-gray-700">現在時刻</span>
              </div>
              <p className="text-xl font-jp-bold text-gray-900">{currentTime}</p>
            </div>

            {config.endTime && config.type !== 'completed' && (
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <RefreshCw className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-jp-medium text-gray-700">復旧予定まで</span>
                </div>
                <p className="text-xl font-jp-bold text-blue-600">{timeRemaining}</p>
              </div>
            )}

            {config.estimatedDuration && (
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm md:col-span-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-jp-medium text-gray-700">予想所要時間</span>
                </div>
                <p className="text-lg font-jp-bold text-gray-900">{config.estimatedDuration}</p>
              </div>
            )}
          </div>

          {/* 影響を受ける機能 */}
          {config.affectedFeatures && config.affectedFeatures.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
              <h3 className="font-jp-bold text-yellow-900 mb-3">影響を受ける機能</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {config.affectedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-800 font-jp-normal">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* データ保護メッセージ */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-6">
            <div className="flex items-start space-x-3">
              <Heart className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-jp-bold text-green-900 mb-2">データの安全性について</h3>
                <div className="space-y-1 text-sm text-green-800 font-jp-normal">
                  <p>• あなたの日記データは安全に保護されています</p>
                  <p>• ローカルに保存されたデータは失われません</p>
                  <p>• メンテナンス完了後、すべての機能が正常に復旧します</p>
                </div>
              </div>
            </div>
          </div>

          {/* 代替手段の提案 */}
          {config.type !== 'completed' && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
              <h3 className="font-jp-bold text-blue-900 mb-3">メンテナンス中の代替手段</h3>
              <div className="text-sm text-blue-800 font-jp-normal space-y-2">
                <p>📝 物理的なノートに感情日記を記録してください</p>
                <p>💾 メンテナンス完了後、デジタル版に転記できます</p>
                <p>🔄 自動同期機能により、データの整合性を保ちます</p>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {config.type === 'completed' ? (
              <button
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-jp-bold transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>アプリを再開</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-jp-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>状態を確認</span>
                </button>
                
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-jp-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    再試行
                  </button>
                )}
              </>
            )}
          </div>

          {/* バックアップ復元セクション */}
          <div className="mt-6">
            <button
              onClick={() => {
                setShowBackupRestore(!showBackupRestore);
                setRestoreStatus(null);
              }}
              className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-lg font-jp-medium text-sm transition-colors mx-auto mb-2"
            >
              <Upload className="w-4 h-4" />
              <span>データ管理</span>
            </button>
          </div>

          {showBackupRestore && (
            <div className="mt-2 bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-jp-bold text-gray-900 mb-3 text-sm">データ管理</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="font-jp-medium text-blue-900 text-xs mb-2">バックアップを作成</h4>
                  <button
                    onClick={handleCreateBackup}
                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-jp-medium transition-colors w-full text-xs"
                  >
                    <Download className="w-3 h-3" />
                    <span>バックアップを作成</span>
                  </button>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="font-jp-medium text-purple-900 text-xs mb-2">バックアップから復元</h4>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="block w-full text-xs text-gray-500
                          file:mr-2 file:py-1 file:px-2
                          file:rounded-lg file:border-0
                          file:text-xs file:font-jp-medium
                          file:bg-purple-100 file:text-purple-700
                          hover:file:bg-purple-200
                          cursor-pointer"
                      />
                    </div>
                    
                    <button
                      onClick={handleRestoreBackup}
                      disabled={restoreLoading || !backupData}
                      className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-jp-medium transition-colors w-full text-xs"
                    >
                      {restoreLoading ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>バックアップから復元</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 復元ステータス表示 */}
              {restoreStatus && (
                <div className={`mt-3 rounded-lg p-3 border ${
                  restoreStatus.includes('失敗') 
                    ? 'bg-red-50 border-red-200 text-red-800' 
                    : 'bg-green-50 border-green-200 text-green-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    {restoreStatus.includes('失敗') ? (
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="text-xs font-jp-medium">{restoreStatus}</span>
                  </div>
                </div>
              )}
              
              <div className="mt-3 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-800 font-jp-normal">
                    <p className="font-jp-medium mb-1">注意事項</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>メンテナンス中でもデータのバックアップと復元が可能です</li>
                      <li>復元後はページを再読み込みしてください</li>
                      <li>バックアップファイルは安全な場所に保存してください</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 管理者ログインボタン */}
          <div className="mt-6">
            <button
              onClick={() => setShowAdminLogin(!showAdminLogin)}
              className="text-xs text-gray-500 hover:text-gray-700 font-jp-normal underline"
            >
              カウンセラーログイン
            </button>
          </div>

          {/* 管理者ログインフォーム */}
          {showAdminLogin && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-jp-bold text-gray-900 text-sm">カウンセラーログイン</h3>
                <button
                  onClick={() => setShowAdminLogin(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  閉じる
                </button>
              </div>
              
              <form onSubmit={handleAdminLogin} className="space-y-3">
                <div>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="カウンセラーパスワードを入力"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
                  />
                </div>
                
                {loginError && (
                  <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                    <p className="text-xs text-red-600 font-jp-normal">{loginError}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-jp-medium text-sm transition-colors"
                >
                  ログイン
                </button>
              </form>
            </div>
          )}

          {/* 連絡先情報 */}
          {config.contactInfo && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-jp-normal">
                お急ぎの場合は: {config.contactInfo}
              </p>
            </div>
          )}

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-jp-normal">
              一般社団法人NAMIDAサポート協会 | かんじょうにっき
            </p>
            <p className="text-xs text-gray-400 font-jp-normal mt-1">
              ご不便をおかけして申し訳ございません
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;