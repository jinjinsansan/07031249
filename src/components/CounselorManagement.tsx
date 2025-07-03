import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit3, Trash2, Save, X, UserCheck, UserX, Mail, Phone, Calendar, AlertTriangle, Eye, Search, Filter } from 'lucide-react';

interface Counselor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  is_active: boolean;
  assigned_cases: number;
  total_cases: number;
  created_at: string;
  last_active?: string;
}

interface JournalEntry {
  id: string;
  date: string;
  emotion: string;
  event: string;
  realization: string;
  assigned_counselor?: string;
  urgency_level?: 'high' | 'medium' | 'low';
  user?: {
    line_username: string;
  };
}

const CounselorManagement: React.FC = () => {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    is_active: true
  });

  // 統計情報の状態
  const [stats, setStats] = useState({
    totalCounselors: 0,
    activeCounselors: 0,
    totalAssignedCases: 0,
    averageAssignedCases: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // カウンセラーデータが変更されたら統計情報を更新
    updateStats();
  }, [counselors]);

  const loadData = async () => {
    setLoading(true);
    try {
      // カウンセラーデータを生成（実際の実装ではAPIから取得）
      const mockCounselors: Counselor[] = [
        {
          id: '1',
          name: '心理カウンセラー仁',
          email: 'jin@namisapo.com',
          phone: '090-1234-5678',
          specialization: '無価値感・自己肯定感',
          is_active: true,
          assigned_cases: 0,
          total_cases: 0,
          created_at: '2024-01-15T09:00:00Z',
          last_active: '2024-01-21T14:30:00Z'
        },
        {
          id: '2',
          name: '心理カウンセラーAOI',
          email: 'aoi@namisapo.com',
          phone: '090-2345-6789',
          specialization: '恐怖・不安障害',
          is_active: true,
          assigned_cases: 0,
          total_cases: 0,
          created_at: '2024-02-01T09:00:00Z',
          last_active: '2024-01-22T16:15:00Z'
        },
        {
          id: '3',
          name: '心理カウンセラーあさみ',
          email: 'asami@namisapo.com',
          phone: '090-3456-7890',
          specialization: '悲しみ・喪失感',
          is_active: true,
          assigned_cases: 0,
          total_cases: 0,
          created_at: '2024-03-10T09:00:00Z',
          last_active: '2024-01-21T11:45:00Z'
        },
        {
          id: '4',
          name: '心理カウンセラーSHU',
          email: 'shu@namisapo.com',
          phone: '090-4567-8901',
          specialization: '怒り・感情制御',
          is_active: false,
          assigned_cases: 0,
          total_cases: 0,
          created_at: '2024-04-20T09:00:00Z',
          last_active: '2024-01-15T10:20:00Z'
        },
        {
          id: '5',
          name: '心理カウンセラーゆーちゃ',
          email: 'yucha@namisapo.com',
          phone: '090-5678-9012',
          specialization: '寂しさ・対人関係',
          is_active: true,
          assigned_cases: 0,
          total_cases: 0,
          created_at: '2024-05-05T09:00:00Z',
          last_active: '2024-01-21T13:20:00Z'
        },
        {
          id: '6',
          name: '心理カウンセラーSammy',
          email: 'sammy@namisapo.com',
          phone: '090-6789-0123',
          specialization: '罪悪感・恥',
          is_active: true,
          assigned_cases: 0,
          total_cases: 0,
          created_at: '2024-06-12T09:00:00Z',
          last_active: '2024-01-22T15:50:00Z'
        }
      ];

      setCounselors(mockCounselors);

      // 日記データを読み込み
      const savedEntries = localStorage.getItem('journalEntries');
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries);
        setEntries(parsedEntries);
      }

    } catch (error) {
      console.error('データ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 統計情報を更新する関数
  const updateStats = () => {
    const totalCounselors = counselors.length;
    const activeCounselors = counselors.filter(c => c.is_active).length;
    const totalAssignedCases = counselors.reduce((sum, c) => sum + c.assigned_cases, 0);
    const averageAssignedCases = activeCounselors > 0 
      ? Math.round(totalAssignedCases / activeCounselors) 
      : 0;

    setStats({
      totalCounselors,
      activeCounselors,
      totalAssignedCases,
      averageAssignedCases
    });
  };

  const handleAddCounselor = () => {
    setShowAddForm(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      is_active: true
    });
  };

  const handleEditCounselor = (counselor: Counselor) => {
    setEditingCounselor(counselor);
    setFormData({
      name: counselor.name,
      email: counselor.email,
      phone: counselor.phone || '',
      specialization: counselor.specialization || '',
      is_active: counselor.is_active
    });
  };

  const handleSaveCounselor = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('名前とメールアドレスは必須です。');
      return;
    }

    if (editingCounselor) {
      // 編集
      setCounselors(prev => prev.map(counselor =>
        counselor.id === editingCounselor.id
          ? {
              ...counselor,
              ...formData
            }
          : counselor
      ));
      setEditingCounselor(null);
    } else {
      // 新規追加
      const newCounselor: Counselor = {
        id: Date.now().toString(),
        ...formData,
        assigned_cases: 0,
        total_cases: 0,
        created_at: new Date().toISOString()
      };
      setCounselors(prev => [...prev, newCounselor]);
      setShowAddForm(false);
    }

    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      is_active: true
    });
  };

  const handleDeleteCounselor = (counselor: Counselor) => {
    if (counselor.assigned_cases > 0) {
      alert('担当案件があるカウンセラーは削除できません。先に案件を他のカウンセラーに移管してください。');
      return;
    }

    if (window.confirm(`${counselor.name}を削除しますか？この操作は取り消せません。`)) {
      setCounselors(prev => prev.filter(c => c.id !== counselor.id));
    }
  };

  const handleToggleActive = (counselor: Counselor) => {
    if (counselor.is_active && counselor.assigned_cases > 0) {
      alert('担当案件があるカウンセラーは無効化できません。先に案件を他のカウンセラーに移管してください。');
      return;
    }

    setCounselors(prev => prev.map(c =>
      c.id === counselor.id
        ? { ...c, is_active: !c.is_active }
        : c
    ));
  };

  const handleViewCases = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredCounselors = () => {
    let filtered = counselors;

    if (searchTerm) {
      filtered = filtered.filter(counselor =>
        counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        counselor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (counselor.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(counselor =>
        statusFilter === 'active' ? counselor.is_active : !counselor.is_active
      );
    }

    return filtered;
  };

  const getCounselorCases = (counselorName: string) => {
    return entries.filter(entry => entry.assigned_counselor === counselorName);
  };

  const renderCounselorForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-jp-bold text-gray-900">
              {editingCounselor ? 'カウンセラー編集' : 'カウンセラー追加'}
            </h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingCounselor(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                placeholder="カウンセラー名を入力"
              />
            </div>

            <div>
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                電話番号
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                placeholder="090-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                専門分野
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                placeholder="例：無価値感・自己肯定感"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-jp-medium text-gray-700">
                アクティブ状態
              </label>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSaveCounselor}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>保存</span>
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingCounselor(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-jp-medium transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCaseModal = () => {
    if (!selectedCounselor) return null;

    const counselorCases = getCounselorCases(selectedCounselor.name);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-jp-bold text-gray-900">
                {selectedCounselor.name}の担当案件
              </h2>
              <button
                onClick={() => setSelectedCounselor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {counselorCases.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-jp-medium text-gray-500 mb-2">
                  担当案件がありません
                </h3>
                <p className="text-gray-400 font-jp-normal">
                  現在このカウンセラーに割り当てられた案件はありません
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {counselorCases.map((entry) => (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-900 font-jp-medium">
                          {entry.user?.line_username || 'Unknown User'}
                        </span>
                        <span className="text-gray-500 text-sm font-jp-normal">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      {entry.urgency_level && (
                        <span className={`px-2 py-1 rounded-full text-xs font-jp-medium border ${
                          entry.urgency_level === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                          entry.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          {entry.urgency_level === 'high' ? '高' : entry.urgency_level === 'medium' ? '中' : '低'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 rounded-full text-xs font-jp-medium bg-purple-100 text-purple-800 border border-purple-200">
                        {entry.emotion}
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm font-jp-normal leading-relaxed">
                      {entry.event.length > 100 ? `${entry.event.substring(0, 100)}...` : entry.event}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-jp-normal">読み込み中...</p>
      </div>
    );
  }

  const filteredCounselors = getFilteredCounselors();

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-jp-bold text-gray-900">カウンセラー管理</h2>
        <button
          onClick={handleAddCounselor}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>カウンセラー追加</span>
        </button>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="名前、メール、専門分野で検索"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
            >
              <option value="all">すべて</option>
              <option value="active">アクティブ</option>
              <option value="inactive">非アクティブ</option>
            </select>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-jp-medium text-gray-700">総カウンセラー数</span>
          </div>
          <p className="text-2xl font-jp-bold text-blue-600 mt-1">{counselors.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            <span className="text-sm font-jp-medium text-gray-700">アクティブ</span>
          </div>
          <p className="text-2xl font-jp-bold text-green-600 mt-1">
            {counselors.filter(c => c.is_active).length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-jp-medium text-gray-700">総担当案件</span>
          </div>
          <p className="text-2xl font-jp-bold text-yellow-600 mt-1">
            {counselors.reduce((sum, c) => sum + c.assigned_cases, 0)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-jp-medium text-gray-700">平均担当数</span>
          </div>
          <p className="text-2xl font-jp-bold text-purple-600 mt-1">
            {counselors.length > 0 ? Math.round(counselors.reduce((sum, c) => sum + c.assigned_cases, 0) / counselors.filter(c => c.is_active).length) || 0 : 0}
          </p>
        </div>
      </div>

      {/* カウンセラー一覧 */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredCounselors.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-jp-medium text-gray-500 mb-2">
              カウンセラーが見つかりません
            </h3>
            <p className="text-gray-400 font-jp-normal">
              検索条件を変更するか、新しいカウンセラーを追加してください
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    カウンセラー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    連絡先
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    専門分野
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    担当案件
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    最終活動
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-jp-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCounselors.map((counselor) => (
                  <tr key={counselor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          counselor.is_active ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Users className={`w-5 h-5 ${
                            counselor.is_active ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-jp-medium text-gray-900">
                            {counselor.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {counselor.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1 mb-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{counselor.email}</span>
                        </div>
                        {counselor.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{counselor.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {counselor.specialization || '未設定'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span className="font-jp-bold text-blue-600">
                            {counselor.assigned_cases}
                          </span>
                          <span className="text-gray-500">/ {counselor.total_cases}</span>
                          {counselor.assigned_cases > 0 && (
                            <button
                              onClick={() => handleViewCases(counselor)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="案件を見る"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-jp-medium ${
                        counselor.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {counselor.is_active ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            アクティブ
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            非アクティブ
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {counselor.last_active ? formatDate(counselor.last_active) : '未記録'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-jp-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditCounselor(counselor)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="編集"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(counselor)}
                          className={`p-1 ${
                            counselor.is_active
                              ? 'text-yellow-600 hover:text-yellow-700'
                              : 'text-green-600 hover:text-green-700'
                          }`}
                          title={counselor.is_active ? '無効化' : '有効化'}
                        >
                          {counselor.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteCounselor(counselor)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="削除"
                          disabled={counselor.assigned_cases > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* フォームモーダル */}
      {(showAddForm || editingCounselor) && renderCounselorForm()}

      {/* 案件表示モーダル */}
      {renderCaseModal()}
    </div>
  );
};

export default CounselorManagement;