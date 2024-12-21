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

const Card = ({ children, className = "", ...props }) => (
  <motion.div
    className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 ${className}`}
    whileHover={{ y: -4 }}
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-2xl mb-4">
            <CircleDollarSign className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Expense Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, <span className="text-indigo-600 font-medium">{currentUser.email}</span>
          </p>
        </div>

        {/* User Summary */}
        {currentUserData && (
          <Card className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Your Financial Summary</h2>
                <p className="text-indigo-100">Track your expenses and balances</p>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-indigo-200 text-sm">Balance</p>
                  <p className="text-3xl font-bold">
                    ₹{currentUserData.balance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-indigo-200 text-sm">Total Expenses</p>
                  <p className="text-3xl font-bold">
                    ₹{currentUserData.expenses.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ReceiptText className="text-indigo-600" size={24} />
              </div>
              <span className="text-indigo-600 text-sm font-medium">Total</span>
            </div>
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ₹{totalExpenses.toFixed(2)}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <span className="text-green-600 text-sm font-medium">Highest</span>
            </div>
            <p className="text-sm text-gray-600">{highestExpenseUser.username}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ₹{highestExpenseUser.expenses.toFixed(2)}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CircleDollarSign className="text-purple-600" size={24} />
              </div>
              <span className="text-purple-600 text-sm font-medium">Balance</span>
            </div>
            <p className="text-sm text-gray-600">Total Balance</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ₹{totalBalance.toFixed(2)}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <span className="text-blue-600 text-sm font-medium">Users</span>
            </div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
          </Card>
        </div>

        {/* User List */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">User Balances</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userBalanceData.map((user) => (
              <motion.div
                key={user.id}
                className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {user.username}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  {user.balance >= 0 ? (
                    <ArrowUpRight className="text-green-500 ml-4" size={20} />
                  ) : (
                    <ArrowDownRight className="text-red-500 ml-4" size={20} />
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className={`text-xl font-bold ${
                    user.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    ₹{user.balance.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
            >
              <motion.div
                className="bg-white rounded-2xl p-8 w-full max-w-md m-4"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedUser.username}
                    </h2>
                    <p className="text-gray-600 mt-1">{selectedUser.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Balance</p>
                    <p className={`text-2xl font-bold ${
                      selectedUser.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      ₹{selectedUser.balance.toFixed(2)}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{selectedUser.expenses.toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  className="mt-8 w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
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
