import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  ChevronRight,
  Mail,
  User,
  DollarSign,
  Activity,
  CreditCard,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  PieChart,
  LineChart,
  UserPlus,
  Wallet,
  Bell
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
        expenses: summary.user_expenses?.[userId] || 0,
        avatar: user?.avatar || null
      };
    }), [summary.user_balances, users]
  );

  const totalExpenses = summary.total_expenses || 0;
  const avgExpense = totalExpenses / userBalanceData.length;
  const totalBalance = userBalanceData.reduce((sum, user) => sum + user.balance, 0);

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Wallet className="text-blue-600" size={20} />
              </div>
              <ArrowUpRight className="text-green-500" size={20} />
            </div>
            <p className="text-sm text-gray-500">Total Balance</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">₹{totalBalance.toFixed(2)}</p>
            <div className="mt-2 text-xs text-green-600 flex items-center">
              <ArrowUpRight size={12} className="mr-1" /> +2.5% from last month
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Activity className="text-purple-600" size={20} />
              </div>
              <ArrowDownRight className="text-red-500" size={20} />
            </div>
            <p className="text-sm text-gray-500">Average Expense</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">₹{avgExpense.toFixed(2)}</p>
            <div className="mt-2 text-xs text-red-600 flex items-center">
              <ArrowDownRight size={12} className="mr-1" /> -1.2% from last month
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="text-green-600" size={20} />
              </div>
              <span className="text-xs font-medium text-gray-500">Last 30 days</span>
            </div>
            <p className="text-sm text-gray-500">Active Members</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">{userBalanceData.length}</p>
            <div className="mt-2 text-xs text-green-600 flex items-center">
              <UserPlus size={12} className="mr-1" /> 2 new this month
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <PieChart className="text-orange-600" size={20} />
              </div>
              <span className="text-xs font-medium text-gray-500">This Month</span>
            </div>
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">₹{totalExpenses.toFixed(2)}</p>
            <div className="mt-2 text-xs text-orange-600 flex items-center">
              <LineChart size={12} className="mr-1" /> 15% of budget used
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Members List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Team Members</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
              </div>
              <div className="divide-y divide-gray-100">
                {userBalanceData.slice(0, 5).map((user) => (
                  <motion.div
                    key={user.id}
                    whileHover={{ backgroundColor: '#f8fafc' }}
                    onClick={() => setSelectedUser(user)}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <User size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`font-medium ${user.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{user.balance.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">Balance</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {userBalanceData.slice(0, 4).map((user, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'
                  }`}>
                    <DollarSign size={16} className={
                      index % 2 === 0 ? 'text-blue-600' : 'text-green-600'
                    } />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{user.username}</span> {' '}
                      {index % 2 === 0 ? 'added expense of' : 'received payment of'}
                    </p>
                    <p className="text-sm font-medium text-gray-600">₹{user.expenses.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
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
              className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">User Details</h3>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown size={24} />
                  </button>
                </div>

                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User size={40} className="text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800">{selectedUser.username}</h4>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                    <p className={`text-xl font-semibold ${
                      selectedUser.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₹{selectedUser.balance.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                    <p className="text-xl font-semibold text-gray-800">
                      ₹{selectedUser.expenses.toFixed(2)}
                    </p>
                  </div>
                </div>

                <button 
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
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