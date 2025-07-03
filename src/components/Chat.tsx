import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Heart, Clock, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  is_counselor: boolean;
  created_at: string;
  sender_name?: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lineUsername, setLineUsername] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初期化
  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    // LINEユーザー名を取得
    const savedUsername = localStorage.getItem('line-username');
    if (savedUsername) {
      setLineUsername(savedUsername);
    }

    await loadLocalChat();
    setLoading(false);
  };

  const loadLocalChat = async () => {
    try {
      // ローカルストレージからメッセージを読み込み
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error('メッセージの読み込みエラー:', error);
          setMessages([]);
        }
      } else {
        // 初回の場合、ウェルカムメッセージを設定
        const welcomeMessage: Message = {
          id: 'welcome',
          content: 'こんにちは！カウンセラーサポートへようこそ。現在、専門のカウンセラーが対応できるまでお待ちください。お気軽にメッセージをお送りください。緊急の場合は、お近くの相談窓口にご連絡ください。',
          is_counselor: true,
          created_at: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
        localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
      }
      
      console.log('ローカルチャットを初期化しました');
      
    } catch (error) {
      console.error('ローカルチャット初期化エラー:', error);
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    
    try {
      // ユーザーメッセージを追加
      const userMessage: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        is_counselor: false,
        created_at: new Date().toISOString()
      };
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
      setNewMessage('');
      
      // カウンセラーからの自動返信をシミュレーション
      setTimeout(() => {
        const counselorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'メッセージを受信いたしました。現在、専門のカウンセラーが対応を準備しております。しばらくお待ちください。お急ぎの場合は、緊急相談窓口（#7119）にご連絡ください。',
          is_counselor: true,
          created_at: new Date().toISOString()
        };
        
        const finalMessages = [...updatedMessages, counselorMessage];
        setMessages(finalMessages);
        localStorage.setItem('chatMessages', JSON.stringify(finalMessages));
      }, 1500);
      
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      alert('メッセージの送信に失敗しました。もう一度お試しください。');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearChat = () => {
    if (window.confirm('チャット履歴を削除しますか？')) {
      setMessages([]);
      localStorage.removeItem('chatMessages');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-jp-normal">チャットを初期化中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg h-[600px] flex flex-col">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-jp-semibold">カウンセラーサポート</h3>
              <p className="text-blue-100 text-sm font-jp-normal">
                ローカルモード
                {lineUsername && (
                  <span className="ml-2">({lineUsername})</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* 接続状態インジケーター */}
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <button
              onClick={clearChat}
              className="text-blue-100 hover:text-white p-1 rounded transition-colors"
              title="履歴削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-jp-medium text-gray-600 mb-2">
              カウンセラーとのチャット
            </h3>
            <p className="text-gray-500 font-jp-normal mb-4">
              心の専門家があなたをサポートします。<br />
              お気軽にメッセージをお送りください。
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-block">
              <p className="text-blue-800 font-jp-normal text-sm">
                ローカルモードで動作中です
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.is_counselor ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.is_counselor
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.is_counselor ? (
                    <Heart className="w-4 h-4 text-blue-600" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="text-xs font-jp-medium">
                    {message.is_counselor ? 'カウンセラー' : 'あなた'}
                  </span>
                </div>
                <p className="font-jp-normal leading-relaxed">{message.content}</p>
                <div className="flex items-center justify-end mt-1">
                  <Clock className="w-3 h-3 mr-1 opacity-70" />
                  <span className="text-xs opacity-70">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="border-t p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-800 font-jp-normal">
              ローカルモードで動作中です。メッセージは自動応答で返信されます。
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`px-4 py-2 rounded-lg font-jp-medium transition-colors ${
              newMessage.trim() && !sending
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;