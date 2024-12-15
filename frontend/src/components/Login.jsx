import React, { useState } from 'react';
import { Mail, Lock, Send, CheckCircle } from 'lucide-react';

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulated API calls (replace with actual API calls in your project)
  const handleSendOTP = async () => {
    if (!email) {
      setError("Please enter a valid email.");
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Simulated OTP send
      console.log('Sending OTP to', email);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep("otp");
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
      console.error("Error sending OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError("Please enter a valid OTP.");
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Simulated OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      localStorage.setItem("authToken", "simulated-token");
      setIsLoggedIn(true);
    } catch (error) {
      setError("Invalid OTP. Please try again.");
      console.error("Error verifying OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
        {step === "email" ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-600 mb-4">Login</h2>
              <p className="text-gray-500">Enter your email to receive an OTP</p>
            </div>
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
              onClick={handleSendOTP} 
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span>Sending OTP...</span>
                  <div className="animate-spin">
                    <Send size={20} />
                  </div>
                </>
              ) : (
                <>
                  <span>Send OTP</span>
                  <Send size={20} />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-600 mb-4">Verify OTP</h2>
              <p className="text-gray-500">Enter the OTP sent to {email}</p>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={handleVerifyOTP} 
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span>Verifying OTP...</span>
                  <div className="animate-spin">
                    <CheckCircle size={20} />
                  </div>
                </>
              ) : (
                <>
                  <span>Verify</span>
                  <CheckCircle size={20} />
                </>
              )}
            </button>
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
