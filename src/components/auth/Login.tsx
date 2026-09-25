import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from './components/AuthLayout';
import AuthAlert from './components/AuthAlert';
import EmailInput from './components/EmailInput';
import PasswordInput from './components/PasswordInput';
import SubmitButton from './components/SubmitButton';
import SupernovaTransition from './components/SupernovaTransition';

type LoginMethod = 'password' | 'microsoft' | 'google' | 'google-link' | 'microsoft-link';

function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : '';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in window. Allow popups and try again.';
    case 'auth/unauthorized-domain':
    case 'auth/missing-email':
    case 'auth/sso-not-configured':
    case 'auth/expired-google-credential':
    case 'auth/expired-microsoft-credential':
    case 'auth/account-mismatch':
    case 'auth/wrong-password':
      return error instanceof Error ? error.message : 'Sign-in failed.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled in Firebase Authentication.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact your administrator.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    default:
      return error instanceof Error && error.message
        ? error.message
        : 'Sign-in failed. Please try again.';
  }
}

function MicrosoftIcon() {
  return (
    <span className="grid h-5 w-5 grid-cols-2 gap-0.5" aria-hidden="true">
      <span className="bg-[#f25022]" />
      <span className="bg-[#7fba00]" />
      <span className="bg-[#00a4ef]" />
      <span className="bg-[#ffb900]" />
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.7A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.3H3a10 10 0 0 0 0 9.4L6.4 14Z" />
      <path fill="#EA4335" d="M12 6c1.5 0 2.9.5 3.9 1.5l2.9-2.8A9.7 9.7 0 0 0 12 2a10 10 0 0 0-9 5.3l3.4 2.8A6 6 0 0 1 12 6Z" />
    </svg>
  );
}

export default function Login() {
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLinkPassword, setShowLinkPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingMethod, setLoadingMethod] = useState<LoginMethod | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const {
    login,
    loginWithMicrosoft,
    loginWithGoogle,
    linkGoogleWithPassword,
    cancelGoogleLink,
    pendingGoogleLinkEmail,
    pendingMicrosoftLinkEmail,
    linkMicrosoftWithPassword,
    linkMicrosoftWithGoogle,
    cancelMicrosoftLink
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const emailSuffix = '@ignite.solar';
  const email = emailPrefix + emailSuffix;
  const isLoading = loadingMethod !== null;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') {
      setSuccess('Account created successfully! Please log in.');
    }
  }, [location]);

  const completeLogin = () => {
    setSuccess('Login successful!');
    setShowTransition(true);
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!emailPrefix.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoadingMethod('password');
      await login(email, password);
      completeLogin();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setLoadingMethod(null);
    }
  }

  async function handleSSOLogin(method: 'microsoft' | 'google') {
    try {
      setError('');
      setSuccess('');
      setLoadingMethod(method);
      if (method === 'microsoft') {
        await loginWithMicrosoft();
      } else {
        await loginWithGoogle();
      }
      completeLogin();
    } catch (authError) {
      const code = typeof authError === 'object' && authError !== null && 'code' in authError
        ? String(authError.code)
        : '';
      if (code !== 'auth/google-link-required' && code !== 'auth/microsoft-link-required') {
        setError(getAuthErrorMessage(authError));
      }
    } finally {
      setLoadingMethod(null);
    }
  }

  async function handleGoogleLink(event: React.FormEvent) {
    event.preventDefault();
    if (!linkPassword) {
      setError('Enter your existing Ignite Solar password.');
      return;
    }

    try {
      setError('');
      setLoadingMethod('google-link');
      await linkGoogleWithPassword(linkPassword);
      setLinkPassword('');
      completeLogin();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setLoadingMethod(null);
    }
  }

  const closeGoogleLink = () => {
    cancelGoogleLink();
    setLinkPassword('');
    setError('');
  };

  async function handleMicrosoftPasswordLink(event: React.FormEvent) {
    event.preventDefault();
    if (!linkPassword) {
      setError('Enter your existing Ignite Solar password.');
      return;
    }

    try {
      setError('');
      setLoadingMethod('microsoft-link');
      await linkMicrosoftWithPassword(linkPassword);
      setLinkPassword('');
      completeLogin();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setLoadingMethod(null);
    }
  }

  async function handleMicrosoftGoogleLink() {
    try {
      setError('');
      setLoadingMethod('microsoft-link');
      await linkMicrosoftWithGoogle();
      completeLogin();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setLoadingMethod(null);
    }
  }

  const closeMicrosoftLink = async () => {
    await cancelMicrosoftLink();
    setLinkPassword('');
    setError('');
  };

  return (
    <>
      <AuthLayout
        title="Sign in to OKRFlow"
        subtitle="Or"
        linkText="create a new account"
        linkTo="/register"
      >
        <AuthAlert type="error" message={error} />
        <AuthAlert type="success" message={success} />

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSSOLogin('microsoft')}
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MicrosoftIcon />
            {loadingMethod === 'microsoft' ? 'Connecting to Microsoft...' : 'Continue with Microsoft'}
          </button>

          <button
            type="button"
            onClick={() => handleSSOLogin('google')}
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon />
            {loadingMethod === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
          </button>
        </div>

        <div className="my-6 flex items-center" aria-hidden="true">
          <div className="h-px flex-1 bg-white/20" />
          <span className="px-3 text-xs font-medium uppercase text-gray-300">Email and password</span>
          <div className="h-px flex-1 bg-white/20" />
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <EmailInput value={emailPrefix} onChange={(event) => setEmailPrefix(event.target.value)} suffix={emailSuffix} />
          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
          <SubmitButton type="login" loading={loadingMethod === 'password'} />
        </form>
      </AuthLayout>

      {pendingGoogleLinkEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Link your Google account</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Enter the current OKRFlow password for <strong>{pendingGoogleLinkEmail}</strong>. This is required once to preserve your existing data.
                </p>
              </div>
              <button type="button" onClick={closeGoogleLink} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGoogleLink} className="mt-6 space-y-4">
              {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <div className="[&_label]:!text-gray-700 [&_input]:!border-gray-300 [&_input]:!bg-white [&_input]:!text-gray-900">
                <PasswordInput
                  id="google-link-password"
                  label="Existing password"
                  value={linkPassword}
                  onChange={(event) => setLinkPassword(event.target.value)}
                  showPassword={showLinkPassword}
                  onTogglePassword={() => setShowLinkPassword(!showLinkPassword)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeGoogleLink} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingMethod === 'google-link'}
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMethod === 'google-link' ? 'Linking...' : 'Link account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingMicrosoftLinkEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Keep your existing OKRFlow account</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Your Microsoft identity matches <strong>{pendingMicrosoftLinkEmail}</strong>. Confirm that existing account once to keep its roles, objectives, and tasks.
                </p>
              </div>
              <button type="button" onClick={closeMicrosoftLink} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleMicrosoftGoogleLink}
              disabled={loadingMethod === 'microsoft-link'}
              className="mt-6 flex h-11 w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
            >
              <GoogleIcon />
              Confirm with Google
            </button>

            <div className="my-4 flex items-center" aria-hidden="true">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="px-3 text-xs font-medium uppercase text-gray-500">or use your password</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={handleMicrosoftPasswordLink} className="space-y-4">
              {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <div className="[&_label]:!text-gray-700 [&_input]:!border-gray-300 [&_input]:!bg-white [&_input]:!text-gray-900">
                <PasswordInput
                  id="microsoft-link-password"
                  label="Existing password"
                  value={linkPassword}
                  onChange={(event) => setLinkPassword(event.target.value)}
                  showPassword={showLinkPassword}
                  onTogglePassword={() => setShowLinkPassword(!showLinkPassword)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeMicrosoftLink} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingMethod === 'microsoft-link'}
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {loadingMethod === 'microsoft-link' ? 'Linking...' : 'Confirm and link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransition && <SupernovaTransition onComplete={() => navigate('/')} />}
    </>
  );
}
