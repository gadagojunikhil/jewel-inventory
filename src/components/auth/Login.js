import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PageIdentifier from '../shared/PageIdentifier';
import SCREEN_IDS from '../../utils/screenIds';

const Login = () => {
  const { setAuthData } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const [passwordResetRequired, setPasswordResetRequired] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetPassword, setResetPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordRequirements, setPasswordRequirements] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch password requirements
  useEffect(() => {
    const fetchPasswordRequirements = async () => {
      try {
        const response = await fetch('/api/auth/password-requirements');
        if (response.ok) {
          const data = await response.json();
          setPasswordRequirements(data.requirements);
        }
      } catch (error) {
        console.error('Failed to fetch password requirements:', error);
      }
    };
    fetchPasswordRequirements();
  }, []);

  // Countdown for account lock
  useEffect(() => {
    let interval;
    if (accountLocked && lockTimeRemaining > 0) {
      interval = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            setAccountLocked(false);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [accountLocked, lockTimeRemaining]);

  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return {
      valid: Object.values(validations).every(Boolean),
      checks: {
        'At least 8 characters': validations.length,
        'One uppercase letter': validations.uppercase,
        'One lowercase letter': validations.lowercase,
        'One number': validations.number,
        'One special character': validations.special
      }
    };
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleResetPasswordChange = (e) => {
    setResetPassword({
      ...resetPassword,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAttemptsRemaining(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.passwordResetRequired) {
          // Store token and user data for password reset
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setCurrentUser(data.user);
          setPasswordResetRequired(true);
          setShowPasswordReset(true);
          setError('');
        } else {
          // Use AuthContext to set authentication state directly
          setAuthData(data.user, data.token);
        }
      } else {
        if (response.status === 423 && data.accountLocked) {
          setAccountLocked(true);
          setLockTimeRemaining(data.lockTimeRemaining || 30);
        } else if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (resetPassword.new !== resetPassword.confirm) {
      setError('New passwords do not match');
      return;
    }

    const validation = validatePassword(resetPassword.new);
    if (!validation.valid) {
      setError('Password does not meet requirements');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: resetPassword.current,
          newPassword: resetPassword.new
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordResetRequired(false);
        setShowPasswordReset(false);
        setAuthData(currentUser, token);
      } else {
        setError(data.error || 'Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins > 0 ? `${mins} minute${mins !== 1 ? 's' : ''}` : ''}`;
  };

  if (showPasswordReset) {
    const passwordValidation = validatePassword(resetPassword.new);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Password Reset Required</h1>
            <p className="text-gray-600 mt-2">Please set a new password to continue</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="current"
                  value={resetPassword.current}
                  onChange={handleResetPasswordChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  name="new"
                  value={resetPassword.new}
                  onChange={handleResetPasswordChange}
                  className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  name="confirm"
                  value={resetPassword.confirm}
                  onChange={handleResetPasswordChange}
                  className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {resetPassword.new && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
                <div className="space-y-1">
                  {Object.entries(passwordValidation.checks).map(([requirement, isValid]) => (
                    <div key={requirement} className="flex items-center text-xs">
                      {isValid ? (
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-500 mr-2" />
                      )}
                      <span className={isValid ? 'text-green-700' : 'text-red-700'}>
                        {requirement}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passwordValidation.valid || resetPassword.new !== resetPassword.confirm}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <PageIdentifier pageId={SCREEN_IDS?.AUTHENTICATION?.LOGIN || 'AUTH-001'} pageName="Login" isModal={true} />
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {accountLocked && (
          <div className="mb-4 p-3 bg-orange-100 border border-orange-300 text-orange-700 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">Account Locked</span>
            </div>
            <p className="text-sm mt-1">
              Account will be unlocked in {formatTime(lockTimeRemaining)}
            </p>
          </div>
        )}

        {attemptsRemaining !== null && attemptsRemaining > 0 && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md flex items-center">
            <Info className="w-4 h-4 mr-2" />
            <span>
              {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before account lockout
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                disabled={accountLocked}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                disabled={accountLocked}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={accountLocked}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || accountLocked}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Contact your administrator if you need help accessing your account</p>
        </div>
      </div>
    </div>
  );
};

export default Login;