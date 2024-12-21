import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleDollarSign,
  TrendingUp,
  Users,
  ReceiptText,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from "lucide-react";

const GlassCard = ({ children, className = "", ...props }) => (
  <motion.div
    className={`backdrop-blur-xl bg-white/70 rounded-3xl border border-white/20 shadow-lg ${className}`}
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    {...props}
  >
    {children}
  </motion.div>
);

function SummaryTab({ summary, users, currentUser }) {
  const [selectedUser, setSelectedUser] = useState(null);

  const userBalanceData = useMemo(
    () =>
      Object.entries(summary.user_balances || {}).map(([userId, balance]) => {
        const user = users.find((u) => u.id === userId);
        return {
          id: userId,
          username: user?.username || "Unknown",
          balance: balance,
          email: user?.email || "N/A",
          expenses: summary.user_expenses?.[userId] || 0,
        };
      }),
    [summary.user_balances, users]
  );

  const currentUserData = userBalanceData.find(
    (user) => user.email === currentUser.email
  );

  const totalExpenses = summary.total_expenses || 0;
  const highestExpenseUser = userBalanceData.reduce(
    (max, user) => (user.expenses > max.expenses ? user : max),
    { expenses: 0, username: "None" }
  );

  const totalBalance = userBalanceData.reduce((sum, user) => sum + user.balance, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-gray-900 tracking-tight">
            Expenses
          </h1>
          <p className="text-lg text-gray-500 mt-2 tracking-wide">
            Welcome back, <span className="text-gray-900">{currentUser.email}</span>
          </p>
        </div>

        {/* User Summary */}
        {currentUserData && (
          <GlassCard className="mb-8 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <h2 className="text-2xl font-medium text-gray-900 tracking-tight">Financial Summary</h2>
                <p className="text-gray-500 mt-1">Your current status</p>
              </div>
              <div className="flex gap-12">
                <div>
                  <p className="text-gray-500 text-sm tracking-wide">Balance</p>
                  <p className={`text-4xl font-medium mt-1 tracking-tight ${
                    currentUserData.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    ₹{currentUserData.balance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm tracking-wide">Expenses</p>
                  <p className="text-4xl font-medium mt-1 tracking-tight text-gray-900">
                    ₹{currentUserData.expenses.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <ReceiptText className="text-blue-600" size={24} />
              </div>
              <p className="text-sm text-gray-500 tracking-wide">Total Expenses</p>
            </div>
            <p className="text-3xl font-medium text-gray-900 tracking-tight">
              ₹{totalExpenses.toFixed(2)}
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-500/10 rounded-2xl">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <p className="text-sm text-gray-500 tracking-wide">Highest Spender</p>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1 tracking-tight">
              {highestExpenseUser.username}
            </p>
            <p className="text-2xl font-medium text-green-600 tracking-tight">
              ₹{highestExpenseUser.expenses.toFixed(2)}
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl">
                <CircleDollarSign className="text-purple-600" size={24} />
              </div>
              <p className="text-sm text-gray-500 tracking-wide">Total Balance</p>
            </div>
            <p className="text-3xl font-medium text-gray-900 tracking-tight">
              ₹{totalBalance.toFixed(2)}
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-500/10 rounded-2xl">
                <Users className="text-gray-600" size={24} />
              </div>
              <p className="text-sm text-gray-500 tracking-wide">Total Users</p>
            </div>
            <p className="text-3xl font-medium text-gray-900 tracking-tight">
              {users.length}
            </p>
          </GlassCard>
        </div>

        {/* User List */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-medium text-gray-900 mb-8 tracking-tight">User Balances</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userBalanceData.map((user) => (
              <motion.div
                key={user.id}
                className="p-6 rounded-2xl bg-gray-500/5 hover:bg-gray-500/10 cursor-pointer transition-colors"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate tracking-tight">
                      {user.username}
                    </h3>
                    <p className="text-sm text-gray-500 truncate tracking-wide">{user.email}</p>
                  </div>
                  {user.balance >= 0 ? (
                    <ArrowUpRight className="text-green-600 ml-4" size={20} />
                  ) : (
                    <ArrowDownRight className="text-red-600 ml-4" size={20} />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 tracking-wide">Balance</p>
                  <p className={`text-2xl font-medium tracking-tight ${
                    user.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    ₹{user.balance.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
            >
              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md m-4 border border-white/20"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-medium text-gray-900 tracking-tight">
                      {selectedUser.username}
                    </h2>
                    <p className="text-gray-500 mt-1 tracking-wide">{selectedUser.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 hover:bg-gray-500/10 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-500/5 rounded-2xl">
                    <p className="text-sm text-gray-500 tracking-wide">Balance</p>
                    <p className={`text-3xl font-medium tracking-tight ${
                      selectedUser.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      ₹{selectedUser.balance.toFixed(2)}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-500/5 rounded-2xl">
                    <p className="text-sm text-gray-500 tracking-wide">Total Expenses</p>
                    <p className="text-3xl font-medium text-gray-900 tracking-tight">
                      ₹{selectedUser.expenses.toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  className="mt-8 w-full bg-gray-900 text-white py-4 rounded-2xl font-medium tracking-wide hover:bg-gray-800 transition-colors"
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
