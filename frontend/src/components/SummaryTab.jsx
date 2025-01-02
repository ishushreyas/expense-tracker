import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Activity,
  Share2,
  Users,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowUpRight,
  Settings,
  Loader
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import UserBalancesGrid from './UserBalancesGrid'

// Function to fetch data from the API based on the date range
const fetchData = async (startDate, endDate) => {
  const response = await fetch(`/api/summary?start_date=${startDate}&end_date=${endDate}`);
  return response.json();
};

const AppleCard = ({ children, className = "" }) => (
  <motion.div
    className={`bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/20 shadow-sm ${className}`}
    whileHover={{ scale: 1.005 }}
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
  >
    {children}
  </motion.div>
);

const StatCard = ({ label, value, icon: Icon, trend, trendValue }) => (
  <AppleCard className="p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gray-100 rounded-2xl">
            <Icon className="text-gray-700" size={20} />
          </div>
          {trend && (
            <span className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
              {trendValue}%
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </AppleCard>
);

const MonthPicker = ({ currentDate, onNavigate }) => (
  <div className="flex items-center justify-center gap-4 mb-8">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onNavigate('prev')}
      className="p-2 rounded-full hover:bg-gray-100/50 transition-colors"
    >
      <ChevronLeft className="text-gray-600" size={20} />
    </motion.button>
    <h2 className="text-xl font-medium text-gray-900">
      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
    </h2>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onNavigate('next')}
      className="p-2 rounded-full hover:bg-gray-100/50 transition-colors"
    >
      <ChevronRight className="text-gray-600" size={20} />
    </motion.button>
  </div>
);

const TransactionItem = ({ transaction, users }) => {
  const payer = users?.find(u => u.id === transaction.payer_id);
  const memberCount = transaction.members?.length || 0;
  const shareAmount = transaction.amount / memberCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50/80 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{payer?.username || 'Unknown'}</span>
            <span className="text-sm text-gray-500">paid</span>
            <span className="font-medium text-gray-900">₹{transaction.amount.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-500">{transaction.remark}</p>
          <div className="mt-2 flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              Split among {memberCount} • ₹{shareAmount.toFixed(2)} each
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(transaction.created_at).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
};

function SummaryTab({ users, transactions }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [summaryData, setSummaryData] = useState({
    active_users: 0,
    average_transaction: 0,
    total_expenses: 0,
    transaction_count: 0,
    user_balances: {},
    user_expenses: {},
    users: [],
    daily_trends: [],
    largest_transaction: 0,
    category_expenses: {},
    loading: true,
    error: null
  });

  const handleMonthNavigation = (direction) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  useEffect(() => {
    const startDate = selectedDate.toISOString().split('T')[0];
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).toISOString().split('T')[0];

    fetchData(startDate, endDate)
      .then(data => {
        setSummaryData({ ...data, loading: false });
      })
      .catch(error => {
        setSummaryData(prev => ({ ...prev, error, loading: false }));
      });
  }, [selectedDate]);

  if (summaryData.loading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-10">
        <Loader className="animate-spin h-16 w-16 text-gray-500" />
      </div>
    );
  }

  const COLORS = ['#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#34C759'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-4xl font-semibold text-gray-900">
            Financial Overview
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full hover:bg-gray-100/50"
          >
            <Settings size={20} className="text-gray-600" />
          </motion.button>
        </div>

        <MonthPicker
          currentDate={selectedDate}
          onNavigate={handleMonthNavigation}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Expenses"
            value={`₹${summaryData.total_expenses.toFixed(2)}`}
            icon={Wallet}
            trend="up"
            trendValue="12.5"
          />
          <StatCard
            label="Active Members"
            value={summaryData.active_users}
            icon={Users}
            trend="up"
            trendValue="25"
          />
          <StatCard
            label="Average Transaction"
            value={`₹${summaryData.average_transaction.toFixed(2)}`}
            icon={Activity}
            trend="down"
            trendValue="8.3"
          />
          <StatCard
            label="Largest Transaction"
            value={`₹${summaryData.largest_transaction}`}
            icon={Share2}
            trend="up"
            trendValue="5.2"
          />
        </div>

        <UserBalancesGrid
                balances={summaryData.user_balances}
                users={users}
              />
        </div>
        
        <AppleCard className="p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-6">User Expenses</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(summaryData.user_expenses).map(([userId, balance]) => ({
                      name: summaryData.users.find(user => user.id === userId)?.username || 'Unknown',
                      value: balance
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </AppleCard>

        <AppleCard className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="space-y-4">
            {[...Array(summaryData.transaction_count)].map((_, i) => (
              <TransactionItem
                key={i}
                transaction={transactions[i]}
                users={summaryData.users}
              />
            ))}
          </div>
        </AppleCard>
    </div>
  );
}

export default SummaryTab;
