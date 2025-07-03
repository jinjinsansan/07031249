import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock, Smartphone, AlertTriangle, CheckCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { 
  generateDeviceFingerprint,
  compareDeviceFingerprints,
  getDeviceFingerprint,
  getUserCredentials,
  getSecurityQuestions,
  hashPinCode,
  createAuthSession,
  getLoginAttempts,
  incrementLoginAttempts,
  resetLoginAttempts,
  isAccountLocked,
  lockAccount,
  logSecurityEvent,
  AuthError,
  AuthErrorType,
  SECURITY_QUESTIONS,
  type SecurityQuestion
} from '../lib/deviceAuth';

interface DeviceAuthLoginProps {
  onLoginSuccess: (lineUsername: string) => void;
  onRegister: () => void;
  onBack: () => void;
}

const DeviceAuthLogin: React.FC<DeviceAuthLoginProps> = ({
  onLoginSuccess,
  onRegister,
  onBack
}) => {
  const [step, setStep] = useState<'device' | 'pin' | 'security' | 'locked'>('device');
  const [deviceMatched, setDeviceMatched] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [maxAttempts] = useState(5);
  
  const [formData, setFormData] = useState({
    lineUsername: '',
    pinCode: ''
  });
  
  const [securityAnswers, setSecurityAnswers] = useState<string[]>(['', '']);
  const [userSecurityQuestions, setUserSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    checkDeviceCompatibility();
  }, []);

  const checkDeviceCompatibility = () => {
    setLoading(true);
    
    try {
      // 現在のデバイス情報を生成
      const currentDevice = generateDeviceFingerprint();
      
      // 保存されたデバイス情報を取得
      const savedDevice = getDeviceFingerprint();
      
      if (!savedDevice) {
        // デバイス情報が保存されていない場合は新規登録が必要
        setErrors({ device: 'このデバイスは登録されていません。新規登録を行ってください。' });
        setDeviceMatched(false);
      } else {
        // デバイス情報を比較
        const isMatched = compareDeviceFingerprints(currentDevice, savedDevice);
        setDeviceMatched(isMatched);
        
        if (isMatched) {
          // デバイスが一致した場合、ユーザー情報を取得
          const credentials = getUserCredentials();
          if (credentials) {
            setFormData({ ...formData, lineUsername: credentials.lineUsername });
            
            // アカウントロック状態をチェック
            if (isAccountLocked(credentials.lineUsername)) {
              setStep('locked');
            } else {
              setStep('pin');
              setLoginAttempts(getLoginAttempts(credentials.lineUsername));
            }
          } else {
            setErrors({ device: 'ユーザー情報が見つかりません。新規登録を行ってください。' });
          }
        } else {
          setErrors({ device: 'このデバイスは認識されません。登録されたデバイスからアクセスしてください。' });
        }
      }
    } catch (error) {
      console.error('デバイス確認エラー:', error);
      setErrors({ device: 'デバイス確認中にエラーが発生しました。' });
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async () => {
    if (!formData.pinCode || formData.pinCode.length !== 6) {
      setErrors({ pin: 'PIN番号を正しく入力してください' });
      logSecurityEvent('login_validation_failed', formData.lineUsername || 'unknown', 'PIN番号の形式が不正です');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const credentials = getUserCredentials();
      if (!credentials) {
        throw new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'ユーザー情報が見つかりません');
      }
      
      // ロック状態を再確認
      if (isAccountLocked(credentials.lineUsername)) {
        logSecurityEvent('login_attempt_locked', credentials.lineUsername, 'ロック中のアカウントへのログイン試行');
        setStep('locked');
        return;
      }

      // PIN番号をハッシュ化して比較
      const hashedPin = await hashPinCode(formData.pinCode, credentials.salt);
      
      // ロック状態を再確認
      if (isAccountLocked(credentials.lineUsername)) {
        logSecurityEvent('login_attempt_locked', credentials.lineUsername, 'ロック中のアカウントへのログイン試行');
        setStep('locked');
        return;
      }
      
      if (hashedPin.hash === credentials.pinCodeHash) {
        // ログイン成功
        resetLoginAttempts(credentials.lineUsername);
        logSecurityEvent('login_success', credentials.lineUsername, 'デバイス認証によるログイン成功');
        createAuthSession({
          lineUsername: credentials.lineUsername,
          pinCode: formData.pinCode,
          deviceId: credentials.deviceId
        });
        
        onLoginSuccess(credentials.lineUsername);
      } else {
        // ログイン失敗
        const attempts = incrementLoginAttempts(credentials.lineUsername);
        logSecurityEvent('login_failed', credentials.lineUsername, `PIN認証に失敗しました (試行回数: ${attempts})`);
        setLoginAttempts(attempts);
        
        if (attempts >= maxAttempts) {
          lockAccount(credentials.lineUsername);
          logSecurityEvent('account_locked', credentials.lineUsername, 'ログイン試行回数上限によりアカウントロック');
          setStep('locked');
        } else {
          const remainingAttempts = maxAttempts - attempts;
          setErrors({ 
            pin: `PIN番号が正しくありません。残り${remainingAttempts}回の試行が可能です。` 
          });
          
          if (remainingAttempts <= 2) {
            // 残り試行回数が少ない場合は秘密の質問での復旧を提案
            setErrors({ 
              pin: `PIN番号が正しくありません。残り${remainingAttempts}回の試行が可能です。PIN番号を忘れた場合は「秘密の質問で復旧」をお試しください。` 
            });
          }
        }
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      if (error instanceof AuthError) {
        setErrors({ pin: error.message });
      } else {
        setErrors({ pin: 'ログイン中にエラーが発生しました' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityQuestionRecovery = () => {
    const credentials = getUserCredentials();
    if (!credentials) {
      setErrors({ security: 'ユーザー情報が見つかりません' });
      return;
    }

    const questions = getSecurityQuestions();
    if (questions.length < 2) {
      setErrors({ security: '秘密の質問が設定されていません' });
      return;
    }

    setUserSecurityQuestions(questions);
    setStep('security');
  };

  const handleSecurityAnswerSubmit = async () => {
    if (securityAnswers.some(answer => !answer.trim())) {
      setErrors({ security: 'すべての質問に回答してください' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const questions = getSecurityQuestions();
      let correctAnswers = 0;

      for (let i = 0; i < questions.length; i++) {
        const userAnswer = securityAnswers[i].toLowerCase().trim();
        const correctAnswer = atob(questions[i].answer);
        
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      }

      if (correctAnswers === questions.length) {
        // 秘密の質問に正解した場合、ログイン試行回数をリセット
        const credentials = getUserCredentials();
        if (credentials) { 
          resetLoginAttempts(credentials.lineUsername);
          logSecurityEvent('security_question_success', credentials.lineUsername, '秘密の質問による復旧に成功しました');
          setLoginAttempts(0);
          setStep('pin');
          setErrors({});
          setFormData({ ...formData, pinCode: '' });
          
          // 成功メッセージを表示
          setErrors({ success: 'PIN番号の入力画面に戻りました。新しいPIN番号を入力してください。' });
        }
      } else {
        setErrors({ security: '回答が正しくありません。正確に入力してください。' });
      }
    } catch (error) {
      console.error('秘密の質問確認エラー:', error);
      setErrors({ security: '確認中にエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  const renderDeviceStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-jp-bold text-gray-900 mb-2">
          デバイス認証
        </h2>
        <p className="text-gray-600 font-jp-normal text-sm">
          このデバイスの認証を確認しています
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-jp-normal">デバイス情報を確認中...</p>
        </div>
      ) : deviceMatched ? (
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="font-jp-bold text-green-900">デバイス認証成功</h3>
          </div>
          <p className="text-green-800 font-jp-normal text-sm">
            このデバイスは登録済みです。PIN番号を入力してログインしてください。
          </p>
        </div>
      ) : (
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="font-jp-bold text-red-900">デバイス認証失敗</h3>
          </div>
          <p className="text-red-800 font-jp-normal text-sm mb-4">
            {errors.device}
          </p>
          <div className="space-y-3">
            <button
              onClick={onRegister}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-jp-medium transition-colors"
            >
              新規登録
            </button>
            <button
              onClick={checkDeviceCompatibility}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-jp-medium transition-colors"
            >
              再確認
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderPinStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Lock className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-jp-bold text-gray-900 mb-2">
          PIN番号入力
        </h2>
        <p className="text-gray-600 font-jp-normal text-sm">
          {formData.lineUsername}さん、PIN番号を入力してください
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-jp-medium text-gray-700 mb-2">
            PIN番号（6桁）
          </label>
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              value={formData.pinCode}
              onChange={(e) => setFormData({...formData, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
              className={`w-full px-3 py-3 pr-10 border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-mono text-center text-lg tracking-widest transition-all duration-200 ${
                errors.pin ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="123456"
              maxLength={6}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.pin && (
            <p className="mt-1 text-sm text-red-600 font-jp-normal">{errors.pin}</p>
          )}
          {errors.success && (
            <p className="mt-1 text-sm text-green-600 font-jp-normal">{errors.success}</p>
          )}
        </div>

        {loginAttempts > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800 font-jp-normal">
                ログイン試行回数: {loginAttempts}/{maxAttempts}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handlePinLogin}
          disabled={loading || formData.pinCode.length !== 6}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-jp-bold transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <span>ログイン</span>
          )}
        </button>

        {loginAttempts >= 2 && (
          <button
            onClick={handleSecurityQuestionRecovery}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-jp-medium transition-colors flex items-center justify-center space-x-2"
          >
            <HelpCircle className="w-5 h-5" />
            <span>秘密の質問で復旧</span>
          </button>
        )}
      </div>
    </div>
  );

  const renderSecurityStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <HelpCircle className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-xl font-jp-bold text-gray-900 mb-2">
          秘密の質問
        </h2>
        <p className="text-gray-600 font-jp-normal text-sm">
          PIN番号復旧のため、秘密の質問に回答してください
        </p>
      </div>

      <div className="space-y-4">
        {userSecurityQuestions.map((question, index) => {
          const questionData = SECURITY_QUESTIONS.find(q => q.id === question.id);
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                質問 {index + 1}: {question.question}
              </label>
              <input
                type="text"
                value={securityAnswers[index]}
                onChange={(e) => {
                  const updated = [...securityAnswers];
                  updated[index] = e.target.value;
                  setSecurityAnswers(updated);
                }}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-jp-normal transition-all duration-200"
                placeholder={questionData?.placeholder || '回答を入力'}
                maxLength={100}
              />
            </div>
          );
        })}

        {errors.security && (
          <p className="text-sm text-red-600 font-jp-normal text-center">{errors.security}</p>
        )}

        <div className="space-y-3">
          <button
            onClick={handleSecurityAnswerSubmit}
            disabled={loading || securityAnswers.some(answer => !answer.trim())}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-jp-bold transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <span>回答を確認</span>
            )}
          </button>

          <button
            onClick={() => setStep('pin')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-jp-medium transition-colors"
          >
            PIN番号入力に戻る
          </button>
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-start space-x-3">
          <HelpCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-purple-800 font-jp-normal">
            <p className="font-jp-medium mb-1">回答のヒント</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>登録時と同じ表記で入力してください</li>
              <li>ひらがな・カタカナ・漢字の違いに注意してください</li>
              <li>すべての質問に正しく回答する必要があります</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLockedStep = () => (
    <div className="space-y-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      
      <div>
        <h2 className="text-xl font-jp-bold text-gray-900 mb-2">
          アカウントがロックされました
        </h2>
        <p className="text-gray-600 font-jp-normal text-sm">
          ログイン試行回数が上限に達したため、<br />
          24時間アカウントがロックされています。
        </p>
      </div>

      <div className="bg-red-50 rounded-lg p-6 border border-red-200">
        <h3 className="font-jp-bold text-red-900 mb-3">セキュリティ保護</h3>
        <div className="space-y-2 text-sm text-red-800">
          <p>• 不正アクセスを防ぐため、アカウントを一時的にロックしました</p>
          <p>• 24時間後に自動的にロックが解除されます</p>
          <p>• 緊急の場合はサポートにお問い合わせください</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onBack}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-jp-medium transition-colors"
        >
          戻る
        </button>
        
        <p className="text-xs text-gray-500 font-jp-normal">
          サポート: info@namisapo.com
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-green-600" />
              <h1 className="text-lg font-jp-bold text-gray-900">デバイス認証ログイン</h1>
            </div>
            {step !== 'locked' && (
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>

          {/* ステップインジケーター */}
          {step !== 'locked' && (
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${step === 'device' ? 'bg-green-600' : deviceMatched ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step === 'pin' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step === 'security' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              </div>
              <div className="text-xs text-gray-500 font-jp-normal">
                {step === 'device' ? 'デバイス確認' : 
                 step === 'pin' ? 'PIN番号入力' : 
                 '秘密の質問'}
              </div>
            </div>
          )}

          {/* ステップコンテンツ */}
          {step === 'device' && renderDeviceStep()}
          {step === 'pin' && renderPinStep()}
          {step === 'security' && renderSecurityStep()}
          {step === 'locked' && renderLockedStep()}
        </div>
      </div>
    </div>
  );
};

export default DeviceAuthLogin;