import React from 'react';
import { MessageCircle, Heart, Star } from 'lucide-react';

const EmotionTypes: React.FC = () => {
  const negativeEmotions = [
    {
      name: '恐怖',
      color: 'purple-500',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      description: '息苦しい、手足が震える、冷や汗をかく、胃がキュッとなる、足がすくむ、心臓がバクバクする、こわい'
    },
    {
      name: '悲しみ',
      color: 'blue-500',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      description: '喪失感、失った感覚。大好きなおばあちゃんが亡くなったなど。心にぽっかり穴が空いた感覚'
    },
    {
      name: '怒り',
      color: 'red-500',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      description: '頭に血が上る、顔が熱くなる、拳を握りしめる、歯を食いしばる、体が熱くなる、爆発しそうになる、イライラする'
    },
    {
      name: '寂しさ',
      color: 'indigo-500',
      bgColor: 'bg-indigo-100',
      borderColor: 'border-indigo-200',
      description: '誰かに会いたい、声を聞きたい、抱きしめてほしい、温もりが欲しい、孤独感'
    },
    {
      name: '罪悪感',
      color: 'orange-500',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
      description: '申し訳ない気持ち、謝りたい気持ち、後悔、取り返しがつかない感覚、罪'
    },
    {
      name: '悔しさ',
      color: 'green-500',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      description: '歯がゆい、もどかしい、負けた感覚、やり返したい、リベンジしたい'
    },
    {
      name: '恥ずかしさ',
      color: 'pink-500',
      bgColor: 'bg-pink-100',
      borderColor: 'border-pink-200',
      description: '顔が赤くなる、穴があったら入りたい、隠れたい、人に見られたくない、小さくなりたい、恥らい'
    },
    {
      name: '無価値感',
      color: 'gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      description: '消えてしまいたい、存在意義がない、役に立たない、劣等感、みじめな気持ち、自己否定、価値がない'
    }
  ];

  const positiveEmotions = [
    {
      name: '嬉しい',
      color: 'yellow-500',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      description: '心が弾む、笑顔になる、胸がいっぱいになる、ワクワクする、喜び、楽しい気持ち'
    },
    {
      name: '感謝',
      color: 'teal-500',
      bgColor: 'bg-teal-100',
      borderColor: 'border-teal-200',
      description: '心から感謝する気持ち、ありがたい、恩返ししたい、誰かに助けられた感覚、温かい気持ち'
    },
    {
      name: '達成感',
      color: 'lime-500',
      bgColor: 'bg-lime-100',
      borderColor: 'border-lime-200',
      description: '目標を達成した満足感、成し遂げた喜び、努力が報われた感覚、自信がついた、誇らしい'
    },
    {
      name: '幸せ',
      color: 'amber-500',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-200',
      description: '満たされた気持ち、心が温かい、穏やかな喜び、充実感、安心感、平和な気持ち'
    }
  ];

  return (
    <div className="w-full space-y-6 px-2">
      <div className="bg-white rounded-xl shadow-lg p-6 diary-card">
        <h1 className="text-2xl font-jp-bold text-gray-900 mb-8">
          ネガティブな感情の種類について
        </h1>
        
        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex items-start space-x-3 mb-6">
            <MessageCircle className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-jp-bold text-gray-900 mb-4">感情の見分け方</h2>
              <div className="space-y-2 text-gray-700 font-jp-normal leading-relaxed">
                <p>ネガティブな感情の種類を特定してください。</p>
                <p>感情の種類が特定できない場合は、チャットからお問い合わせください。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 感情カード一覧 */}
        <div className="space-y-8">
          {/* ネガティブな感情 */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <MessageCircle className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-jp-bold text-gray-900">ネガティブな感情</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {negativeEmotions.map((emotion, index) => (
                <div
                  key={emotion.name}
                  className={`${emotion.bgColor} rounded-xl p-4 sm:p-6 border ${emotion.borderColor} shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-4 h-4 rounded-full mt-2 flex-shrink-0 bg-gray-600"></div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-jp-bold text-gray-900 mb-3">
                        {emotion.name}
                      </h3>
                      <p className="text-gray-700 font-jp-normal text-xs sm:text-sm leading-relaxed break-words">
                        {emotion.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* ポジティブな感情 */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Star className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-jp-bold text-gray-900">ポジティブな感情</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {positiveEmotions.map((emotion, index) => (
                <div
                  key={emotion.name}
                  className={`${emotion.bgColor} rounded-xl p-4 sm:p-6 border ${emotion.borderColor} shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-4 h-4 rounded-full mt-2 flex-shrink-0 bg-amber-500"></div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-jp-bold text-gray-900 mb-3">
                        {emotion.name}
                      </h3>
                      <p className="text-gray-700 font-jp-normal text-xs sm:text-sm leading-relaxed break-words">
                        {emotion.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionTypes;