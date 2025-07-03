import React from 'react';
import { Heart } from 'lucide-react';

const WelcomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-amber-50">
      {/* 装飾的な円形要素 */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-amber-100 rounded-full opacity-50"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-amber-100 rounded-full opacity-50"></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-amber-100 rounded-full opacity-30"></div>
      <div className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-amber-100 rounded-full opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-100 rounded-full opacity-20"></div>
      
      {/* メインコンテンツ */}
      <div className="z-10 flex flex-col items-center text-center px-4 max-w-md">
        {/* ハートアイコン */}
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-8">
          <Heart className="w-12 h-12 text-orange-300" />
        </div>
        
        {/* タイトル */}
        <h1 className="text-4xl sm:text-5xl font-jp-bold text-gray-900 mb-4">
          かんじょうにっき
        </h1>
        
        {/* サブタイトル */}
        <p className="text-xl font-jp-medium text-gray-700 mb-12">
          自己肯定感を育てる感情日記アプリ
        </p>
        
        {/* はじめるボタン */}
        <button 
          onClick={() => {
            const event = new CustomEvent('startApp');
            window.dispatchEvent(event);
          }}
          className="bg-orange-400 hover:bg-orange-500 text-white px-10 py-3 rounded-full font-jp-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          はじめる
        </button>
        
        {/* 協会名 */}
        <p className="text-gray-500 font-jp-normal text-sm mt-16">
          一般社団法人NAMIDAサポート協会
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;