import React, { useState } from 'react';
import { Mail, Lock, Send, CheckCircle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";

// Initialize Firebase (Replace with your config)
const firebaseConfig = {
  apiKey: 'AIzaSyAOuHgyMR_00DESQy2ECf8fasqoyLeHppE',
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

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('login'); // 'login', 'signup', 'otp', 'reset'
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
      await signInWithEmailAndPassword(auth, email, password).then(user => {
  // Get the user's ID token as it is needed to exchange for a session cookie.
  return user.getIdToken().then(idToken => {
    // Session login endpoint is queried and the session cookie is set.
    // CSRF protection should be taken into account.
    // ...
    const csrfToken = getCookie('csrfToken')
    return postIdTokenToSessionLogin('/api/sessionLogin', idToken, csrfToken);
  });
}).then(() => {
  // A page redirect would suffice as the persistence is set to NONE.
  return signOut(auth);
}).then(() => {
  window.location.assign('/profile');
});
      setIsLoggedIn(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
        {step === 'login' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-600 mb-4 text-center">Login</h2>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button onClick={() => setStep('signup')} className="text-blue-500 underline">
                Sign up
              </button>
            </p>
            <p className="text-center text-sm text-gray-500">
              Forgot your password?{' '}
              <button onClick={() => setStep('reset')} className="text-blue-500 underline">
                Reset Password
              </button>
            </p>
          </div>
        )}

        {step === 'signup' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-600 mb-4 text-center">Sign Up</h2>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button onClick={() => setStep('login')} className="text-blue-500 underline">
                Login
              </button>
            </p>
          </div>
        )}

        {step === 'reset' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-600 mb-4 text-center">Reset Password</h2>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? 'Sending email...' : 'Reset Password'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Remembered your password?{' '}
              <button onClick={() => setStep('login')} className="text-blue-500 underline">
                Login
              </button>
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
