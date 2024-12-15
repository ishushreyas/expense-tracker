// Payments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Send, Download, AlertTriangle, Check } from 'lucide-react';

// WebSocket hook for real-time payments
const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const payment = JSON.parse(event.data);
      setPayments(prev => [payment, ...prev]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setError(error);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const sendPayment = useCallback((payment) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payment));
    }
  }, [socket]);

  return { socket, payments, error, sendPayment };
};

// SendPayment Component
export const SendPayment = ({ 
  users, 
  currentUser, 
  onPaymentSent 
}) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sendPayment } = useWebSocket('ws://room-rent-job.onrender.com//ws/payments');

  const handleSendPayment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payment = {
        payer_id: currentUser.id,
        amount: parseFloat(amount),
        members: [recipient],
        remark: remark || 'Payment',
        created_at: new Date().toISOString()
      };

      sendPayment(payment);
      
      // Reset form and notify parent
      setAmount('');
      setRecipient('');
      setRemark('');
      onPaymentSent && onPaymentSent(payment);
    } catch (error) {
      console.error('Send payment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Send className="mr-3 text-blue-500" size={24} />
        Send Payment
      </h2>
      
      <form onSubmit={handleSendPayment} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Recipient
          </label>
          <select 
            value={recipient} 
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Recipient</option>
            {users
              .filter(user => user.id !== currentUser.id)
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))
            }
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Amount
          </label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Remark (Optional)
          </label>
          <input 
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a note"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
          ) : (
            <Send className="mr-2" size={20} />
          )}
          Send Payment
        </button>
      </form>
    </div>
  );
};

// ReceivePayment Component
export const ReceivePayment = ({ 
  users, 
  currentUser, 
  onPaymentReceived 
}) => {
  const [payments, setPayments] = useState([]);
  const { socket, payments: wsPayments } = useWebSocket('ws://room-rent-job.onrender.com//ws/payments');

  useEffect(() => {
    // Filter payments where current user is a member
    const receivedPayments = wsPayments.filter(
      txn => txn.members.includes(currentUser.id) && txn.type === 'SEND'
    );
    setPayments(receivedPayments);
  }, [wsPayments, currentUser]);

  const handleAcceptPayment = (payment) => {
    // Implement logic to accept payment
    // This might involve updating payment status in backend
    onPaymentReceived && onPaymentReceived(payment);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Download className="mr-3 text-green-500" size={24} />
        Receive Payments
      </h2>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-400 py-10">
          <AlertTriangle className="mb-4 text-yellow-500" size={48} />
          <p className="text-center">No pending payments</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {payments.map(txn => (
            <li 
              key={txn.id} 
              className="bg-gray-50 rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-gray-800">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                  }).format(txn.amount)}
                </p>
                <p className="text-sm text-gray-600">
                  From: {users.find(u => u.id === txn.payer_id)?.name || 'Unknown'}
                </p>
                {txn.remark && (
                  <p className="text-xs text-gray-500 mt-1">{txn.remark}</p>
                )}
              </div>
              <button 
                onClick={() => handleAcceptPayment(txn)}
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
              >
                <Check size={20} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Main Payments Component
export const Payments = ({ 
  users, 
  currentUser 
}) => {
  const [selectedTab, setSelectedTab] = useState('payments');

  return (
    <div className="container mx-auto p-6">
      <div className="flex mb-6 bg-gray-100 rounded-xl p-2">
        <button
          onClick={() => setSelectedTab('payments')}
          className={`flex-1 p-3 rounded-lg transition-all ${
            selectedTab === 'payments' 
              ? 'bg-white shadow-md text-blue-600' 
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Payment History
        </button>
        <button
          onClick={() => setSelectedTab('send')}
          className={`flex-1 p-3 rounded-lg transition-all ${
            selectedTab === 'send' 
              ? 'bg-white shadow-md text-blue-600' 
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Send Payment
        </button>
        <button
          onClick={() => setSelectedTab('receive')}
          className={`flex-1 p-3 rounded-lg transition-all ${
            selectedTab === 'receive' 
              ? 'bg-white shadow-md text-blue-600' 
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Receive Payments
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        {selectedTab === 'payments' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment History</h2>
            <p className="text-gray-600">View your payment history (coming soon!)</p>
          </div>
        )}
        {selectedTab === 'send' && (
          <SendPayment 
            users={users} 
            currentUser={currentUser} 
            onPaymentSent={(txn) => console.log('Payment sent:', txn)} 
          />
        )}
        {selectedTab === 'receive' && (
          <ReceivePayment 
            users={users} 
            currentUser={currentUser} 
            onPaymentReceived={(txn) => console.log('Payment received:', txn)} 
          />
        )}
      </div>
    </div>
  );
};
