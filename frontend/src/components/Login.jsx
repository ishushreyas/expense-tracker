import React, { useState } from 'react';
import { Mail, Lock, Send, CheckCircle, Eye, EyeOff, User } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";

// Firebase config remains the same
const firebaseConfig = {
  apiKey: "AIzaSyAOuHgyMR_00DESQy2ECf8fasqoyLeHppE",
  authDomain: 'room-rent-job.firebaseapp.com',
  projectId: "room-rent-job",
  storageBucket: "room-rent-job.firebasestorage.app",
  messagingSenderId: "106189063159",
  appId: "1:106189063159:web:f9ecb7c9950c022c3f64f2",
  measurementId: "G-6EL9RG936P"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

const postIdTokenToSessionLogin = async (url, idToken, csrfToken) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken,
    },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) {
    throw new Error('Failed to login');
  }
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const Login = ({ setIsLoggedIn, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const csrfToken = getCookie('csrfToken');
      await postIdTokenToSessionLogin('/api/sessionLogin', idToken, csrfToken);
      await signOut(auth);
      setIsLoggedIn(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !firstName || !lastName || !username) {
      setError('All fields are required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Here you would typically also store the additional user info (firstName, lastName, username)
      // in your database or Firebase user profile
      setStep('login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setStep('login');
      alert('Password reset email sent. Check your inbox.');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const buttonClasses = "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {step === 'login' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Login</h2>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className={buttonClasses}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-sm text-center">
              <span>Don't have an account? </span>
              <button onClick={() => setStep('signup')} className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up
              </button>
            </div>

            <div className="text-sm text-center">
              <button onClick={() => setStep('reset')} className="text-blue-600 hover:text-blue-500 font-medium">
                Forgot your password?
              </button>
            </div>
          </div>
        )}

        {step === 'signup' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Sign Up</h2>
            </div>

            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className={buttonClasses}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>

            <div className="text-sm text-center">
              <span>Already have an account? </span>
              <button onClick={() => setStep('login')} className="text-blue-600 hover:text-blue-500 font-medium">
                Login
              </button>
            </div>
          </div>
        )}

        {step === 'reset' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handlePasswordReset}
              disabled={loading}
              className={buttonClasses}
            >
              {loading ? 'Sending email...' : 'Reset Password'}
            </button>

            <div className="text-sm text-center">
              <span>Remembered your password? </span>
              <button onClick={() => setStep('login')} className="text-blue-600 hover:text-blue-500 font-medium">
                Login
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
