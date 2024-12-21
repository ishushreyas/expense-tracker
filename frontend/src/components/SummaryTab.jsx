import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CircleDollarSign, 
  TrendingUp, 
  Users, 
  ChevronRight,
  Mail,
  DollarSign,
  Activity,
  CreditCard,
  ChevronDown,
  ArrowUpRight,
  Menu
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
    if (email.length > 25) {
      const [username, domain] = email.split('@');
      return `${username.slice(0, 15)}...@${domain}`;
    }
    return email;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Menu className="text-gray-500" size={24} />
            <span className="text-xl font-semibold text-gray-800">Finance Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">JD</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Financial Overview</h1>
          <p className="text-gray-500">Track expenses and manage team finances</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Activity className="text-blue-600" size={20} />
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
            <p className="text-gray-500 text-sm mb-1">Total Expenses</p>
            <p className="text-2xl font-semibold text-gray-800">₹{totalExpenses.toFixed(2)}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Users className="text-green-600" size={20} />
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
            <p className="text-gray-500 text-sm mb-1">Top Spender</p>
            <p className="text-2xl font-semibold text-gray-800">{highestExpenseUser.username}</p>
            <p className="text-sm text-green-600 mt-1">₹{highestExpenseUser.expenses.toFixed(2)}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <CreditCard className="text-purple-600" size={20} />
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
            <p className="text-gray-500 text-sm mb-1">Net Balance</p>
            <p className="text-2xl font-semibold text-gray-800">₹{totalBalance.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Team Members Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Team Members</h2>
              <span className="bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full">
                {userBalanceData.length} members
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {userBalanceData.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ backgroundColor: '#f8fafc' }}
                onClick={() => setSelectedUser(user)}
                className="p-6 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${user.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}
                    `}>
                      <Users 
                        size={20} 
                        className={user.balance >= 0 ? 'text-green-600' : 'text-red-600'} 
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{user.username}</h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Mail size={14} className="mr-1" />
                        {truncateEmail(user.email)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-sm text-gray-500">Balance</p>
                      <p className={`font-medium ${user.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{user.balance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expenses</p>
                      <p className="font-medium text-gray-800">₹{user.expenses.toFixed(2)}</p>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center p-4 z-50"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    ${selectedUser.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}
                  `}>
                    <Users 
                      size={32} 
                      className={selectedUser.balance >= 0 ? 'text-green-600' : 'text-red-600'} 
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{selectedUser.username}</h3>
                    <p className="text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500 text-sm mb-1">Balance</p>
                    <p className={`text-xl font-semibold ${selectedUser.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{selectedUser.balance.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500 text-sm mb-1">Total Expenses</p>
                    <p className="text-xl font-semibold text-gray-800">
                      ₹{selectedUser.expenses.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SummaryTab;