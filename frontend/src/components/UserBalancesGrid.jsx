import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from "lucide-react";

const getBalanceColor = (balance) => {
  if (balance > 0) return "text-green-600";
  if (balance < 0) return "text-red-600";
  return "text-blue-600";
};

const UserBalanceCard = ({ label, userBalance, username }) => {
  const balanceColor = getBalanceColor(userBalance);
  const isPositive = userBalance > 0;

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      whileHover={{ scale: 1.005 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className={`bg-white px-6 pt-6 pb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl">
              <Users className={balanceColor} size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <h3 className="text-lg font-semibold text-gray-900">{username}</h3>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? 
              <ArrowUpRight size={14} /> : 
              <ArrowDownRight size={14} />
            }
            <Wallet size={14} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-bold ${balanceColor}`}>
            ₹{userBalance.toFixed(2)}
          </p>
        </div>
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
          />
        );
      })}
    </div>
  );
};

export default UserBalancesGrid;
