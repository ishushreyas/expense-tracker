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
        name: user?.name || "Unknown",
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
    { expenses: 0, name: 'None' }
  );

  // Calculate the total balance across all users
  const totalBalance = userBalanceData.reduce((sum, user) => sum + user.balance, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl font-extrabold text-gray-800 flex items-center justify-center">
            <CircleDollarSign className="mr-4 text-indigo-600" size={48} />
            Dashboard
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Comprehensive overview of your team's financial activities
          </p>
        </motion.div>

        {/* Top Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Expenses Card */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-indigo-500"
          >
            <div className="flex justify-between items-center mb-4">
              <TrendingUp className="text-indigo-600" size={32} />
              <span className="text-gray-500 font-medium">Total Expenses</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              ₹{totalExpenses.toFixed(2)}
            </div>
          </motion.div>

          {/* Highest Expense User Card */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-green-500"
          >
            <div className="flex justify-between items-center mb-4">
              <Users className="text-green-600" size={32} />
              <span className="text-gray-500 font-medium">Highest Spender</span>
            </div>
            <div className="text-xl font-bold text-gray-800">
              {highestExpenseUser.name}
            </div>
            <div className="text-lg text-green-600">
              ₹{highestExpenseUser.expenses.toFixed(2)}
            </div>
          </motion.div>

          {/* New Creative Metric Card */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-purple-500"
          >
            <div className="flex justify-between items-center mb-4">
              <ReceiptText className="text-purple-600" size={32} />
              <span className="text-gray-500 font-medium">Total Balance Across All Users</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              ₹{totalBalance.toFixed(2)}
            </div>
          </motion.div>
        </div>

        {/* User Details Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white shadow-xl rounded-xl p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="mr-3 text-indigo-600" size={32} />
              User Balance Details
            </h2>
            {selectedUser && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center bg-gray-100 px-4 py-2 rounded-full"
              >
                <Info className="mr-2 text-blue-500" size={20} />
                <span className="text-gray-700">
                  {selectedUser.name} selected
                </span>
              </motion.div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {userBalanceData.map((user) => (
              <motion.div 
                key={user.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedUser(user)}
                className={`
                  p-5 rounded-xl cursor-pointer transition-all 
                  ${selectedUser?.id === user.id 
                    ? 'ring-4 ring-indigo-300 bg-indigo-50' 
                    : 'bg-white hover:bg-gray-50'}
                  shadow-md border border-gray-100
                `}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mr-4
                      ${user.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}
                    `}>
                      <Users 
                        className={user.balance >= 0 ? 'text-green-600' : 'text-red-600'}
                        size={24} 
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {user.balance >= 0 
                    ? <ArrowUpRight className="text-green-600" /> 
                    : <ArrowDownRight className="text-red-600" />
                  }
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-600">Balance</div>
                  <div className={`
                    text-xl font-bold
                    ${user.balance >= 0 ? 'text-green-600' : 'text-red-600'}
                  `}>
                    ₹{user.balance.toFixed(2)}
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="text-sm text-gray-600">Total Expenses</div>
                  <div className="text-lg font-semibold text-gray-800">
                    ₹{user.expenses.toFixed(2)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Detailed User Modal */}
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
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.7 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className={`
                    mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4
                    ${selectedUser.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}
                  `}>
                    <Users 
                      className={selectedUser.balance >= 0 ? 'text-green-600' : 'text-red-600'}
                      size={48} 
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedUser.name}</h2>
                  <p className="text-gray-600 mb-4">{selectedUser.email}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500">Balance</p>
                      <div className={`
                        text-2xl font-bold
                        ${selectedUser.balance >= 0 ? 'text-green-600' : 'text-red-600'}
                      `}>
                        ₹{selectedUser.balance.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Expenses</p>
                      <div className="text-2xl font-bold text-gray-800">
                        ₹{selectedUser.expenses.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors"
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
