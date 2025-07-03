import React from 'react';
import { Heart, Target, Eye, ArrowRight, Lightbulb } from 'lucide-react';

const HowTo: React.FC = () => {
  return (
    <div className="w-full space-y-6 px-2">
      <div className="bg-white rounded-xl shadow-lg p-6 diary-card">
        <h1 className="text-2xl font-jp-bold text-gray-900 text-center mb-8">
          かんじょうにっきの使い方
        </h1>
        
        <div className="text-center mb-8">
          <p className="text-lg font-jp-medium text-gray-800">
            このアプリには<span className="text-blue-600 font-jp-bold">２つの目的</span>があります
          </p>
        </div>
        
        <div className="space-y-8">
          {/* 目的1: 自己肯定感を育てる */}
          <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-jp-bold text-xl flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-jp-bold text-gray-900 mb-4">自己肯定感を育てる</h2>
                <p className="text-gray-700 font-jp-normal leading-relaxed mb-6 text-sm sm:text-base">
                  一般社団法人NAMIDAサポート協会が提唱する<span className="font-jp-bold text-blue-600">テープ式心理学</span>では<span className="font-jp-bold text-red-600">無価値感にのみフォーカス</span>をあてます。
                </p>
                
                {/* ポイント */}
                <div className="bg-white rounded-lg p-4 sm:p-6 border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Target className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-jp-bold text-blue-900 mb-2">ポイント</h3>
                      <p className="text-gray-700 font-jp-normal leading-relaxed text-sm sm:text-base">
                        無価値感を下げるだけで自己肯定感が上がるという理論です。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 目的2: 感情を知ることで気づきを促す */}
          <div className="bg-green-50 rounded-xl p-4 sm:p-6 border border-green-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-jp-bold text-xl flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-jp-bold text-gray-900 mb-4">感情を知ることで気づきを促す</h2>
                <p className="text-gray-700 font-jp-normal leading-relaxed mb-6 text-sm sm:text-base">
                  心の苦しみの原因は外の世界ではなく、<span className="font-jp-bold text-green-600">全て自分の内側にある</span>と考えます。
                </p>
                
                {/* 心の中の方程式 */}
                <div className="bg-white rounded-lg p-4 sm:p-6 border border-green-200 mb-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <Lightbulb className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <h3 className="font-jp-bold text-green-900">心の中の方程式</h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 text-center">
                    <div className="bg-blue-100 rounded-lg p-3 sm:p-4 flex-1 w-full sm:w-auto">
                      <div className="text-sm text-blue-600 font-jp-medium mb-1">①</div>
                      <div className="font-jp-bold text-gray-800 text-sm sm:text-base">出来事</div>
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0 transform rotate-90 sm:rotate-0" />
                    <div className="bg-yellow-100 rounded-lg p-3 sm:p-4 flex-1 w-full sm:w-auto">
                      <div className="text-sm text-yellow-600 font-jp-medium mb-1">②</div>
                      <div className="font-jp-bold text-gray-800 text-sm sm:text-base">意味づけ</div>
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0 transform rotate-90 sm:rotate-0" />
                    <div className="bg-red-100 rounded-lg p-3 sm:p-4 flex-1 w-full sm:w-auto">
                      <div className="text-sm text-red-600 font-jp-medium mb-1">③</div>
                      <div className="font-jp-bold text-gray-800 text-sm sm:text-base">感情発生</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 心の中を可視化する訓練 */}
          <div className="bg-purple-50 rounded-xl p-4 sm:p-6 border border-purple-200">
            <div className="flex items-start space-x-4">
              <Eye className="w-8 h-8 text-purple-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-jp-bold text-gray-900 mb-4">心の中を可視化する訓練</h2>
                <p className="text-gray-700 font-jp-normal leading-relaxed text-sm sm:text-base">
                  かんじょうにっきを毎日つけることで、自然と心の中と向き合えるようになります。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowTo;