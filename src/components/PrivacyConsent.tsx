import React, { useState } from 'react';
import { Shield, Eye, Lock, Database, AlertTriangle, Users, Clock, MessageCircle, Upload, RefreshCw, Download, CheckCircle, User } from 'lucide-react';
import { logSecurityEvent } from '../lib/deviceAuth';

interface PrivacyConsentProps {
  onConsent: (accepted: boolean) => void;
}

const PrivacyConsent: React.FC<PrivacyConsentProps> = ({ onConsent }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [lineUsername, setLineUsername] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showBackupRestore, setShowBackupRestore] = useState(false);
  const [backupData, setBackupData] = useState<File | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{message: string, success: boolean} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isChecked && lineUsername.trim()) {
      // ユーザー名をローカルストレージに保存
      localStorage.setItem('line-username', lineUsername);
      onConsent(true);
    } else if (!lineUsername.trim()) {
      alert('LINEユーザー名を入力してください。');
    }
  };

  const handleReject = () => {
    // 拒否履歴を記録
    const consentRecord = {
      id: Date.now().toString(),
      line_username: 'declined_user_' + Date.now(),
      consent_given: false,
      consent_date: new Date().toISOString(),
      ip_address: 'unknown',
      user_agent: navigator.userAgent
    };
    
    // ローカルストレージに保存
    const existingHistories = localStorage.getItem('consent_histories');
    const histories = existingHistories ? JSON.parse(existingHistories) : [];
    histories.push(consentRecord);
    localStorage.setItem('consent_histories', JSON.stringify(histories));

    // セキュリティイベントをログ
    logSecurityEvent('privacy_consent_rejected', consentRecord.line_username, 'プライバシーポリシーを拒否');
    
    onConsent(false);
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
      setRestoreStatus({message: 'バックアップファイルを選択してください。', success: false});
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
            setLineUsername(backupObject.lineUsername);
          }
          
          if (backupObject.privacyConsentGiven) {
            localStorage.setItem('privacyConsentGiven', backupObject.privacyConsentGiven);
          }
          
          if (backupObject.privacyConsentDate) {
            localStorage.setItem('privacyConsentDate', backupObject.privacyConsentDate);
          }
          
          setRestoreStatus({message: 'データが正常に復元されました！同意して続行してください。', success: true});
          
          // 同意チェックボックスを自動的にチェック
          setIsChecked(true);
          
        } catch (error) {
          console.error('データ復元エラー:', error);
          setRestoreStatus({message: 'データの復元に失敗しました。有効なバックアップファイルか確認してください。', success: false});
          setRestoreLoading(false);
        }
      };
      
      fileReader.onerror = () => {
        setRestoreStatus({message: 'ファイルの読み込みに失敗しました。', success: false});
        setRestoreLoading(false);
      };
      
      fileReader.readAsText(backupData);
      setRestoreStatus({message: 'バックアップが正常に作成されました！', success: true});
    } catch (error) {
      console.error('バックアップ復元エラー:', error);
      setRestoreStatus({message: 'バックアップの復元に失敗しました。', success: false});
      setRestoreStatus({message: 'バックアップの作成に失敗しました。', success: false});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-jp-bold text-gray-900 mb-2">
            プライバシーに関する重要なお知らせ
          </h1>
          <p className="text-gray-600 font-jp-normal">
            本サービス「かんじょうにっき」では、次の情報を取得し、下記の目的で利用します。
          </p>
          
          {/* LINEユーザー名入力フォーム */}
          <div className="mt-6 bg-white rounded-lg p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h3 className="font-jp-semibold text-gray-900">LINEユーザー名を入力</h3>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600 font-jp-normal text-sm">
                あなたのLINEユーザー名を入力してください。このユーザー名はデータの識別に使用されます。
              </p>
              <div className="mt-3">
                <input
                  type="text"
                  value={lineUsername}
                  onChange={(e) => setLineUsername(e.target.value)}
                  placeholder="LINEユーザー名"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Database className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ 取得する情報</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>・LINEユーザー識別子（userId）</p>
                  <p>・あなたが投稿する「感情日記」の本文（精神・心理状態を含む要配慮個人情報）</p>
                  <p>・デバイス認証情報（デバイスID、PIN番号のハッシュ値、秘密の質問の回答）</p>
                  <p>・投稿日時・セキュリティイベント等の利用メタデータ</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ 利用目的</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>感情日記サービスの提供および品質向上のため</p>
                  <p>心理カウンセラーによる個別アドバイス・緊急対応のため</p>
                  <p>デバイス認証によるセキュリティ確保のため</p>
                  <p>匿名化・統計化したうえでの研究・サービス改善のため</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Users className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ 第三者提供について</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>個人を特定できる形で第三者へ提供することはありません。</p>
                  <p>ただし、あなたまたは第三者の生命・身体の保護が必要な緊急時には、最小限の情報を警察・医療機関等へ提供する場合があります（個人情報保護法23条1項2号）。</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ 保管・管理について</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>・取得したデータは暗号化して厳重に管理し、アクセス権限を限定します。</p>
                  <p>・デバイス認証情報は暗号化してローカルに保存され、サーバーには送信されません。</p>
                  <p>・利用目的達成後 ［保管期間：1年］ を経過した個票データは速やかに削除します。</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Eye className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ あなたの権利</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>ご自身の情報について、開示・訂正・削除・利用停止をいつでも請求できます。</p>
                  <p className="font-jp-medium">お問い合わせ窓口：info@namisapo.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ 重要事項</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>本プライバシーポリシーは、サービス改善のため予告なく変更される場合があります。</p>
                  <p>デバイス認証システムはセキュリティ向上のために導入されており、個人情報保護に貢献します。</p>
                  <p>変更があった場合は、アプリ内またはウェブサイトにて通知いたします。</p>
                  <p>継続してサービスをご利用いただくことで、変更後のプライバシーポリシーに同意したものとみなします。</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <MessageCircle className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ お問い合わせ</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>プライバシーポリシーに関するご質問やご不明な点がございましたら、以下までお問い合わせください。</p>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 mt-3">
                    <p className="font-jp-medium text-gray-900">一般社団法人NAMIDAサポート協会</p>
                    <p>メール：info@namisapo.com</p>
                    <p>受付時間：平日 9:00-17:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              上記内容をご確認のうえ、同意いただける場合は「同意して開始」をタップしてください。<br />
              同意いただけない場合、本サービスはご利用いただけません。
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex items-start space-x-3 mb-6">
              <input
                type="checkbox"
                id="privacy-consent"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="privacy-consent" className="text-sm text-gray-700 leading-relaxed">
                上記のプライバシーポリシーの内容を理解し、個人情報の取り扱いについて同意します。
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={!isChecked || !lineUsername.trim() || restoreLoading}
                className={`flex-1 py-3 px-6 rounded-lg font-jp-medium transition-all cursor-pointer ${
                  isChecked && lineUsername.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                同意して開始
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={restoreLoading}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-jp-medium transition-colors cursor-pointer"
              >
                同意しない
              </button>
            </div>
          </form>
        </div>

        {/* バックアップ復元セクション - ページ下部に移動 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center mb-4">
            <h3 className="text-lg font-jp-bold text-gray-900">データ復元について</h3>
            <p className="text-gray-600 font-jp-normal text-sm mt-2">
              以前使用していたデータを復元することができます
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-4">
            <div className="flex items-start space-x-3">
              <Upload className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div className="text-sm text-purple-800 font-jp-normal">
                <p className="font-jp-medium mb-2">データ復元機能について</p>
                <p className="mb-2">以前作成したバックアップファイルからデータを復元できます。端末変更時や再インストール時に便利です。</p>
                <p>プライバシーポリシーに同意する前にデータを復元することで、以前の設定やデータをそのまま引き継ぐことができます。</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowBackupRestore(!showBackupRestore)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-jp-medium transition-colors mx-auto"
          >
            <Upload className="w-4 h-4" />
            <span>バックアップから復元する</span>
          </button>
          
          {/* バックアップ復元セクション */}
          {showBackupRestore && (
            <div className="mt-4 bg-white rounded-lg p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <Upload className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-jp-bold text-gray-900">バックアップからデータを復元</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-jp-medium
                      file:bg-purple-100 file:text-purple-700
                      hover:file:bg-purple-200
                      cursor-pointer"
                  />
                </div>
                
                <button
                  onClick={handleRestoreBackup}
                  disabled={restoreLoading || !backupData}
                  className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-jp-medium transition-colors w-full"
                >
                  {restoreLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  <span>バックアップから復元</span>
                </button>
              </div>
              
              {/* 復元ステータス表示 */}
              {restoreStatus && (
                <div className={`mt-4 rounded-lg p-4 border animate-pulse ${
                  restoreStatus.success 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    {restoreStatus.success ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="font-jp-medium">{restoreStatus.message}</span>
                  </div>
                </div>
              )}
              
              <div className="mt-4 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-800 font-jp-normal">
                    <p className="font-jp-medium mb-1">注意事項</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>データを復元した後も、プライバシーポリシーへの同意が必要です</li>
                      <li>バックアップファイルには個人情報が含まれています</li>
                      <li>復元後は「同意して開始」ボタンをクリックしてください</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-2">
            このアプリケーションは個人情報保護法に準拠して設計されています
          </p>
          <p className="text-xs text-gray-400">
            最終更新日：2025年1月22日
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsent;