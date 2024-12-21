import React, { useState } from 'react';
import { Mail, Lock, Send, CheckCircle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";

// Firebase Config
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

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      await signInWithEmailAndPassword(auth, email, password);
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
      alert('Password reset email sent. Check your inbox.');
      setStep('login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-300 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
          {step === 'login' ? 'Welcome Back!' : step === 'signup' ? 'Join Us!' : 'Reset Password'}
        </h2>
        <p className="text-center text-gray-500 mb-6">
          {step === 'login'
            ? 'Login to access your account'
            : step === 'signup'
            ? 'Create a new account to get started'
            : 'We’ll send a password reset link to your email'}
        </p>
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          {step !== 'reset' && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          )}
          <button
            onClick={
              step === 'login'
                ? handleLogin
                : step === 'signup'
                ? handleSignup
                : handlePasswordReset
            }
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : step === 'login' ? 'Login' : step === 'signup' ? 'Sign Up' : 'Reset Password'}
          </button>
        </div>
        <p className="text-center text-gray-500 mt-4">
          {step === 'login' && (
            <>
              Don't have an account?{' '}
              <button onClick={() => setStep('signup')} className="text-blue-500 underline">
                Sign up
              </button>
              <br />
              Forgot your password?{' '}
              <button onClick={() => setStep('reset')} className="text-blue-500 underline">
                Reset
              </button>
            </>
          )}
          {step === 'signup' && (
            <>
              Already have an account?{' '}
              <button onClick={() => setStep('login')} className="text-blue-500 underline">
                Login
              </button>
            </>
          )}
          {step === 'reset' && (
            <>
              Remember your password?{' '}
              <button onClick={() => setStep('login')} className="text-blue-500 underline">
                Login
              </button>
            </>
          )}
        </p>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;