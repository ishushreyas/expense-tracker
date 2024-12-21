import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CircleDollarSign, 
  TrendingUp, 
  Users, 
  ReceiptText, 
  ArrowUpRight, 
  ArrowDownRight,
  Mail,
  DollarSign,
  Wallet,
  CreditCard,
  UserCircle,
  ChevronRight
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
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-8xl mx-auto px-6 md:px-10 py-12 md:py-20">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Financial Dashboard
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Comprehensive view of your team's financial activities
            </p>
          </motion.div>

          {/* Stats Cards in Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <Wallet size={32} />
                </div>
                <ArrowUpRight size={24} />
              </div>
              <p className="text-lg text-blue-100">Total Expenses</p>
              <h3 className="text-4xl font-bold mt-2">₹{totalExpenses.toFixed(2)}</h3>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <UserCircle size={32} />
                </div>
                <ArrowUpRight size={24} />
              </div>
              <p className="text-lg text-blue-100">Top Spender</p>
              <h3 className="text-4xl font-bold mt-2">{highestExpenseUser.username}</h3>
              <p className="text-xl text-blue-200 mt-1">₹{highestExpenseUser.expenses.toFixed(2)}</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <CreditCard size={32} />
                </div>
                <ArrowUpRight size={24} />
              </div>
              <p className="text-lg text-blue-100">Net Balance</p>
              <h3 className="text-4xl font-bold mt-2">₹{totalBalance.toFixed(2)}</h3>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-8xl mx-auto px-6 md:px-10 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            Team Members
            <span className="ml-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-normal">
              {userBalanceData.length} Members
            </span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {userBalanceData.map((user) => (
              <motion.div 
                key={user.id}
                whileHover={{ scale: 1.02 }}
                className={`
                  bg-white rounded-3xl p-8 cursor-pointer shadow-lg hover:shadow-xl transition-all
                  ${selectedUser?.id === user.id ? 'ring-4 ring-blue-400' : ''}
                `}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center
                    ${user.balance >= 0 ? 'bg-emerald-100' : 'bg-rose-100'}
                  `}>
                    <Users 
                      size={40} 
                      className={user.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'} 
                    />
                  </div>
                  <ChevronRight size={24} className="text-gray-400" />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{user.username}</h3>
                    <div className="flex items-center text-gray-500 mt-1">
                      <Mail size={16} className="mr-2" />
                      <span className="truncate" title={user.email}>
                        {truncateEmail(user.email)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Balance</p>
                      <p className={`text-2xl font-bold ${user.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ₹{user.balance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Expenses</p>
                      <p className="text-2xl font-bold text-gray-800">
                        ₹{user.expenses.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-10 max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`
                  w-32 h-32 mx-auto rounded-3xl flex items-center justify-center mb-8
                  ${selectedUser.balance >= 0 ? 'bg-emerald-100' : 'bg-rose-100'}
                `}>
                  <Users 
                    size={64} 
                    className={selectedUser.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'} 
                  />
                </div>
                
                <h2 className="text-4xl font-bold text-gray-800 mb-2">
                  {selectedUser.username}
                </h2>
                <p className="text-gray-500 text-lg break-all mb-8">
                  {selectedUser.email}
                </p>
                
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <DollarSign className="mx-auto mb-3 text-blue-600" size={32} />
                    <p className="text-gray-500 mb-2">Balance</p>
                    <p className={`text-3xl font-bold ${selectedUser.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ₹{selectedUser.balance.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <ReceiptText className="mx-auto mb-3 text-purple-600" size={32} />
                    <p className="text-gray-500 mb-2">Expenses</p>
                    <p className="text-3xl font-bold text-gray-800">
                      ₹{selectedUser.expenses.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="w-full bg-blue-600 text-white py-4 px-8 rounded-2xl text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SummaryTab;