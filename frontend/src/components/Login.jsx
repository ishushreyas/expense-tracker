import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // "email" or "otp"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!email) {
      setError("Please enter a valid email.");
      return;
    }

    setError('');
    setLoading(true);
    try {
      await axios.post("/api/send-otp", { email });
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
      const { data: token } = await axios.post("/api/verify-otp", { email, otp });
      localStorage.setItem("authToken", token);
      setIsLoggedIn(true);
    } catch (error) {
      setError("Invalid OTP. Please try again.");
      console.error("Error verifying OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      {step === "email" ? (
        <div>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSendOTP} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>
      ) : (
        <div>
          <h2>Verify OTP</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOTP} disabled={loading}>
            {loading ? 'Verifying OTP...' : 'Verify'}
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;
