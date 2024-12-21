import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CircleDollarSign, 
  TrendingUp, 
  Users, 
  ReceiptText, 
  ArrowUpRight, 
  ArrowDownRight,
  Info
} from 'lucide-react';

function SummaryTab({ summary, users, currentUser }) {
  const [selectedUser, setSelectedUser] = useState(null);

  const userBalanceData = useMemo(() => 
    Object.entries(summary.user_balances || {}).map(([userId, balance]) => {
      const user = users.find((u) => u.id === userId);
      return {
        id: userId,
        username: user?.username || "Unknown",
        balance: balance,
        email: user?.email || "N/A",
        expenses: summary.user_expenses?.[userId] || 0
      };
    }), [summary.user_balances, users]
  );

  const currentUserData = userBalanceData.find((user) => user.email === currentUser.email);

  const totalExpenses = summary.total_expenses || 0;
  const highestExpenseUser = userBalanceData.reduce((max, user) => 
    (user.expenses > max.expenses) ? user : max, 
    { expenses: 0, username: 'None' }
  );

  const totalBalance = userBalanceData.reduce((sum, user) => sum + user.balance, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
            <CircleDollarSign className="mr-3 text-indigo-600" size={32} />
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, <span className="font-bold text-indigo-600">{currentUser.email}</span>!
          </p>
        </div>

        {/* Personalized Card for Current User */}
        {currentUserData && (
          <motion.div 
            className="mb-8 p-6 bg-indigo-100 border-l-4 border-indigo-500 rounded-lg shadow"
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-2">Your Financial Summary</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Balance</p>
                <p className={`text-2xl font-bold ${currentUserData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{currentUserData.balance.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-800">₹{currentUserData.expenses.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-3 mb-8">
          {/* Total Expenses */}
          <motion.div className="p-6 bg-white shadow rounded-lg border-l-4 border-indigo-500 hover:shadow-lg">
            <div className="text-gray-500 mb-3">Total Expenses</div>
            <div className="text-2xl font-bold text-gray-800">₹{totalExpenses.toFixed(2)}</div>
          </motion.div>

          {/* Highest Spender */}
          <motion.div className="p-6 bg-white shadow rounded-lg border-l-4 border-green-500 hover:shadow-lg">
            <div className="text-gray-500 mb-3">Highest Spender</div>
            <div className="text-xl font-semibold text-gray-800">{highestExpenseUser.username}</div>
            <div className="text-lg text-green-600">₹{highestExpenseUser.expenses.toFixed(2)}</div>
          </motion.div>

          {/* Total Balance */}
          <motion.div className="p-6 bg-white shadow rounded-lg border-l-4 border-purple-500 hover:shadow-lg">
            <div className="text-gray-500 mb-3">Total Balance</div>
            <div className="text-2xl font-bold text-gray-800">₹{totalBalance.toFixed(2)}</div>
          </motion.div>
        </div>

        {/* User Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">User Balances</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userBalanceData.map((user) => (
              <motion.div 
                key={user.id}
                className="p-5 bg-gray-100 rounded-lg hover:shadow-lg transition"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{user.username}</h3>
                    <p className="text-sm text-gray-500 truncate" title={user.email}>{user.email}</p>
                  </div>
                  {user.balance >= 0 ? (
                    <ArrowUpRight className="text-green-500" size={20} />
                  ) : (
                    <ArrowDownRight className="text-red-500" size={20} />
                  )}
                </div>
                <div className="text-gray-500">Balance</div>
                <div className={`text-xl font-bold ${user.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{user.balance.toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
              onClick={() => setSelectedUser(null)}
            >
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-lg w-96"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedUser.username}</h2>
                <p className="text-gray-600">{selectedUser.email}</p>
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <div>Balance</div>
                    <div className={`font-bold ${selectedUser.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{selectedUser.balance.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>Total Expenses</div>
                    <div className="font-bold text-gray-800">₹{selectedUser.expenses.toFixed(2)}</div>
                  </div>
                </div>
                <button 
                  className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SummaryTab;
