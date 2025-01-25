import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from './components/AuthLayout';
import AuthAlert from './components/AuthAlert';
import EmailInput from './components/EmailInput';
import PasswordInput from './components/PasswordInput';
import SubmitButton from './components/SubmitButton';

export default function Login() {
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const emailSuffix = '@ignite.solar';
  const email = emailPrefix + emailSuffix;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const registered = params.get('registered');
    if (registered === 'true') {
      setSuccess('Account created successfully! Please log in.');
    }
  }, [location]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
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
      setLoading(true);
      await login(email, password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later');
      } else {
        setError('Failed to log in. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Sign in to OKRFlow"
      subtitle="Or"
      linkText="create a new account"
      linkTo="/register"
    >
      <AuthAlert type="error" message={error} />
      <AuthAlert type="success" message={success} />
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <EmailInput
          value={emailPrefix}
          onChange={(e) => setEmailPrefix(e.target.value)}
          suffix={emailSuffix}
        />

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <SubmitButton type="login" loading={loading} />
      </form>
    </AuthLayout>
  );
}