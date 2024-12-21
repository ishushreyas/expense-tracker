import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CircleDollarSign, 
  TrendingUp, 
  Users, 
  ReceiptText, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  Mail,
  DollarSign
} from 'lucide-react';

function SummaryTab({ summary, users }) {
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

  const totalExpenses = summary.total_expenses || 0;
  const highestExpenseUser = userBalanceData.reduce((max, user) => 
    (user.expenses > max.expenses) ? user : max, 
    { expenses: 0, username: 'None' }
  );
  const totalBalance = userBalanceData.reduce((sum, user) => sum + user.balance, 0);

  const truncateEmail = (email) => {
    if (email.length > 20) {
      const [username, domain] = email.split('@');
      return `${username.slice(0, 10)}...@${domain}`;
    }
    return email;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-8xl mx-auto">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 md:mb-16"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 flex items-center justify-center mb-4">
              <CircleDollarSign className="mr-4 text-blue-600" size={48} />
              Financial Overview
            </h1>
            <p className="text-xl text-gray-600">
              Track your team's financial activities and expenses
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Total Expenses Card */}
            <motion.div 
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="bg-blue-100 p-4 rounded-xl">
                  <TrendingUp className="text-blue-600" size={32} />
                </div>
                <ArrowUpRight className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg text-gray-600 mb-2">Total Expenses</h3>
              <p className="text-3xl md:text-4xl font-bold text-gray-800">₹{totalExpenses.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">Across all team members</p>
            </motion.div>

            {/* Highest Spender Card */}
            <motion.div 
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="bg-green-100 p-4 rounded-xl">
                  <Users className="text-green-600" size={32} />
                </div>
                <ArrowUpRight className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg text-gray-600 mb-2">Top Spender</h3>
              <p className="text-3xl md:text-4xl font-bold text-gray-800">{highestExpenseUser.username}</p>
              <p className="text-lg text-green-600 mt-2">₹{highestExpenseUser.expenses.toFixed(2)}</p>
            </motion.div>

            {/* Total Balance Card */}
            <motion.div 
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="bg-purple-100 p-4 rounded-xl">
                  <ReceiptText className="text-purple-600" size={32} />
                </div>
                <ArrowUpRight className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg text-gray-600 mb-2">Net Balance</h3>
              <p className="text-3xl md:text-4xl font-bold text-gray-800">₹{totalBalance.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">Total team balance</p>
            </motion.div>
          </div>

          {/* User Cards Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Users className="mr-3 text-blue-600" size={28} />
              Team Members Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBalanceData.map((user) => (
                <motion.div 
                  key={user.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => setSelectedUser(user)}
                  className={`
                    bg-white rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all
                    ${selectedUser?.id === user.id ? 'ring-4 ring-blue-400' : ''}
                  `}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`
                      w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0
                      ${user.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}
                    `}>
                      <Users size={32} className={user.balance >= 0 ? 'text-green-600' : 'text-red-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{user.username}</h3>
                      <div className="flex items-center text-gray-500 mb-3">
                        <Mail size={16} className="mr-2" />
                        <span className="truncate" title={user.email}>
                          {truncateEmail(user.email)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Balance</p>
                          <p className={`text-xl font-bold ${user.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{user.balance.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Expenses</p>
                          <p className="text-xl font-bold text-gray-800">
                            ₹{user.expenses.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedUser(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className={`
                    w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-6
                    ${selectedUser.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}
                  `}>
                    <Users size={48} className={selectedUser.balance >= 0 ? 'text-green-600' : 'text-red-600'} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedUser.username}</h2>
                  <p className="text-gray-500 break-all mb-8">{selectedUser.email}</p>
                  
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <DollarSign className="mx-auto mb-2 text-blue-600" size={24} />
                      <p className="text-sm text-gray-500 mb-1">Balance</p>
                      <p className={`text-2xl font-bold ${selectedUser.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{selectedUser.balance.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <ReceiptText className="mx-auto mb-2 text-purple-600" size={24} />
                      <p className="text-sm text-gray-500 mb-1">Expenses</p>
                      <p className="text-2xl font-bold text-gray-800">
                        ₹{selectedUser.expenses.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Close Details
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