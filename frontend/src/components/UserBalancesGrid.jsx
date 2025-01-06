import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  ArrowUp,
  ArrowDown,
  Wallet
} from "lucide-react";

const getBalanceColor = (balance) => {
  if (balance > 0) return "text-green-600";
  if (balance < 0) return "text-red-600";
  return "text-blue-600";
};

const UserBalanceCard = ({ label, userBalance, userExpense, username, email }) => {
  const balanceColor = getBalanceColor(userBalance);
  const isPositive = userBalance > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gray-50/50 backdrop-blur-sm rounded-2xl hover:bg-gray-50/80 transition-colors"
    >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 backdrop-blur-sm rounded-xl ${ isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <Users className={balanceColor} size={20} />
            </div>
            <div>
	      <p className="text-sm text-gray-600">{email}</p>
              <h3 className="text-lg font-semibold text-gray-900">{username}</h3>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? 
              <ArrowUp size={14} /> : 
              <ArrowDown size={14} />
            }
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm text-gray-600">Balance</p>
          <p className={`text-2xl font-bold ${balanceColor}`}>
            ₹{userBalance.toFixed(2)}
          </p>
        </div>
        <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm text-gray-600">Expense</p>
          <p className={"text-xl font-bold text-black"}>
            ₹{userExpense.toFixed(2)}
          </p>
        </div>
    </motion.div>
  );
};

const UserBalancesGrid = ({ balances, expenses, users }) => {
    // Create a map of user details for quick lookup
    const userMap = Object.fromEntries(users.map(user => [user.id, user]));

    // Transform expenses into a consistent array of objects for easier handling
    const expenseMap = Object.fromEntries(
        Object.entries(expenses).map(([id, value]) => [id, value])
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(balances).map(([userId, balance]) => {
                const user = userMap[userId] || {}; // Fallback to empty object if user not found
                const expense = expenseMap[userId] || 0; // Default expense to 0 if not found

                return (
                    <UserBalanceCard
                        key={userId}
                        userBalance={balance}
                        userExpense={expense}
                        username={user.username || "Unknown"} // Default username
                        email={user.email || "deleteduser@email.com"} // Default email
                    />
                );
            })}
        </div>
    );
};

export default UserBalancesGrid;
