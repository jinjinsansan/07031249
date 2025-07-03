import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Heart, Clock, Users, AlertTriangle } from 'lucide-react';
import { chatService, userService } from '../lib/supabase';

interface Message {
  id: string;
  content: string;
  is_counselor: boolean;
  created_at: string;
  sender_name?: string;
}

interface ChatRoom {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  user?: {
    line_username: string;
  };
}

const CounselorChat: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRooms = async () => {
    setLoading(true);
    try {
      // 実際の実装では、カウンセラー用のAPIを呼び出す
      // 今回はデモ用のダミーデータ
      const dummyRooms: ChatRoom[] = [
        {
          id: '1',
          user_id: 'user1',
          status: 'active',
          created_at: new Date().toISOString(),
          user: { line_username: 'ユーザー1' }
        },
        {
          id: '2',
          user_id: 'user2',
          status: 'waiting',
          created_at: new Date().toISOString(),
          user: { line_username: 'ユーザー2' }
        }
      ];
      setChatRooms(dummyRooms);
    } catch (error) {
      console.error('チャットルーム読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatRoomId: string) => {
    try {
      const messagesData = await chatService.getChatMessages(chatRoomId);
      setMessages(messagesData);
    } catch (error) {
      console.error('メッセージ読み込みエラー:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending || !selectedRoom) return;

    setSending(true);
    
    try {
      const message = await chatService.sendMessage(
        selectedRoom.id,
        newMessage.trim(),
        undefined,
        'counselor-id' // 実際の実装では現在のカウンセラーIDを使用
      );
      
      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      alert('メッセージの送信に失敗しました。');
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

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoomStatusText = (status: string) => {
    switch (status) {
      case 'active': return '対応中';
      case 'waiting': return '待機中';
      case 'closed': return '終了';
      default: return '不明';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-jp-bold text-gray-900 mb-6">カウンセラーチャット</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* チャットルーム一覧 */}
          <div className="lg:col-span-1 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-jp-semibold text-gray-900 flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>チャットルーム ({chatRooms.length})</span>
              </h3>
            </div>
            
            <div className="overflow-y-auto h-full">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 font-jp-normal">読み込み中...</p>
                </div>
              ) : chatRooms.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-jp-normal">チャットルームがありません</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chatRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                        selectedRoom?.id === room.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-jp-medium text-gray-900">
                          {room.user?.line_username || 'Unknown User'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-jp-medium border ${getRoomStatusColor(room.status)}`}>
                          {getRoomStatusText(room.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(room.created_at)}</span>
                      </div>
                      {room.status === 'waiting' && (
                        <div className="flex items-center space-x-1 mt-2 text-xs text-yellow-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span>返信待ち</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* チャットエリア */}
          <div className="lg:col-span-2 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            {selectedRoom ? (
              <>
                {/* チャットヘッダー */}
                <div className="bg-blue-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-jp-semibold">
                          {selectedRoom.user?.line_username || 'Unknown User'}
                        </h3>
                        <p className="text-blue-100 text-sm font-jp-normal">
                          {getRoomStatusText(selectedRoom.status)}
                        </p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                </div>

                {/* メッセージエリア */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-jp-medium text-gray-600 mb-2">
                        チャット開始
                      </h3>
                      <p className="text-gray-500 font-jp-normal">
                        ユーザーとのチャットを開始してください
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.is_counselor ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.is_counselor
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.is_counselor ? (
                              <Heart className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                            <span className="text-xs font-jp-medium">
                              {message.is_counselor ? 'あなた' : selectedRoom.user?.line_username}
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
                <div className="border-t p-4 bg-white">
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-jp-medium text-gray-500 mb-2">
                    チャットルームを選択
                  </h3>
                  <p className="text-gray-400 font-jp-normal">
                    左側からチャットルームを選択してください
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorChat;