import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  AuthCredential,
  AuthError,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  linkWithCredential,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile
} from 'firebase/auth';
import { app } from '../config/firebase';
import { userService } from '../services/userService';
import type { User } from '../types';

type SSOProviderId = 'google.com' | 'microsoft.com';

interface AuthFlowError extends Error {
  code: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  pendingGoogleLinkEmail: string | null;
  pendingMicrosoftLinkEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  linkGoogleWithPassword: (password: string) => Promise<void>;
  cancelGoogleLink: () => void;
  linkMicrosoftWithPassword: (password: string) => Promise<void>;
  linkMicrosoftWithGoogle: () => Promise<void>;
  cancelMicrosoftLink: () => void;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MICROSOFT_DOMAIN = (import.meta.env.VITE_MICROSOFT_ALLOWED_DOMAIN || 'igniteaccess.com').toLowerCase();
const GOOGLE_DOMAIN = (import.meta.env.VITE_GOOGLE_ALLOWED_DOMAIN || 'ignite.solar').toLowerCase();
const MICROSOFT_TENANT_ID = import.meta.env.VITE_MICROSOFT_TENANT_ID || 'a7b0a2fa-f9a2-41fe-9e4a-bdaa847f35f9';

function createAuthFlowError(code: string, message: string): AuthFlowError {
  const error = new Error(message) as AuthFlowError;
  error.code = code;
  return error;
}

function getErrorCode(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : '';
}

function getEmailDomain(email: string): string {
  return email.trim().toLowerCase().split('@')[1] || '';
}

function getSSOProvider(user: FirebaseUser): SSOProviderId | null {
  if (user.providerData.some(provider => provider.providerId === 'microsoft.com')) {
    return 'microsoft.com';
  }
  if (user.providerData.some(provider => provider.providerId === 'google.com')) {
    return 'google.com';
  }
  return null;
}

function getProviderEmail(user: FirebaseUser, providerId: SSOProviderId): string | null {
  return user.providerData.find(provider => provider.providerId === providerId)?.email || user.email;
}

function validateSSODomain(email: string | null, providerId: SSOProviderId): asserts email is string {
  if (!email) {
    throw createAuthFlowError('auth/missing-email', 'The identity provider did not return an email address.');
  }

  const expectedDomain = providerId === 'microsoft.com' ? MICROSOFT_DOMAIN : GOOGLE_DOMAIN;
  if (getEmailDomain(email) !== expectedDomain) {
    throw createAuthFlowError('auth/unauthorized-domain', `Sign in with an @${expectedDomain} account.`);
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState<AuthCredential | null>(null);
  const [pendingGoogleLinkEmail, setPendingGoogleLinkEmail] = useState<string | null>(null);
  const [pendingMicrosoftCredential, setPendingMicrosoftCredential] = useState<AuthCredential | null>(null);
  const [pendingMicrosoftLinkEmail, setPendingMicrosoftLinkEmail] = useState<string | null>(null);
  const [pendingMicrosoftLinkUserId, setPendingMicrosoftLinkUserId] = useState<string | null>(null);
  const ssoFlowInProgress = useRef(false);
  const auth = getAuth(app);

  const resolveUserProfile = useCallback(async (firebaseUser: FirebaseUser, providerId?: SSOProviderId) => {
    const activeProvider = providerId || getSSOProvider(firebaseUser);

    if (activeProvider) {
      try {
        const providerEmail = getProviderEmail(firebaseUser, activeProvider);
        validateSSODomain(providerEmail, activeProvider);
        const profile = await userService.getOrCreateSSOUser(firebaseUser.uid, {
          email: providerEmail,
          displayName: firebaseUser.displayName || providerEmail.split('@')[0],
          photoURL: firebaseUser.photoURL,
          authProvider: activeProvider
        });
        setUser(profile);
        return profile;
      } catch (error) {
        await signOut(auth);
        setUser(null);
        throw error;
      }
    }

    const profile = await userService.getUser(firebaseUser.uid);
    setUser(profile);
    return profile;
  }, [auth]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (ssoFlowInProgress.current) return;

      if (firebaseUser) {
        try {
          await resolveUserProfile(firebaseUser);
        } catch (error) {
          console.error('Error resolving user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth, resolveUserProfile]);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await userService.updateLastLogin(result.user.uid);
    } catch (error: unknown) {
      console.error('Login error:', error);
      const code = getErrorCode(error);
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw createAuthFlowError('auth/invalid-credential', 'Invalid email or password');
      }
      throw error;
    }
  };

  const loginWithMicrosoft = async () => {
    const tenantId = MICROSOFT_TENANT_ID.trim();
    if (!tenantId) {
      throw createAuthFlowError('auth/sso-not-configured', 'Microsoft sign-in is not configured.');
    }

    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({ tenant: tenantId, prompt: 'select_account' });

    ssoFlowInProgress.current = true;
    try {
      const result = await signInWithPopup(auth, provider);
      const microsoftEmail = getProviderEmail(result.user, 'microsoft.com');
      validateSSODomain(microsoftEmail, 'microsoft.com');

      const localPart = microsoftEmail.split('@')[0];
      const legacyUser = await userService.getUserForMicrosoftEmail(microsoftEmail);
      const legacyEmail = legacyUser?.email || `${localPart}@${GOOGLE_DOMAIN}`;

      if (legacyUser && legacyUser.id !== result.user.uid) {
        const credential = OAuthProvider.credentialFromResult(result);
        if (!credential) {
          throw createAuthFlowError('auth/expired-microsoft-credential', 'Microsoft sign-in expired. Please try again.');
        }

        await deleteUser(result.user);
        setUser(null);
        setPendingMicrosoftCredential(credential);
        setPendingMicrosoftLinkEmail(legacyEmail);
        setPendingMicrosoftLinkUserId(legacyUser.id);
        throw createAuthFlowError(
          'auth/microsoft-link-required',
          'Confirm your existing Ignite Solar account once to preserve your data.'
        );
      }

      await resolveUserProfile(result.user, 'microsoft.com');
    } catch (error) {
      console.error('Microsoft login error:', error);
      throw error;
    } finally {
      ssoFlowInProgress.current = false;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: GOOGLE_DOMAIN, prompt: 'select_account' });

    ssoFlowInProgress.current = true;
    try {
      const result = await signInWithPopup(auth, provider);
      await resolveUserProfile(result.user, 'google.com');
    } catch (error: unknown) {
      if (getErrorCode(error) === 'auth/account-exists-with-different-credential') {
        const authError = error as AuthError;
        const credential = GoogleAuthProvider.credentialFromError(authError);
        const email = typeof authError.customData?.email === 'string' ? authError.customData.email : '';

        validateSSODomain(email, 'google.com');
        if (!credential) {
          throw createAuthFlowError('auth/expired-google-credential', 'Google sign-in expired. Please try again.');
        }

        setPendingGoogleCredential(credential);
        setPendingGoogleLinkEmail(email);
        throw createAuthFlowError(
          'auth/google-link-required',
          'Enter your existing password once to link Google to this account.'
        );
      }

      console.error('Google login error:', error);
      throw error;
    } finally {
      ssoFlowInProgress.current = false;
    }
  };

  const linkGoogleWithPassword = async (password: string) => {
    if (!pendingGoogleCredential || !pendingGoogleLinkEmail) {
      throw createAuthFlowError('auth/expired-google-credential', 'Google sign-in expired. Please try again.');
    }

    ssoFlowInProgress.current = true;
    try {
      const result = await signInWithEmailAndPassword(auth, pendingGoogleLinkEmail, password);
      await linkWithCredential(result.user, pendingGoogleCredential);
      await resolveUserProfile(result.user, 'google.com');
      setPendingGoogleCredential(null);
      setPendingGoogleLinkEmail(null);
    } catch (error: unknown) {
      const code = getErrorCode(error);
      if (code !== 'auth/wrong-password' && code !== 'auth/invalid-credential') {
        await signOut(auth).catch(() => undefined);
      }
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw createAuthFlowError('auth/wrong-password', 'The password is incorrect.');
      }
      throw error;
    } finally {
      ssoFlowInProgress.current = false;
    }
  };

  const cancelGoogleLink = () => {
    setPendingGoogleCredential(null);
    setPendingGoogleLinkEmail(null);
  };

  const finishMicrosoftLink = async (firebaseUser: FirebaseUser) => {
    if (!pendingMicrosoftCredential || !pendingMicrosoftLinkEmail || !pendingMicrosoftLinkUserId) {
      throw createAuthFlowError('auth/expired-microsoft-credential', 'Microsoft sign-in expired. Please try again.');
    }
    if (firebaseUser.uid !== pendingMicrosoftLinkUserId) {
      await signOut(auth);
      throw createAuthFlowError('auth/account-mismatch', `Use the existing ${pendingMicrosoftLinkEmail} account.`);
    }

    await linkWithCredential(firebaseUser, pendingMicrosoftCredential);
    await resolveUserProfile(firebaseUser, 'microsoft.com');
    setPendingMicrosoftCredential(null);
    setPendingMicrosoftLinkEmail(null);
    setPendingMicrosoftLinkUserId(null);
  };

  const linkMicrosoftWithPassword = async (password: string) => {
    if (!pendingMicrosoftLinkEmail) {
      throw createAuthFlowError('auth/expired-microsoft-credential', 'Microsoft sign-in expired. Please try again.');
    }

    ssoFlowInProgress.current = true;
    try {
      const result = await signInWithEmailAndPassword(auth, pendingMicrosoftLinkEmail, password);
      await finishMicrosoftLink(result.user);
    } catch (error: unknown) {
      const code = getErrorCode(error);
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw createAuthFlowError('auth/wrong-password', 'The password is incorrect.');
      }
      throw error;
    } finally {
      ssoFlowInProgress.current = false;
    }
  };

  const linkMicrosoftWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: GOOGLE_DOMAIN, prompt: 'select_account' });

    ssoFlowInProgress.current = true;
    try {
      const result = await signInWithPopup(auth, provider);
      validateSSODomain(getProviderEmail(result.user, 'google.com'), 'google.com');
      await finishMicrosoftLink(result.user);
    } finally {
      ssoFlowInProgress.current = false;
    }
  };

  const cancelMicrosoftLink = async () => {
    setPendingMicrosoftCredential(null);
    setPendingMicrosoftLinkEmail(null);
    setPendingMicrosoftLinkUserId(null);
    await signOut(auth).catch(() => undefined);
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await userService.createUser(result.user.uid, { email, displayName, authProvider: 'password' });
    } catch (error: unknown) {
      console.error('Registration error:', error);
      if (getErrorCode(error) === 'auth/email-already-in-use') {
        throw createAuthFlowError('auth/email-already-in-use', 'Email already in use');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');
      if (user) await userService.updateLastSeen(user.id);
      await signOut(auth);
      setUser(null);
    } catch (error: unknown) {
      console.error('Logout error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to logout. Please try again.');
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No authenticated user');

    try {
      await userService.updateUser(user.id, data);
      setUser(previous => previous ? { ...previous, ...data } : null);

      if (data.displayName || data.photoURL) {
        await updateProfile(auth.currentUser as FirebaseUser, {
          displayName: data.displayName,
          photoURL: data.photoURL
        });
      }
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update profile. Please try again.');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser || !user) throw new Error('No authenticated user');

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
    } catch (error: unknown) {
      console.error('Password change error:', error);
      if (getErrorCode(error) === 'auth/wrong-password' || getErrorCode(error) === 'auth/invalid-credential') {
        throw createAuthFlowError('auth/wrong-password', 'Current password is incorrect');
      }
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    pendingGoogleLinkEmail,
    pendingMicrosoftLinkEmail,
    login,
    loginWithMicrosoft,
    loginWithGoogle,
    linkGoogleWithPassword,
    cancelGoogleLink,
    linkMicrosoftWithPassword,
    linkMicrosoftWithGoogle,
    cancelMicrosoftLink,
    register,
    logout,
    updateUserProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
