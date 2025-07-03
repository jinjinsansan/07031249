import React, { useState, useEffect } from 'react';
import { Heart, BookOpen, Search, BarChart2, HelpCircle, MessageCircle, Settings, Home, User, Menu, X, FileText, ArrowRight, Shield, BarChart, Database, LogOut, ExternalLink } from 'lucide-react';
import { useMaintenanceStatus } from './hooks/useMaintenanceStatus';
import { useSupabase } from './hooks/useSupabase';
import { useAutoSync } from './hooks/useAutoSync';
import { getCurrentUser } from './lib/deviceAuth';

// コンポーネントのインポート
import MaintenanceMode from './components/MaintenanceMode';
import PrivacyConsent from './components/PrivacyConsent';
import DeviceAuthLogin from './components/DeviceAuthLogin';
import DeviceAuthRegistration from './components/DeviceAuthRegistration';
import Chat from './components/Chat';
import DataMigration from './components/DataMigration';
import AdminPanel from './components/AdminPanel';
import UserDataManagement from './components/UserDataManagement';

// ページコンポーネントのインポート
import DiaryPage from './pages/DiaryPage';
import DiarySearchPage from './pages/DiarySearchPage';
import EmotionTypes from './pages/EmotionTypes';
import FirstSteps from './pages/FirstSteps';
import HowTo from './pages/HowTo';
import NextSteps from './pages/NextSteps';
import PrivacyPolicy from './pages/PrivacyPolicy';
import WorthlessnessChart from './pages/WorthlessnessChart';
import Support from './pages/Support';
import WelcomePage from './pages/WelcomePage';

function App() {
  // 状態管理
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);
  const [lineUsername, setLineUsername] = useState<string | null>(null);
  const [showDeviceAuth, setShowDeviceAuth] = useState(false);
  const [isDeviceRegistration, setIsDeviceRegistration] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showWelcomePage, setShowWelcomePage] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // カスタムフックの初期化
  const { isMaintenanceMode, config, isAdminBypass } = useMaintenanceStatus();
  const { isConnected, error: supabaseError, retryConnection } = useSupabase();
  
  // ローカルモードの確認
  const isLocalMode = import.meta.env.VITE_LOCAL_MODE === 'true';
  
  // 自動同期フックを初期化
  const autoSync = useAutoSync();
  
  // グローバルに公開（他のコンポーネントからアクセスできるように）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.autoSync = autoSync;
    }
  }, [autoSync]);

  // 初期化
  useEffect(() => {
    // プライバシーポリシー同意状態の確認
    const consentGiven = localStorage.getItem('privacyConsentGiven');
    if (consentGiven !== 'true') {
      setShowPrivacyConsent(true);
    }

    // ユーザー名の取得
    const savedUsername = localStorage.getItem('line-username');
    if (savedUsername) {
      setLineUsername(savedUsername);
    }

    // 管理者状態の確認
    const currentCounselor = localStorage.getItem('current_counselor');
    if (currentCounselor) {
      setIsAdmin(true);
    }
  }, []);

  // 自動同期の状態を確認
  useEffect(() => {
    if (isConnected && autoSync.currentUser && autoSync.isAutoSyncEnabled) {
      console.log('自動同期が有効です。5分ごとにデータが同期されます。ユーザー:', autoSync.currentUser.line_username);
      
      // アプリ起動時に手動で同期を実行
      setTimeout(() => {
        autoSync.triggerManualSync().catch(error => {
          console.error('初期同期エラー:', error);
        });
      }, 2000);
    }
  }, [isConnected, autoSync.currentUser, autoSync.isAutoSyncEnabled]);

  // プライバシーポリシー同意処理
  const handlePrivacyConsent = (accepted: boolean) => {
    if (accepted) {
      // PrivacyConsentコンポーネントでユーザー名を入力してもらう
      const username = localStorage.getItem('line-username');
      localStorage.setItem('privacyConsentGiven', 'true');
      localStorage.setItem('privacyConsentDate', new Date().toISOString());
      setLineUsername(username);
      
      // 同意後に自動的にSupabaseユーザーを作成して同期を開始
      if (isConnected && autoSync.isAutoSyncEnabled) {
        setTimeout(() => {
          autoSync.triggerManualSync().catch(error => {
            console.error('初期同期エラー:', error);
          });
         }, 1000);
       }
       
      setShowPrivacyConsent(false);
    } else {
      alert('プライバシーポリシーに同意いただけない場合、サービスをご利用いただけません。');
    }
  };

  // デバイス認証処理
  const handleDeviceAuthLogin = (username: string) => {
    setLineUsername(username);
    setShowDeviceAuth(false);
  };

  // 管理者ログイン処理
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // メールアドレスとパスワードの組み合わせをチェック
    const counselorCredentials = [
      { email: 'jin@namisapo.com', name: '心理カウンセラー仁', password: 'counselor123' },
      { email: 'aoi@namisapo.com', name: '心理カウンセラーAOI', password: 'counselor123' },
      { email: 'asami@namisapo.com', name: '心理カウンセラーあさみ', password: 'counselor123' },
      { email: 'shu@namisapo.com', name: '心理カウンセラーSHU', password: 'counselor123' },
      { email: 'yucha@namisapo.com', name: '心理カウンセラーゆーちゃ', password: 'counselor123' },
      { email: 'sammy@namisapo.com', name: '心理カウンセラーSammy', password: 'counselor123' }
    ];
    
    const counselor = counselorCredentials.find(c => c.email === adminEmail && c.password === adminPassword);
    
    if (counselor) {
        localStorage.setItem('current_counselor', counselor.name);
        setIsAdmin(true);
        setShowAdminLogin(false);
        alert(`${counselor.name}としてログインしました。`);
    } else {
      alert('メールアドレスまたはパスワードが正しくありません。');
    }
  };

  // 管理者ログアウト処理
  const handleAdminLogout = () => {
    if (window.confirm('管理者ログアウトしますか？')) {
      localStorage.removeItem('current_counselor');
      setIsAdmin(false);
      alert('管理者ログアウトしました。');
    }
  };

  // ホームタブをクリックした時の処理
  const handleHomeClick = () => {
    setActiveTab('home');
    setShowWelcomePage(true);
  };

  // はじめるボタンをクリックした時の処理
  const handleStartClick = () => {
    setShowWelcomePage(false);
    setActiveTab('diary');
  };

  // WelcomePageからのイベントリスナー
  useEffect(() => {
    const handleStartApp = () => {
      handleStartClick();
    };
    
    window.addEventListener('startApp', handleStartApp);
    
    return () => {
      window.removeEventListener('startApp', handleStartApp);
    };
  }, []);

  // メニューの開閉
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // メンテナンスモードの場合
  if (isMaintenanceMode && !isAdminBypass) {
    return <MaintenanceMode config={config} onRetry={retryConnection} />;
  }

  // プライバシーポリシー同意画面
  if (showPrivacyConsent) {
    return <PrivacyConsent onConsent={handlePrivacyConsent} />;
  }

  // デバイス認証画面
  if (showDeviceAuth) {
    if (isDeviceRegistration) {
      return (
        <DeviceAuthRegistration
          onRegistrationComplete={handleDeviceAuthLogin}
          onBack={() => setShowDeviceAuth(false)}
        />
      );
    } else {
      return (
        <DeviceAuthLogin
          onLoginSuccess={handleDeviceAuthLogin}
          onRegister={() => setIsDeviceRegistration(true)}
          onBack={() => setShowDeviceAuth(false)}
        />
      );
    }
  }

  // 管理者ログイン画面
  if (showAdminLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-jp-bold text-gray-900 text-center">カウンセラーログイン</h1>
            <p className="text-gray-600 text-sm mt-2">専用アカウントでログインしてください</p>
          </div>
          
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                placeholder="例: jin@namisapo.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                placeholder="パスワードを入力してください"
              />
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-2">
                <div className="text-blue-600 mt-0.5">🔒</div>
                <div className="text-sm text-blue-800">
                  <p className="font-jp-medium mb-1">カウンセラー専用アカウント</p>
                  <p className="text-xs mt-1">登録されたカウンセラー用メールアドレスとパスワードを入力してください。</p>
                  <p className="text-xs mt-1">※ アカウント情報は管理者にお問い合わせください</p>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-jp-bold transition-colors shadow-md hover:shadow-lg"
            >
              ログイン
            </button>
            
            <button
              type="button"
              onClick={() => setShowAdminLogin(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-jp-medium transition-colors mt-2"
            >
              キャンセル
            </button>
          </form>
        </div>
      </div>
    );
  }

  // メインコンテンツ
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="w-6 h-6 text-orange-300" />
              <h1 className="ml-2 text-xl font-jp-bold text-gray-900">かんじょうにっき</h1>
            </div>
            
            {lineUsername && (
              <div className="flex items-center space-x-2 ml-4">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-jp-medium text-gray-700">{lineUsername}さん</span>
              </div>
            )}
            
            <div className="flex-1"></div>
            
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* サイドメニュー */}
      <div className={`fixed inset-0 z-40 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 ease-in-out`}>
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={toggleMenu}></div>
        <div className={`relative max-w-md w-full h-full bg-amber-50 shadow-xl flex flex-col transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out overflow-hidden`}>
          {/* 装飾的な円形要素 */}
          <div className="absolute top-20 left-40 w-24 h-24 bg-amber-100 rounded-full opacity-50"></div>
          <div className="absolute bottom-40 right-5 w-32 h-32 bg-amber-100 rounded-full opacity-50"></div>
          <div className="absolute top-1/3 right-20 w-16 h-16 bg-amber-100 rounded-full opacity-30"></div>
          <div className="absolute bottom-1/4 left-5 w-20 h-20 bg-amber-100 rounded-full opacity-40"></div>
          <div className="absolute top-2/3 left-3/4 transform -translate-x-1/2 w-40 h-40 bg-amber-100 rounded-full opacity-20"></div>
          
          {/* メニュー内容 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Heart className="w-6 h-6 text-orange-300" />
                <h2 className="ml-2 text-xl font-jp-bold text-gray-900">かんじょうにっき</h2>
              </div>
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {lineUsername && (
              <div className="mt-4 flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-jp-medium text-gray-700">{lineUsername}さん</span>
              </div>
            )}
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto relative z-10">
            <button 
              onClick={() => {
                setActiveTab('home');
                setShowWelcomePage(true);
                toggleMenu();
              }}
              className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                activeTab === 'home' ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">TOP</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('howto');
                setShowWelcomePage(false);
                toggleMenu();
              }}
              className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                activeTab === 'howto' ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              <HelpCircle className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">使い方</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('first');
                setShowWelcomePage(false);
                toggleMenu();
              }}
              className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                activeTab === 'first' ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              <FileText className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">最初にやること</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('next');
                setShowWelcomePage(false);
                toggleMenu();
              }}
              className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                activeTab === 'next' ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              <ArrowRight className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">次にやること</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('chart');
                setShowWelcomePage(false);
                toggleMenu();
              }}
              className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                activeTab === 'chart' ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              <BarChart2 className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">感情の種類</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('support');
                setShowWelcomePage(false);
                toggleMenu();
              }}
              className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                activeTab === 'support' ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              <Shield className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">サポートについて</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('privacy');
                setShowWelcomePage(false);
                toggleMenu();
              }}
              className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                activeTab === 'privacy' ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              <Shield className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">同意文</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('diary');
                setShowWelcomePage(false);
                toggleMenu();
              }}
              className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                activeTab === 'diary' ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              <BookOpen className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">日記</span>
            </button>
             <button
              onClick={() => {
                setActiveTab('search');
                setShowWelcomePage(false);
                toggleMenu();
              }}
              className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                activeTab === 'search' ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              <Search className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">日記検索</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('worthlessness');
                setShowWelcomePage(false);
                toggleMenu();
              }}
              className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                activeTab === 'worthlessness' ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              <BarChart className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">無価値感推移</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('data');
                setShowWelcomePage(false);
                toggleMenu();
              }}
              className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                activeTab === 'data' ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              <Database className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">{isAdmin ? 'データ管理' : '同期設定'}</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setShowWelcomePage(false);
                  toggleMenu();
                }}
                className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                  activeTab === 'admin' ? 'bg-green-100 text-green-900' : 'text-green-700 hover:bg-amber-50'
                }`}
              >
                <User className="w-5 h-5 mr-3" />
                <span className="font-jp-medium">管理画面</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('backup');
                  setShowWelcomePage(false);
                  toggleMenu();
                }}
                className={`flex items-center px-3 py-2 w-full rounded-md text-base ${
                  activeTab === 'backup' ? 'bg-green-100 text-green-900' : 'text-green-700 hover:bg-amber-50'
                }`}
              >
                <Database className="w-5 h-5 mr-3" />
                <span className="font-jp-medium">データ管理</span>
              </button>
            )}
            <a
              href="https://ryksl1di.autosns.app/line"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 w-full rounded-md text-gray-700 hover:bg-amber-50 text-base"
              onClick={toggleMenu}
            >
              <ExternalLink className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">お問い合わせ</span>
            </a>
            <button
              onClick={() => {
                if (window.confirm('ログアウトしますか？')) {
                  localStorage.removeItem('line-username');
                  localStorage.removeItem('privacyConsentGiven');
                  localStorage.removeItem('privacyConsentDate');
                  window.location.reload();
                }
                toggleMenu();
              }}
              className="flex items-center px-3 py-2 w-full rounded-md text-red-700 hover:bg-amber-50 text-base"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-jp-medium">ログアウト</span>
            </button>
          </nav>
          
          <div className="p-4 border-t border-amber-200 relative z-10">
            {isAdmin ? (
              <button
                onClick={handleAdminLogout}
                className="flex items-center px-3 py-2 w-full rounded-md text-red-700 hover:bg-amber-50 text-base"
              >
                <span className="font-jp-medium">管理者ログアウト</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center px-3 py-2 w-full rounded-md text-gray-700 hover:bg-amber-50 text-base"
              >
                <span className="font-jp-medium">カウンセラーログイン</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* メインコンテンツ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ウェルカムページ表示 */}
        {activeTab === 'home' && showWelcomePage ? (
          <WelcomePage />
        ) : (
          <div className="space-y-6">
            {/* 管理者モード表示 */}
            {isAdmin && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-800 font-jp-medium text-sm">管理者モード: {localStorage.getItem('current_counselor')}</span>
                  </div>
                  <button
                    onClick={handleAdminLogout}
                    className="text-xs text-red-600 hover:text-red-800 font-jp-medium"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            )}

            {/* メンテナンスモード表示（管理者バイパス時） */}
            {isMaintenanceMode && isAdminBypass && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-800 font-jp-medium text-sm">メンテナンスモード中（管理者アクセス）</span>
                </div>
              </div>
            )}

            {/* Supabase接続エラー表示（ローカルモードでない場合のみ） */}
            {supabaseError && !isLocalMode && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1"></div>
                  <div>
                    <h3 className="font-jp-medium text-yellow-800 text-sm">Supabase接続エラー</h3>
                    <p className="text-yellow-700 text-xs mt-1">{supabaseError}</p>
                    <button
                      onClick={retryConnection}
                      className="mt-2 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md font-jp-medium transition-colors"
                    >
                      再接続
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* ローカルモード表示 */}
            {isLocalMode && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 font-jp-medium text-sm">ローカルモードで動作中（Supabase接続なし）</span>
                </div>
              </div>
            )}

            {/* アクティブなタブに応じたコンテンツ表示 */}
            {activeTab === 'home' && !showWelcomePage && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-jp-bold text-gray-900 mb-6">ダッシュボード</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="font-jp-bold text-gray-900 mb-4">最近の日記</h3>
                    <p className="text-gray-600 font-jp-normal">
                      最近の日記を確認したり、新しい日記を書いたりできます。
                    </p>
                    <button
                      onClick={() => setActiveTab('diary')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
                    >
                      日記を書く
                    </button>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h3 className="font-jp-bold text-gray-900 mb-4">無価値感推移</h3>
                    <p className="text-gray-600 font-jp-normal">
                      あなたの無価値感の推移を確認できます。
                    </p>
                    <button
                      onClick={() => setActiveTab('chart')}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
                    >
                      グラフを見る
                    </button>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowWelcomePage(true)}
                    className="text-blue-600 hover:text-blue-800 font-jp-medium text-sm"
                  >
                    ウェルカム画面に戻る
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'diary' && <DiaryPage />}
            {activeTab === 'search' && <DiarySearchPage />}
            {activeTab === 'chart' && <EmotionTypes />}
            {activeTab === 'howto' && <HowTo />}
            {activeTab === 'first' && <FirstSteps />}
            {activeTab === 'next' && <NextSteps />}
            {activeTab === 'support' && <Support />}
            {activeTab === 'privacy' && <PrivacyPolicy />}
            {activeTab === 'worthlessness' && <WorthlessnessChart />}
            {activeTab === 'chat' && <Chat />}
            {activeTab === 'data' && <DataMigration />}
            {activeTab === 'backup' && <UserDataManagement />}
            {activeTab === 'admin' && isAdmin && <AdminPanel />}
          </div>
        )}
      </main>

    </div>
  );
}

export default App;