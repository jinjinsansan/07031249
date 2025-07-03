import React from 'react';
import { MessageCircle, Heart, Shield, Users, Edit, Database } from 'lucide-react';

const Support: React.FC = () => {
  return (
    <div className="w-full space-y-6 px-2">
      <div className="bg-white rounded-xl shadow-lg p-6 diary-card">
        <h1 className="text-2xl font-jp-bold text-gray-900 text-center mb-8">
          サポート付き
        </h1>
        
        <div className="text-center mb-8">
          <p className="text-gray-700 font-jp-normal leading-relaxed text-sm sm:text-base">
            一般社団法人NAMIDAサポート協会の専属カウンセラーが、
            かんじょうにっきの内容を定期的にチェックしています。
          </p>
        </div>
        
        <div className="space-y-8">
          {/* 専属カウンセラーによるサポート */}
          <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
            <div className="flex items-start space-x-4">
              <Heart className="w-8 h-8 text-blue-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-jp-bold text-gray-900 mb-4">専属カウンセラーによるサポート</h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-gray-700 font-jp-normal text-sm sm:text-base">緊急対応が必要な方のサポート</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-gray-700 font-jp-normal text-sm sm:text-base">ネガティブな感情の種類の特定サポート</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-gray-700 font-jp-normal text-sm sm:text-base">定期的な内容チェック</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-gray-700 font-jp-normal text-sm sm:text-base">カウンセラーからのコメント機能</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-gray-700 font-jp-normal text-sm sm:text-base">データバックアップ・復元機能</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ノートとLINEbotの併用 */}
          <div className="bg-green-50 rounded-xl p-4 sm:p-6 border border-green-200">
            <div className="flex items-start space-x-4 mb-6">
              <Edit className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-jp-bold text-gray-900 mb-4">物理ノートとアプリノートの併用</h2>
                <p className="text-gray-700 font-jp-normal leading-relaxed text-sm sm:text-base mb-4">
                  物理ノートは目に見える形で日記帳として使用し、<br />
                  同じ内容をアプリノートでも書いてみるのもいいでしょう。
                </p>
              </div>
            </div>

            {/* 物理ノートとアプリノートの比較 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg p-6 border border-green-200 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-base sm:text-lg font-jp-bold text-gray-900 mb-2">物理ノート</h3>
                <p className="text-gray-600 font-jp-normal text-sm sm:text-base">手書きで記録</p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-green-200 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-base sm:text-lg font-jp-bold text-gray-900 mb-2">アプリノート</h3>
                <p className="text-gray-600 font-jp-normal text-sm sm:text-base">デジタルで記録</p>
              </div>
            </div>
          </div>

          {/* 安心・安全なサポート体制 */}
          <div className="bg-purple-50 rounded-xl p-4 sm:p-6 border border-purple-200">
            <div className="flex flex-col items-center text-center mb-6">
              <Shield className="w-8 h-8 text-purple-500 flex-shrink-0 mb-3" />
              <h2 className="text-lg sm:text-xl font-jp-bold text-gray-900 mb-4">安心・安全なサポート体制</h2>
            </div>
            <div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-200 text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <h3 className="font-jp-bold text-gray-900 text-xs sm:text-sm">定期的な専門家による<br />チェック</h3>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-200 text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <h3 className="font-jp-bold text-gray-900 text-xs sm:text-sm">緊急時の迅速な対応</h3>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-200 text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <h3 className="font-jp-bold text-gray-900 text-xs sm:text-sm">感情特定のサポート</h3>
                  </div>
                </div>
            </div>
          </div>

          {/* 一般社団法人NAMIDAサポート協会 */}
          <div className="bg-orange-50 rounded-xl p-4 sm:p-6 border border-orange-200">
            <div className="flex items-start space-x-4">
              <Users className="w-8 h-8 text-orange-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-jp-bold text-gray-900 mb-4">一般社団法人NAMIDAサポート協会</h2>
                <p className="text-gray-700 font-jp-normal leading-relaxed text-sm sm:text-base mb-0">
                  テープ式心理学を提唱し、心の健康をサポートする専門機関です。あなたの心の成長を専門家がしっかりとサポートいたします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;