import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  ReceiptText,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Activity,
  Wallet,
  Clock,
  Calendar,
  PieChart,
  Share2,
  ChevronDown,
  Menu,
  Bell,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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

function SummaryTab({ currentUser }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [monthlyData, setMonthlyData] = useState({
    currentMonth: null,
    previousMonth: null,
    loading: true,
    error: null
  });
  const [trendData, setTrendData] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchMonthlyData = async () => {
    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const formatDate = (date) => date.toISOString().split('T')[0];

      const currentMonthResponse = await fetch(
        `/api/summary?start_date=${formatDate(currentMonthStart)}&end_date=${formatDate(currentMonthEnd)}`
      );
      const currentMonthData = await currentMonthResponse.json();

      const prevMonthResponse = await fetch(
        `/api/summary?start_date=${formatDate(prevMonthStart)}&end_date=${formatDate(prevMonthEnd)}`
      );
      const prevMonthData = await prevMonthResponse.json();

      // Generate trend data for the last 7 days
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: formatDate(date),
          amount: Math.random() * currentMonthData.total_expenses / 7 // Simulated data
        };
      }).reverse();

      setTrendData(last7Days);
      setMonthlyData({
        currentMonth: {
          ...currentMonthData,
          avg_per_member: currentMonthData.total_expenses / Object.keys(currentMonthData.user_expenses || {}).length,
          transaction_velocity: currentMonthData.transaction_count / 30,
          largest_transaction: Math.max(...Object.values(currentMonthData.user_expenses || {})),
          settlement_efficiency: calculateSettlementEfficiency(currentMonthData.user_balances)
        },
        previousMonth: prevMonthData,
        loading: false,
        error: null
      });
    } catch (err) {
      setMonthlyData(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const calculateSettlementEfficiency = (balances) => {
    if (!balances) return 0;
    const totalAbsBalance = Object.values(balances).reduce((sum, balance) => sum + Math.abs(balance), 0);
    const totalPositiveBalance = Object.values(balances).reduce((sum, balance) => sum + Math.max(0, balance), 0);
    return (totalPositiveBalance > 0) ? (totalAbsBalance / (2 * totalPositiveBalance)) : 1;
  };

  const calculateChange = (current, previous) => {
    if (!previous) return { percentage: 0, trend: 'neutral' };
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      trend: change >= 0 ? 'up' : 'down'
    };
  };

  const TrendIndicator = ({ current, previous, reverseColors = false }) => {
    const { percentage, trend } = calculateChange(current, previous);
    const isPositive = trend === 'up';
    const colorClass = reverseColors
      ? isPositive ? 'text-red-600' : 'text-green-600'
      : isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
    );
  };

  const getCurrentUserBalance = () => {
    if (!monthlyData.currentMonth?.user_balances || !currentUser?.id) return 0;
    return monthlyData.currentMonth.user_balances[currentUser.id] || 0;
  };

  if (monthlyData.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 p-4 md:p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  if (monthlyData.error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 p-4 md:p-8 flex items-center justify-center">
        <div className="text-red-600">Error: {monthlyData.error}</div>
      </div>
    );
  }

  const { currentMonth, previousMonth } = monthlyData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-gray-200/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                className="md:hidden p-2 rounded-md text-gray-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-medium text-gray-900 ml-2 md:ml-0">
                Finance Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} className="text-gray-600" />
              </button>
              <div className="hidden md:flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {currentUser?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 truncate max-w-[150px]">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-gray-900">
            Welcome back, {currentUser?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-500 mt-1">
            Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Personal Stats */}
        <GlassCard className="mb-8 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/50 rounded-2xl p-4">
              <p className="text-sm text-gray-500">Your Balance</p>
              <p className={`text-2xl font-medium ${getCurrentUserBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{Math.abs(getCurrentUserBalance()).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {getCurrentUserBalance() >= 0 ? 'You are owed' : 'You owe'}
              </p>
            </div>
            
            <div className="bg-white/50 rounded-2xl p-4">
              <p className="text-sm text-gray-500">Your Expenses</p>
              <p className="text-2xl font-medium text-gray-900">
                ₹{(currentMonth.user_expenses?.[currentUser?.id] || 0).toFixed(2)}
              </p>
              <TrendIndicator 
                current={currentMonth.user_expenses?.[currentUser?.id] || 0}
                previous={previousMonth.user_expenses?.[currentUser?.id] || 0}
                reverseColors
              />
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <p className="text-sm text-gray-500">Group Share</p>
              <p className="text-2xl font-medium text-gray-900">
                {((currentMonth.user_expenses?.[currentUser?.id] || 0) / currentMonth.total_expenses * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">of total expenses</p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <p className="text-sm text-gray-500">Settlement Status</p>
              <p className="text-2xl font-medium text-gray-900">
                {getCurrentUserBalance() === 0 ? 'Settled' : 'Pending'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {Object.keys(currentMonth.user_balances || {}).length} active members
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Expense Trend */}
        <GlassCard className="mb-8 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#6B7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366F1', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Group Balances */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Group Balances</h3>
          <div className="space-y-4">
            {Object.entries(currentMonth.user_balances || {}).map(([userId, balance]) => {
              const user = currentMonth.users?.find(u => u.id === userId);
              if (!user) return null;
              
              return (
                <div key={userId} className="bg-white/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.email?.split('@')[0]}</p>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{user.email}</p>
                      </div>
                    </div>
                    <div className={`text-lg font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {balance >= 0 ? '+' : '-'} ₹{Math.abs(balance).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 md:hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Menu</h3>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                  <Activity size={20} className="text-gray-600" />
                  <span className="text-gray-900">Dashboard</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                  <Wallet size={20} className="text-gray-600" />
                  <span className="text-gray-900">Expenses</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                  <Clock size={20} className="text-gray-600" />
                  <span className="text-gray-900">History</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                  <Users size={20} className="text-gray-600" />
                  <span className="text-gray-900">Members</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                  <Share2 size={20} className="text-gray-600" />
                  <span className="text-gray-900">Share</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {currentUser?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {currentUser?.email?.split('@')[0]}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {currentUser?.email}
                    </p>
                  </div>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronDown size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default SummaryTab;
