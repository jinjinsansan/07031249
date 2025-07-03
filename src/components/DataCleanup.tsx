import React, { useState } from 'react';
import { Trash2, RefreshCw, CheckCircle, AlertTriangle, Shield, Database, AlertCircle } from 'lucide-react';
import { cleanupTestData, deleteAllDiaries, removeDuplicateEntries } from '../lib/cleanupTestData';

const DataCleanup: React.FC = () => {
  const [cleaning, setCleaning] = useState(false);
  const [result, setResult] = useState<{
    localRemoved: number;
    supabaseRemoved: number;
    success: boolean;
  } | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [removingDuplicates, setRemovingDuplicates] = useState(false);

  const handleCleanupTestData = async () => {
    if (!window.confirm('Boltが作成したテストデータを削除します。この操作は元に戻せません。続行しますか？')) {
      return;
    }
    
    setCleaning(true);
    try {
      const cleanupResult = await cleanupTestData();
      setResult(cleanupResult);
      
      if (cleanupResult.success) {
        alert(`テストデータの削除が完了しました。\n\nローカルから${cleanupResult.localRemoved}件のテストデータを削除しました。\nSupabaseから${cleanupResult.supabaseRemoved}件のテストデータを削除しました。`);
      } else {
        alert('テストデータの削除中にエラーが発生しました。');
      }
    } catch (error) {
      console.error('テストデータ削除エラー:', error);
      alert('テストデータの削除中にエラーが発生しました。');
    } finally {
      setCleaning(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!window.confirm('すべての日記データを削除します。この操作は元に戻せません。本当に続行しますか？')) {
      return;
    }
    
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const deleteResult = await deleteAllDiaries();
      setResult(deleteResult);
      
      if (deleteResult.success) {
        alert(`すべての日記データの削除が完了しました。\n\nローカルから${deleteResult.localRemoved}件のデータを削除しました。\nSupabaseから${deleteResult.supabaseRemoved}件のデータを削除しました。`);
      } else {
        alert('データの削除中にエラーが発生しました。');
      }
    } catch (error) {
      console.error('全データ削除エラー:', error);
      alert('データの削除中にエラーが発生しました。');
    } finally {
      setDeletingAll(false);
      setShowDeleteAllConfirm(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!window.confirm('重複した日記データを削除します。この操作は元に戻せません。続行しますか？')) {
      return;
    }
    
    setRemovingDuplicates(true);
    try {
      const result = await removeDuplicateEntries();
      setResult(result);
      
      if (result.success) {
        alert(`重複データの削除が完了しました。\n\nローカルから${result.localRemoved}件の重複データを削除しました。\nSupabaseから${result.supabaseRemoved}件の重複データを削除しました。`);
      } else {
        alert('重複データの削除中にエラーが発生しました。');
      }
    } catch (error) {
      console.error('重複データ削除エラー:', error);
      alert('重複データの削除中にエラーが発生しました。');
    } finally {
      setRemovingDuplicates(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Trash2 className="w-8 h-8 text-red-600" />
        <h2 className="text-xl font-jp-bold text-gray-900">データ管理</h2>
      </div>
      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200 mb-6">
        <div className="flex items-start space-x-3">
          <Database className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-jp-bold text-yellow-900 mb-3">重複データの削除</h3>
            <p className="text-yellow-800 font-jp-normal mb-4">
              自動同期によって発生した重複データを削除します。同じ日付・感情・内容を持つ重複エントリーを検出して削除します。
            </p>
            <button
              onClick={handleRemoveDuplicates}
              disabled={removingDuplicates}
              className="flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-jp-medium transition-colors w-full"
            >
              {removingDuplicates ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              <span>重複データを削除</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-lg p-6 border border-red-200 mb-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-jp-bold text-red-900 mb-3">重要な注意事項</h3>
            <p className="text-red-800 font-jp-normal mb-4">
              この機能は、Boltが作成したテストデータを削除します。実際のユーザーが入力したデータは保持されます。
            </p>
            <ul className="list-disc list-inside space-y-1 text-red-800 font-jp-normal">
              <li>削除されるのはテストデータのみです</li>
              <li>実際のユーザーデータは保持されます</li>
              <li>この操作は元に戻せません</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-lg p-6 border border-red-200 mb-6">
        <div className="flex items-start space-x-3">
          <Database className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-jp-bold text-red-900 mb-3">データベースの同期状態</h3>
            <p className="text-red-800 font-jp-normal mb-4">
              カウンセラー管理画面で日記を削除した場合、ローカルストレージとSupabaseの両方から削除されるはずですが、
              同期エラーが発生している可能性があります。以下のボタンを使用して、データベースを完全にクリーンアップできます。
            </p>
            <div className="bg-white rounded-lg p-4 border border-red-300">
              <h4 className="font-jp-semibold text-red-900 mb-2">危険な操作</h4>
              <p className="text-red-700 text-sm mb-4">
                以下の操作は取り消せません。必要な場合のみ実行してください。
              </p>
              <button
                onClick={handleDeleteAllData}
                disabled={deletingAll}
                className="flex items-center justify-center space-x-2 bg-red-700 hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-jp-medium transition-colors w-full"
              >
                {deletingAll ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                <span>すべての日記データを削除</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleCleanupTestData}
        disabled={cleaning}
        className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-jp-medium transition-colors w-full"
      >
        {cleaning ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <Trash2 className="w-5 h-5" />
        )}
        <span>テストデータを削除</span>
      </button>

      {result && (
        <div className={`mt-6 rounded-lg p-4 border ${
          result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-jp-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.success ? 'データの削除が完了しました' : 'データの削除中にエラーが発生しました'}
            </span>
          </div>
          {result.success && (
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-green-700">
                ローカルから<span className="font-jp-bold">{result.localRemoved}件</span>のデータを削除しました
              </p>
              <p className="text-green-700">
                Supabaseから<span className="font-jp-bold">{result.supabaseRemoved}件</span>のデータを削除しました
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* 全削除確認モーダル */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start space-x-3 mb-6">
              <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-jp-bold text-gray-900 mb-2">最終確認</h3>
                <p className="text-gray-700 font-jp-normal">
                  この操作を実行すると、すべての日記データがローカルストレージとSupabaseの両方から完全に削除されます。
                  この操作は元に戻せません。本当に続行しますか？
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={confirmDeleteAll}
                disabled={deletingAll}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-jp-medium transition-colors flex items-center justify-center space-x-2"
              >
                {deletingAll ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>削除中...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>削除する</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                disabled={deletingAll}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-jp-medium transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataCleanup;