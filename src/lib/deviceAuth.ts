// デバイス認証システム

// ストレージキー
export const STORAGE_KEYS = {
  DEVICE_FINGERPRINT: 'device_fingerprint',
  USER_CREDENTIALS: 'user_credentials',
  AUTH_SESSION: 'auth_session',
  SECURITY_QUESTIONS: 'security_questions',
  LOGIN_ATTEMPTS: 'login_attempts_',
  ACCOUNT_LOCKED: 'account_locked_',
  SECURITY_EVENTS: 'security_events'
};

// 秘密の質問リスト
export const SECURITY_QUESTIONS = [
  {
    id: 'first-pet',
    question: '最初に飼ったペットの名前は？',
    placeholder: '例: ポチ'
  },
  {
    id: 'elementary-school',
    question: '通っていた小学校の名前は？',
    placeholder: '例: 〇〇小学校'
  },
  {
    id: 'birth-city',
    question: '生まれた市区町村は？',
    placeholder: '例: 〇〇市'
  },
  {
    id: 'favorite-food',
    question: '子供の頃の好きな食べ物は？',
    placeholder: '例: カレーライス'
  },
  {
    id: 'first-teacher',
    question: '小学校の担任の先生の名字は？',
    placeholder: '例: 田中先生'
  }
];

// 型定義
export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screen: string;
  language: string;
  timezone: string;
  createdAt: string;
}

export interface UserCredentials {
  lineUsername: string;
  pinCodeHash: string;
  salt: string;
  deviceId: string;
  createdAt: string;
}

export interface AuthSession {
  lineUsername: string;
  deviceId: string;
  lastActivity: string;
  expiresAt: string;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
}

// エラー型
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  DEVICE_MISMATCH = 'device_mismatch',
  ACCOUNT_LOCKED = 'account_locked',
  INVALID_PIN = 'invalid_pin',
  UNKNOWN = 'unknown'
}

export class AuthError extends Error {
  type: AuthErrorType;
  
  constructor(type: AuthErrorType, message: string) {
    super(message);
    this.type = type;
    this.name = 'AuthError';
  }
}

// デバイスフィンガープリントの生成
export const generateDeviceFingerprint = (): DeviceFingerprint => {
  const userAgent = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // 一意のIDを生成
  const components = [userAgent, screen, language, timezone, Date.now().toString()];
  const idString = components.join('|');
  const id = btoa(idString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  
  return {
    id,
    userAgent,
    screen,
    language,
    timezone,
    createdAt: new Date().toISOString()
  };
};

// デバイスフィンガープリントの保存
export const saveDeviceFingerprint = (fingerprint: DeviceFingerprint): void => {
  localStorage.setItem(STORAGE_KEYS.DEVICE_FINGERPRINT, JSON.stringify(fingerprint));
};

// デバイスフィンガープリントの取得
export const getDeviceFingerprint = (): DeviceFingerprint | null => {
  const savedFingerprint = localStorage.getItem(STORAGE_KEYS.DEVICE_FINGERPRINT);
  if (!savedFingerprint) return null;
  
  try {
    return JSON.parse(savedFingerprint);
  } catch (error) {
    console.error('デバイスフィンガープリント解析エラー:', error);
    return null;
  }
};

// デバイスフィンガープリントの比較
export const compareDeviceFingerprints = (current: DeviceFingerprint, saved: DeviceFingerprint): boolean => {
  // 基本的な比較（IDが一致するか）
  if (current.id === saved.id) return true;
  
  // 詳細な比較（画面サイズと言語が一致するか）
  if (current.screen === saved.screen && current.language === saved.language) return true;
  
  return false;
};

// PIN番号のハッシュ化
export const hashPinCode = async (pinCode: string, salt?: string): Promise<any> => {
  // ソルトの生成または使用
  const useSalt = salt || Math.random().toString(36).substring(2, 15);
  
  // PIN番号とソルトを結合
  const pinWithSalt = pinCode + useSalt;
  
  // SHA-256ハッシュの生成
  const encoder = new TextEncoder();
  const data = encoder.encode(pinWithSalt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // ハッシュをBase64に変換
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return { hash: hashHex, salt: useSalt };
};

// ユーザー認証情報の保存
export const saveUserCredentials = async (
  lineUsername: string,
  pinCode: string,
  deviceId: string
): Promise<void> => {
  // PIN番号のハッシュ化
  const { hash: pinCodeHash, salt } = await hashPinCode(pinCode);
  
  // 認証情報の作成
  const credentials: UserCredentials = {
    lineUsername,
    pinCodeHash,
    salt,
    deviceId,
    createdAt: new Date().toISOString()
  };
  
  // ローカルストレージに保存
  localStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, JSON.stringify(credentials));
};

// ユーザー認証情報の取得
export const getUserCredentials = (): UserCredentials | null => {
  const savedCredentials = localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
  if (!savedCredentials) return null;
  
  try {
    return JSON.parse(savedCredentials);
  } catch (error) {
    console.error('ユーザー認証情報解析エラー:', error);
    return null;
  }
};

// 認証セッションの作成
export const createAuthSession = (params: {
  lineUsername: string;
  pinCode: string;
  deviceId: string;
}): void => {
  // セッションの有効期限（7日間）
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // セッションの作成
  const session: AuthSession = {
    lineUsername: params.lineUsername,
    deviceId: params.deviceId,
    lastActivity: new Date().toISOString(),
    expiresAt: expiresAt.toISOString()
  };
  
  // ローカルストレージに保存
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
};

// 認証セッションの取得
export const getAuthSession = (): AuthSession | null => {
  const savedSession = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  if (!savedSession) return null;
  
  try {
    const session = JSON.parse(savedSession);
    
    // セッションの有効期限をチェック
    if (new Date(session.expiresAt) < new Date()) {
      // 期限切れの場合はセッションを削除
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      return null;
    }
    
    // 最終アクティビティを更新
    session.lastActivity = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    
    return session;
  } catch (error) {
    console.error('認証セッション解析エラー:', error);
    return null;
  }
};

// 認証セッションのクリア
export const clearAuthSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
};

// ユーザーのログアウト
export const logoutUser = (): void => {
  clearAuthSession();
};

// 認証状態のチェック
export const isAuthenticated = (): boolean => {
  return getAuthSession() !== null;
};

// 現在のユーザーの取得
export const getCurrentUser = (): { lineUsername: string } | null => {
  const session = getAuthSession();
  if (!session) {
    // セッションがない場合はローカルストレージから取得
    const lineUsername = localStorage.getItem('line-username');
    if (lineUsername) {
      return { lineUsername };
    }
    return null;
  }
  
  return { lineUsername: session.lineUsername };
};

// 秘密の質問の保存
export const saveSecurityQuestions = (questions: SecurityQuestion[]): void => {
  // 回答を暗号化（簡易的な実装としてBase64エンコード）
  const encodedQuestions = questions.map(q => ({
    ...q,
    answer: btoa(q.answer.toLowerCase().trim())
  }));
  
  localStorage.setItem(STORAGE_KEYS.SECURITY_QUESTIONS, JSON.stringify(encodedQuestions));
};

// 秘密の質問の取得
export const getSecurityQuestions = (): SecurityQuestion[] => {
  const savedQuestions = localStorage.getItem(STORAGE_KEYS.SECURITY_QUESTIONS);
  if (!savedQuestions) return [];
  
  try {
    return JSON.parse(savedQuestions);
  } catch (error) {
    console.error('秘密の質問解析エラー:', error);
    return [];
  }
};

// ログイン試行回数の取得
export const getLoginAttempts = (username: string): number => {
  const attempts = localStorage.getItem(`${STORAGE_KEYS.LOGIN_ATTEMPTS}${username}`);
  return attempts ? parseInt(attempts) : 0;
};

// ログイン試行回数の増加
export const incrementLoginAttempts = (username: string): number => {
  const attempts = getLoginAttempts(username) + 1;
  localStorage.setItem(`${STORAGE_KEYS.LOGIN_ATTEMPTS}${username}`, attempts.toString());
  return attempts;
};

// ログイン試行回数のリセット
export const resetLoginAttempts = (username: string): void => {
  localStorage.removeItem(`${STORAGE_KEYS.LOGIN_ATTEMPTS}${username}`);
};

// アカウントのロック状態のチェック
export const isAccountLocked = (username: string): boolean => {
  const lockedUntil = localStorage.getItem(`${STORAGE_KEYS.ACCOUNT_LOCKED}${username}`);
  if (!lockedUntil) return false;
  
  // ロック期限をチェック
  const lockExpiry = new Date(lockedUntil);
  return lockExpiry > new Date();
};

// アカウントのロック
export const lockAccount = (username: string): void => {
  // 24時間のロック
  const lockExpiry = new Date();
  lockExpiry.setHours(lockExpiry.getHours() + 24);
  
  localStorage.setItem(`${STORAGE_KEYS.ACCOUNT_LOCKED}${username}`, lockExpiry.toISOString());
};

// セキュリティイベントのログ
export const logSecurityEvent = (
  type: string,
  username: string,
  details: string
): void => {
  const event = {
    id: Date.now().toString(),
    type,
    username,
    timestamp: new Date().toISOString(),
    details
  };
  
  // 既存のイベントを取得
  const savedEvents = localStorage.getItem(STORAGE_KEYS.SECURITY_EVENTS);
  const events = savedEvents ? JSON.parse(savedEvents) : [];
  
  // 新しいイベントを追加
  events.push(event);
  
  // 最大100件まで保存
  if (events.length > 100) {
    events.shift();
  }
  
  localStorage.setItem(STORAGE_KEYS.SECURITY_EVENTS, JSON.stringify(events));
};