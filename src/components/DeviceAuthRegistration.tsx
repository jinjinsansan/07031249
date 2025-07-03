import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock, Smartphone, HelpCircle, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { 
  generateDeviceFingerprint, 
  saveDeviceFingerprint, 
  saveUserCredentials,
  saveSecurityQuestions,
  logSecurityEvent,
  SECURITY_QUESTIONS,
  type SecurityQuestion 
} from '../lib/deviceAuth';

interface DeviceAuthRegistrationProps {
  onRegistrationComplete: (lineUsername: string) => void;
  onBack: () => void;
}

const DeviceAuthRegistration: React.FC<DeviceAuthRegistrationProps> = ({
  onRegistrationComplete,
  onBack
}) => {
  const [step, setStep] = useState<'device' | 'credentials' | 'security' | 'complete'>('device');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    lineUsername: '',
    pinCode: '',
    confirmPinCode: ''
  });
  
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([
    { id: '', question: '', answer: '' },
    { id: '', question: '', answer: '' }
  ]);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // デバイス情報を生成
    const fingerprint = generateDeviceFingerprint();
    setDeviceInfo(fingerprint);
  }, []);

  const validateStep = (currentStep: string): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 'credentials') {
      if (!formData.lineUsername.trim()) {
        newErrors.lineUsername = 'LINEユーザー名を入力してください';
      } else if (formData.lineUsername.length < 2) {
        newErrors.lineUsername = 'ユーザー名は2文字以上で入力してください';
      }

      if (!formData.pinCode) {
        newErrors.pinCode = 'PIN番号を入力してください';
      } else if (formData.pinCode.length !== 6) {
        newErrors.pinCode = 'PIN番号は6桁で入力してください';
      } else if (!/^\d+$/.test(formData.pinCode)) {
        newErrors.pinCode = 'PIN番号は数字のみで入力してください';
      }

      if (formData.pinCode !== formData.confirmPinCode) {
        newErrors.confirmPinCode = 'PIN番号が一致しません';
      }
    }

    if (currentStep === 'security') {
      securityQuestions.forEach((q, index) => {
        if (!q.id) {
          newErrors[`question_${index}`] = '質問を選択してください';
        }
        if (!q.answer.trim()) {
          newErrors[`answer_${index}`] = '回答を入力してください';
        } else if (q.answer.length < 2) {
          newErrors[`answer_${index}`] = '回答は2文字以上で入力してください';
        }
      });

      // 同じ質問が選択されていないかチェック
      const questionIds = securityQuestions.map(q => q.id).filter(id => id);
      if (new Set(questionIds).size !== questionIds.length) {
        newErrors.duplicate = '同じ質問を複数選択することはできません';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;

    setLoading(true);

    try {
      if (step === 'device') {
        setStep('credentials');
      } else if (step === 'credentials') {
        setStep('security');
      } else if (step === 'security') {
        // 登録処理を実行
        await handleRegistration();
      }
    } catch (error) {
      console.error('登録エラー:', error);
      setErrors({ general: '登録中にエラーが発生しました。もう一度お試しください。' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async () => {
    try {
      // 登録処理中のフラグを設定
      setLoading(true);
      
      // 1. デバイス情報を保存
      if (!deviceInfo) {
        throw new Error('デバイス情報が生成されていません');
      }
      saveDeviceFingerprint(deviceInfo);

      // 2. ユーザー認証情報を保存
      await saveUserCredentials(
        formData.lineUsername,
        formData.pinCode,
        deviceInfo.id
      );

      // 3. 秘密の質問を保存
      saveSecurityQuestions(securityQuestions);

      // 同意履歴を更新
      const consentRecord = {
        id: Date.now().toString(),
        line_username: formData.lineUsername,
        consent_given: true,
        consent_date: new Date().toISOString(),
        ip_address: 'unknown', // 実際の実装では取得可能
        user_agent: navigator.userAgent
      };
      
      // ローカルストレージに保存
      const existingHistories = localStorage.getItem('consent_histories');
      const histories = existingHistories ? JSON.parse(existingHistories) : [];
      histories.push(consentRecord);
      localStorage.setItem('consent_histories', JSON.stringify(histories));

      // セキュリティイベントをログ
      logSecurityEvent('device_registered', formData.lineUsername, 'デバイス認証システムに新規登録');

      // 登録完了ステップに移行
      setStep('complete');
      
      // 2秒後に登録完了を通知して画面遷移
      setTimeout(() => {
        try {
          onRegistrationComplete(formData.lineUsername);
        } catch (error) {
          console.error('登録完了後の画面遷移エラー:', error);
          // エラーが発生しても、ユーザーは登録完了画面を見ているので問題ない
        }
      }, 2000);

    } catch (error) {
      console.error('登録処理エラー:', error);
      setErrors({ general: '登録処理に失敗しました。もう一度お試しください。' });
      // エラーが発生しても登録は完了している可能性があるため、
      // 登録完了ステップに移行しない
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityQuestionChange = (index: number, field: 'id' | 'answer', value: string) => {
    const updated = [...securityQuestions];
    if (field === 'id') {
      const selectedQuestion = SECURITY_QUESTIONS.find(q => q.id === value);
      updated[index] = {
        ...updated[index],
        id: value,
        question: selectedQuestion?.question || ''
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSecurityQuestions(updated);
  };

  const renderDeviceStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-jp-bold text-gray-900 mb-2">
          デバイス認証の設定
        </h2>
        <p className="text-gray-600 font-jp-normal text-sm">
          このデバイスを安全に識別するための情報を確認します
        </p>
      </div>

      {deviceInfo && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-jp-semibold text-gray-900 text-sm">デバイス情報</h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">デバイスID:</span>
              <span className="font-mono text-gray-900">{deviceInfo.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">画面解像度:</span>
              <span className="text-gray-900">{deviceInfo.screen}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">言語設定:</span>
              <span className="text-gray-900">{deviceInfo.language}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 font-jp-normal">
            <p className="font-jp-medium mb-1">セキュリティについて</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>デバイス情報は暗号化して安全に保存されます</li>
              <li>他のデバイスからのアクセスを防止します</li>
              <li>個人を特定できる情報は含まれません</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCredentialsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Lock className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-jp-bold text-gray-900 mb-2">
          認証情報の設定
        </h2>
        <p className="text-gray-600 font-jp-normal text-sm">
          ユーザー名とPIN番号を設定してください
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-jp-medium text-gray-700 mb-2">
            LINEユーザー名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.lineUsername}
            onChange={(e) => setFormData({...formData, lineUsername: e.target.value})}
            className={`w-full px-3 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-jp-normal transition-all duration-200 ${
              errors.lineUsername ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
            }`}
            placeholder="LINEで使用しているユーザー名"
            maxLength={50}
          />
          {errors.lineUsername && (
            <p className="mt-1 text-sm text-red-600 font-jp-normal">{errors.lineUsername}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-jp-medium text-gray-700 mb-2">
            PIN番号（6桁） <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              value={formData.pinCode}
              onChange={(e) => setFormData({...formData, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
              className={`w-full px-3 py-3 pr-10 border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-mono text-center text-lg tracking-widest transition-all duration-200 ${
                errors.pinCode ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="123456"
              maxLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.pinCode && (
            <p className="mt-1 text-sm text-red-600 font-jp-normal">{errors.pinCode}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-jp-medium text-gray-700 mb-2">
            PIN番号（確認） <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPin ? 'text' : 'password'}
              value={formData.confirmPinCode}
              onChange={(e) => setFormData({...formData, confirmPinCode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
              className={`w-full px-3 py-3 pr-10 border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-mono text-center text-lg tracking-widest transition-all duration-200 ${
                errors.confirmPinCode ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="123456"
              maxLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPin(!showConfirmPin)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPinCode && (
            <p className="mt-1 text-sm text-red-600 font-jp-normal">{errors.confirmPinCode}</p>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800 font-jp-normal">
            <p className="font-jp-medium mb-1">PIN番号について</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>6桁の数字で設定してください</li>
              <li>生年月日や電話番号など推測しやすい番号は避けてください</li>
              <li>PIN番号は暗号化して安全に保存されます</li>
            </ul>
          </div>
        </div>
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
          秘密の質問の設定
        </h2>
        <p className="text-gray-600 font-jp-normal text-sm">
          PIN番号を忘れた場合の復旧用に2つの質問を設定してください
        </p>
      </div>

      <div className="space-y-6">
        {securityQuestions.map((question, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-jp-semibold text-gray-900 mb-4">質問 {index + 1}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                  質問を選択 <span className="text-red-500">*</span>
                </label>
                <select
                  value={question.id}
                  onChange={(e) => handleSecurityQuestionChange(index, 'id', e.target.value)}
                  className={`w-full px-3 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-jp-normal transition-all duration-200 ${
                    errors[`question_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                  }`}
                >
                  <option value="">質問を選択してください</option>
                  {SECURITY_QUESTIONS.map((q) => (
                    <option 
                      key={q.id} 
                      value={q.id}
                      disabled={securityQuestions.some((sq, i) => i !== index && sq.id === q.id)}
                    >
                      {q.question}
                    </option>
                  ))}
                </select>
                {errors[`question_${index}`] && (
                  <p className="mt-1 text-sm text-red-600 font-jp-normal">{errors[`question_${index}`]}</p>
                )}
              </div>

              {question.id && (
                <div>
                  <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                    回答 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={question.answer}
                    onChange={(e) => handleSecurityQuestionChange(index, 'answer', e.target.value)}
                    className={`w-full px-3 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-jp-normal transition-all duration-200 ${
                      errors[`answer_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder={SECURITY_QUESTIONS.find(q => q.id === question.id)?.placeholder || '回答を入力'}
                    maxLength={100}
                  />
                  {errors[`answer_${index}`] && (
                    <p className="mt-1 text-sm text-red-600 font-jp-normal">{errors[`answer_${index}`]}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {errors.duplicate && (
          <p className="text-sm text-red-600 font-jp-normal text-center">{errors.duplicate}</p>
        )}
      </div>

      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-start space-x-3">
          <HelpCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-purple-800 font-jp-normal">
            <p className="font-jp-medium mb-1">回答のコツ</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>正確に覚えている情報を使用してください</li>
              <li>ひらがな・カタカナ・漢字の表記に注意してください</li>
              <li>回答は暗号化して安全に保存されます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-jp-bold text-gray-900 mb-2">
          登録完了！
        </h2>
        <p className="text-gray-600 font-jp-normal">
          デバイス認証の設定が完了しました。<br />
          安全にアプリをご利用いただけます。
        </p>
      </div>

      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h3 className="font-jp-bold text-green-900 mb-3">設定完了項目</h3>
        <div className="space-y-2 text-sm text-green-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>デバイス認証</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>PIN番号設定</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>秘密の質問設定</span>
          </div>
        </div>
      </div>

      <div className="animate-pulse">
        <p className="text-sm text-gray-500 font-jp-normal">
          まもなくアプリに移動します...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-jp-bold text-gray-900">デバイス認証設定</h1>
            </div>
            {step !== 'complete' && (
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>

          {/* プログレスバー */}
          {step !== 'complete' && (
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${step === 'device' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step === 'credentials' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step === 'security' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              </div>
              <div className="text-xs text-gray-500 font-jp-normal">
                ステップ {step === 'device' ? '1' : step === 'credentials' ? '2' : '3'} / 3
              </div>
            </div>
          )}

          {/* エラー表示 */}
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800 font-jp-normal">{errors.general}</p>
              </div>
            </div>
          )}

          {/* ステップコンテンツ */}
          {step === 'device' && renderDeviceStep()}
          {step === 'credentials' && renderCredentialsStep()}
          {step === 'security' && renderSecurityStep()}
          {step === 'complete' && renderCompleteStep()}

          {/* ボタン */}
          {step !== 'complete' && (
            <div className="flex space-x-4 mt-8">
              {step !== 'device' && (
                <button
                  onClick={() => {
                    if (step === 'credentials') setStep('device');
                    else if (step === 'security') setStep('credentials');
                  }}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-jp-medium transition-colors disabled:opacity-50"
                >
                  戻る
                </button>
              )}
              
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-jp-bold transition-colors shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>{step === 'security' ? '登録完了' : '次へ'}</span>
                    {step !== 'security' && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceAuthRegistration;