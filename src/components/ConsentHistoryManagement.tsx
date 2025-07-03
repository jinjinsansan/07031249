import React, { useState, useEffect } from 'react';
import { Shield, Download, Search, Calendar, User, CheckCircle, XCircle, Filter, RotateCcw, FileText } from 'lucide-react';
import { consentService, syncService } from '../lib/supabase';
import { useSupabase } from '../hooks/useSupabase';

interface ConsentHistory {
  id: string;
  line_username: string;
  consent_given: boolean;
  consent_date: string;
  ip_address: string;
  user_agent: string;
}

const ConsentHistoryManagement: React.FC = () => {
  const [consentHistories, setConsentHistories] = useState<ConsentHistory[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<ConsentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [consentFilter, setConsentFilter] = useState<'all' | 'consented' | 'declined'>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  
  const { isConnected } = useSupabase();

  useEffect(() => {
    loadConsentHistories();
  }, []);

  useEffect(() => {
    filterHistories();
  }, [consentHistories, searchTerm, consentFilter, dateRange]);

  const loadConsentHistories = async () => {
    setLoading(true);
    try {
      if (isConnected) {
        // Supabaseから読み込み
        const supabaseHistories = await consentService.getAllConsentHistories();
        if (supabaseHistories.length > 0) {
          setConsentHistories(supabaseHistories);
          // ローカルストレージにも保存
          localStorage.setItem('consent_histories', JSON.stringify(supabaseHistories));
        } else {
          // Supabaseにデータがない場合はローカルから読み込み
          loadLocalHistories();
        }
      } else {
        // ローカルストレージから読み込み
        loadLocalHistories();
      }
    } catch (error) {
      console.error('同意履歴読み込みエラー:', error);
      // エラーの場合はローカルから読み込み
      loadLocalHistories();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalHistories = () => {
    const savedHistories = localStorage.getItem('consent_histories');
    if (savedHistories) {
      const parsedHistories = JSON.parse(savedHistories);
      setConsentHistories(parsedHistories);
    } else {
      setConsentHistories([]);
    }
  };

  const handleSyncToSupabase = async () => {
    if (!isConnected) {
      alert('Supabaseに接続されていません。');
      return;
    }

    setSyncing(true);
    try {
      const success = await syncService.syncConsentHistories();
      if (success) {
        alert('同意履歴をSupabaseに同期しました！');
        await loadConsentHistories(); // 再読み込み
      } else {
        alert('同期に失敗しました。');
      }
    } catch (error) {
      console.error('同期エラー:', error);
      alert('同期中にエラーが発生しました。');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncFromSupabase = async () => {
    if (!isConnected) {
      alert('Supabaseに接続されていません。');
      return;
    }

    setSyncing(true);
    try {
      const success = await syncService.syncConsentHistoriesToLocal();
      if (success) {
        alert('Supabaseから同意履歴を同期しました！');
        await loadConsentHistories(); // 再読み込み
      } else {
        alert('同期に失敗しました。');
      }
    } catch (error) {
      console.error('同期エラー:', error);
      alert('同期中にエラーが発生しました。');
    } finally {
      setSyncing(false);
    }
  };

  const filterHistories = () => {
    let filtered = [...consentHistories];

    // 検索フィルター
    if (searchTerm.trim()) {
      filtered = filtered.filter(history =>
        history.line_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.ip_address.includes(searchTerm.toLowerCase())
      );
    }

    // 同意状況フィルター
    if (consentFilter !== 'all') {
      filtered = filtered.filter(history =>
        consentFilter === 'consented' ? history.consent_given : !history.consent_given
      );
    }

    // 日付範囲フィルター
    if (dateRange.start) {
      filtered = filtered.filter(history => 
        new Date(history.consent_date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(history => 
        new Date(history.consent_date) <= new Date(dateRange.end + 'T23:59:59')
      );
    }

    // 日付順でソート（新しい順）
    filtered.sort((a, b) => new Date(b.consent_date).getTime() - new Date(a.consent_date).getTime());

    setFilteredHistories(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setConsentFilter('all');
    setDateRange({ start: '', end: '' });
  };

  const exportToCSV = () => {
    if (filteredHistories.length === 0) {
      alert('エクスポートするデータがありません。');
      return;
    }

    // UTF-8 BOMを追加して文字化けを防ぐ
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      ['ユーザー名', '同意状況', '同意日時', 'IPアドレス', 'ユーザーエージェント'],
      ...filteredHistories.map(history => [
        history.line_username,
        history.consent_given ? '同意' : '拒否',
        formatDateTime(history.consent_date),
        history.ip_address,
        `"${history.user_agent.replace(/"/g, '""')}"`
      ])
    ].map(row => row.join(',')).join('\n');

    // UTF-8エンコーディングを明示的に指定
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `同意履歴_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateUserAgent = (userAgent: string, maxLength: number = 50) => {
    if (userAgent.length <= maxLength) return userAgent;
    return userAgent.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-jp-normal">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-jp-bold text-gray-900">同意履歴管理</h2>
          <p className="text-gray-600 font-jp-normal text-sm mt-1">
            プライバシーポリシーの同意履歴を管理します
            {isConnected && <span className="text-green-600 ml-2">• Supabase接続中</span>}
            {!isConnected && <span className="text-yellow-600 ml-2">• ローカルモード</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isConnected && (
            <>
              <button
                onClick={handleSyncToSupabase}
                disabled={syncing || consentHistories.length === 0}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
              >
                {syncing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                <span>Supabaseに同期</span>
              </button>
              <button
                onClick={handleSyncFromSupabase}
                disabled={syncing}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
              >
                {syncing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Supabaseから同期</span>
              </button>
            </>
          )}
          <button
            onClick={exportToCSV}
            disabled={filteredHistories.length === 0}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>CSV出力</span>
          </button>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-jp-medium text-gray-700 mb-2">
              検索
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ユーザー名、IPアドレスで検索"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-jp-medium text-gray-700 mb-2">
              同意状況
            </label>
            <select
              value={consentFilter}
              onChange={(e) => setConsentFilter(e.target.value as 'all' | 'consented' | 'declined')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
            >
              <option value="all">すべて</option>
              <option value="consented">同意済み</option>
              <option value="declined">拒否</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-jp-medium text-gray-700 mb-2">
              開始日
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-jp-medium text-gray-700 mb-2">
              終了日
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
            />
          </div>
        </div>

        {/* アクティブフィルター表示 */}
        {(searchTerm || consentFilter !== 'all' || dateRange.start || dateRange.end) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-jp-medium text-gray-700">
                  {filteredHistories.length}件 / {consentHistories.length}件
                </span>
              </div>
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 font-jp-normal"
              >
                <RotateCcw className="w-4 h-4" />
                <span>フィルタークリア</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-jp-medium text-gray-700">総ユーザー数</span>
          </div>
          <p className="text-2xl font-jp-bold text-blue-600 mt-1">{consentHistories.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-jp-medium text-gray-700">同意済み</span>
          </div>
          <p className="text-2xl font-jp-bold text-green-600 mt-1">
            {consentHistories.filter(h => h.consent_given).length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-jp-medium text-gray-700">拒否</span>
          </div>
          <p className="text-2xl font-jp-bold text-red-600 mt-1">
            {consentHistories.filter(h => !h.consent_given).length}
          </p>
        </div>
      </div>

      {/* 同意履歴一覧 */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredHistories.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-jp-medium text-gray-500 mb-2">
              {consentHistories.length === 0 ? '同意履歴がありません' : '検索結果がありません'}
            </h3>
            <p className="text-gray-400 font-jp-normal">
              {consentHistories.length === 0 
                ? 'ユーザーがプライバシーポリシーに同意すると履歴が表示されます'
                : '検索条件を変更してお試しください'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    同意状況
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    同意日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    IPアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    ユーザーエージェント
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistories.map((history) => (
                  <tr key={history.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-jp-medium text-gray-900">
                            {history.line_username}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {history.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-jp-medium ${
                        history.consent_given
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {history.consent_given ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            同意
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            拒否
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDateTime(history.consent_date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {history.ip_address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        <span 
                          className="cursor-help" 
                          title={history.user_agent}
                        >
                          {truncateUserAgent(history.user_agent)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentHistoryManagement;