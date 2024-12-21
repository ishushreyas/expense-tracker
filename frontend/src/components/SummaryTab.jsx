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

function SummaryTab({ summary, users }) {
  const [selectedUser, setSelectedUser] = useState(null);

  // Prepare user balance data
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

  // Calculations
  const totalExpenses = summary.total_expenses || 0;
  const highestExpenseUser = userBalanceData.reduce((max, user) => 
    (user.expenses > max.expenses) ? user : max, 
    { expenses: 0, username: 'None' }
  );
  const totalBalance = userBalanceData.reduce((sum, user) => sum + user.balance, 0);

  // Email truncation function
  const truncateEmail = (email) => {
    if (email.length > 20) {
      const [username, domain] = email.split('@');
      return `${username.slice(0, 10)}...@${domain}`;
    }
    return email;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-10 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center">
            <CircleDollarSign className="mr-3 text-blue-600" size={36} />
            Financial Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Team Financial Overview
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Expenses */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-4 shadow-md"
          >
            <div className="flex items-center justify-between">
              <TrendingUp className="text-blue-600" size={24} />
              <span className="text-sm text-gray-500">Total Expenses</span>
            </div>
            <div className="mt-2 text-2xl font-bold">₹{totalExpenses.toFixed(2)}</div>
          </motion.div>

          {/* Highest Spender */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-4 shadow-md"
          >
            <div className="flex items-center justify-between">
              <Users className="text-green-600" size={24} />
              <span className="text-sm text-gray-500">Top Spender</span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold">{highestExpenseUser.username}</div>
              <div className="text-green-600">₹{highestExpenseUser.expenses.toFixed(2)}</div>
            </div>
          </motion.div>

          {/* Total Balance */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-4 shadow-md"
          >
            <div className="flex items-center justify-between">
              <ReceiptText className="text-purple-600" size={24} />
              <span className="text-sm text-gray-500">Net Balance</span>
            </div>
            <div className="mt-2 text-2xl font-bold">₹{totalBalance.toFixed(2)}</div>
          </motion.div>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userBalanceData.map((user) => (
            <motion.div 
              key={user.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedUser(user)}
              className={`
                bg-white rounded-lg p-4 cursor-pointer shadow-md
                ${selectedUser?.id === user.id ? 'ring-2 ring-blue-400' : ''}
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${user.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}
                `}>
                  <Users size={20} className={user.balance >= 0 ? 'text-green-600' : 'text-red-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{user.username}</h3>
                  <div className="text-sm text-gray-500 truncate" title={user.email}>
                    {truncateEmail(user.email)}
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className={`text-lg font-semibold ${user.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{user.balance.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Expenses: ₹{user.expenses.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* User Detail Modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedUser(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-sm w-full"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className={`
                    w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4
                    ${selectedUser.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}
                  `}>
                    <Users size={32} className={selectedUser.balance >= 0 ? 'text-green-600' : 'text-red-600'} />
                  </div>
                  <h2 className="text-xl font-bold mb-1">{selectedUser.username}</h2>
                  <p className="text-gray-500 text-sm break-all mb-4">{selectedUser.email}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Balance</p>
                      <p className={`text-xl font-bold ${selectedUser.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{selectedUser.balance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expenses</p>
                      <p className="text-xl font-bold text-gray-800">
                        ₹{selectedUser.expenses.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SummaryTab;