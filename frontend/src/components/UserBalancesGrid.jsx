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

const UserBalanceCard = ({ label, userBalance, username, email }) => {
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
        <div className="flex flex-col items-baseline gap-2">
              <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-3xl font-bold ${balanceColor}`}>
            ₹{userBalance.toFixed(2)}
          </p>
        </div>
    </motion.div>
  );
};

// Example usage in a grid
const UserBalancesGrid = ({ balances, users }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {Object.entries(balances).map(([userId, balance]) => {
        const user = users.find(u => u.id === userId);
        return (
          <UserBalanceCard
            key={userId}
            label="Balance"
            userBalance={balance}
            username={user?.username || 'Unknown'}
	    email={user?.email || 'deleteduser@email.com'}
          />
        );
      })}
    </div>
  );
};

export default UserBalancesGrid;
