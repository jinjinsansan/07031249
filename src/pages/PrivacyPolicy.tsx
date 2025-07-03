import React from 'react';
import { Shield, Eye, Lock, Database, AlertTriangle, Users, Clock, MessageCircle, CheckCircle, User } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  // ローカルストレージから同意情報とユーザー名を取得
  const consentGiven = localStorage.getItem('privacyConsentGiven');
  const consentDate = localStorage.getItem('privacyConsentDate') || new Date().toISOString();
  const lineUsername = localStorage.getItem('line-username');
  
  // 同意日時をフォーマット
  const formatConsentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full space-y-6 px-2">
      <div className="bg-white rounded-xl shadow-lg p-6 diary-card">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-jp-bold text-gray-900 mb-2">
            プライバシーポリシー
          </h1>
          <p className="text-gray-600 font-jp-normal">
            本サービス「かんじょうにっき」のプライバシーに関する重要事項
          </p>
        </div>

        {/* 同意履歴表示 */}
        {consentGiven === 'true' && (
          <div className="bg-green-50 rounded-lg p-6 border border-green-200 mb-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-jp-semibold text-green-900 mb-3">■ あなたの同意履歴</h3>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-jp-medium text-gray-700">ユーザー名</p>
                        <p className="text-base font-jp-bold text-green-800">
                          {lineUsername ? `${lineUsername}さん` : '未設定'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-jp-medium text-gray-700">同意日時</p>
                        <p className="text-base font-jp-bold text-green-800">
                          {formatConsentDate(consentDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-jp-medium text-green-800">
                        プライバシーポリシーに同意済み
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-green-700 mt-3">
                  ※ この情報は編集できません。変更が必要な場合はお問い合わせください。
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
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

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-xs text-gray-500 mb-2">
            このプライバシーポリシーは個人情報保護法に準拠して作成されています
          </p>
          <p className="text-xs text-gray-400">
            最終更新日：2025年1月22日
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;