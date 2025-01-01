import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Activity,
  Share2,
  Users,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsDonut,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

// Styled components
const GlassCard = ({ children, className = "", ...props }) => (
  <motion.div
    className={`backdrop-blur-xl bg-white/90 rounded-3xl border border-white/20 shadow-lg ${className}`}
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    {...props}
  >
    {children}
  </motion.div>
);

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Stat = ({ label, value, icon: Icon, trend, trendValue }) => (
  <div className="p-6 rounded-2xl bg-white/50">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-blue-50 rounded-xl">
        <Icon className="text-blue-600" size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm font-medium">{trendValue}%</span>
        </div>
      )}
    </div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);

const MonthNavigator = ({ currentDate, onNavigate }) => {
  const isCurrentMonth = (date) => {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('prev')}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft className="text-gray-600" />
      </motion.button>
      <h2 className="text-2xl font-medium text-gray-900">
        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </h2>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('next')}
        disabled={isCurrentMonth(currentDate)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <ChevronRight className="text-gray-600" />
      </motion.button>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-screen">
    <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
    <h2 className="text-xl font-medium text-gray-900 mb-2">Something went wrong</h2>
    <p className="text-gray-500">{message}</p>
  </div>
);

function SummaryTab() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [summaryData, setSummaryData] = useState({
    current: null,
    previous: null,
    loading: true,
    error: null
  });

  const handleMonthNavigation = (direction) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (direction === 'next') {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const fetchMonthData = async (date) => {
    try {
      setSummaryData(prev => ({ ...prev, loading: true }));
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const prevMonthStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      const prevMonthEnd = new Date(date.getFullYear(), date.getMonth(), 0);

      const formatDate = (date) => date.toISOString().split('T')[0];

      const [currentResponse, previousResponse] = await Promise.all([
        fetch(`/api/summary?start_date=${formatDate(monthStart)}&end_date=${formatDate(monthEnd)}`),
        fetch(`/api/summary?start_date=${formatDate(prevMonthStart)}&end_date=${formatDate(prevMonthEnd)}`)
      ]);

      if (!currentResponse.ok || !previousResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [currentData, previousData] = await Promise.all([
        currentResponse.json(),
        previousResponse.json()
      ]);

      const processedData = {
        current: {
          ...currentData,
          avg_per_member: currentData.total_expenses / Object.keys(currentData.user_expenses || {}).length,
          transaction_velocity: currentData.transaction_count / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
          settlement_efficiency: calculateSettlementEfficiency(currentData.user_balances)
        },
        previous: previousData,
        loading: false,
        error: null
      };

      setSummaryData(processedData);
    } catch (err) {
      setSummaryData(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
    }
  };

  useEffect(() => {
    fetchMonthData(selectedDate);
  }, [selectedDate]);

  const calculateSettlementEfficiency = (balances) => {
    if (!balances) return 0;
    const totalAbsBalance = Object.values(balances).reduce((sum, balance) => sum + Math.abs(balance), 0);
    const totalPositiveBalance = Object.values(balances).reduce((sum, balance) => sum + Math.max(0, balance), 0);
    return (totalPositiveBalance > 0) ? (totalAbsBalance / (2 * totalPositiveBalance)) : 1;
  };

  const calculateTrend = (current, previous) => {
    if (!previous) return { trend: 'neutral', value: 0 };
    const change = ((current - previous) / previous) * 100;
    return {
      trend: change >= 0 ? 'up' : 'down',
      value: Math.abs(change).toFixed(1)
    };
  };

  if (summaryData.loading) {
    return <LoadingSpinner />;
  }

  if (summaryData.error) {
    return <ErrorState message={summaryData.error} />;
  }

  const { current, previous } = summaryData;
  const COLORS = ['#007AFF', '#34C759', '#5856D6', '#FF2D55', '#FF9500'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-semibold text-gray-900 tracking-tight mb-4">
            Financial Overview
          </h1>
          <MonthNavigator
            currentDate={selectedDate}
            onNavigate={handleMonthNavigation}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Stat
            label="Total Expenses"
            value={`₹${current.total_expenses.toFixed(2)}`}
            icon={Wallet}
            {...calculateTrend(current.total_expenses, previous.total_expenses)}
          />
          <Stat
            label="Active Members"
            value={Object.keys(current.user_expenses || {}).length}
            icon={Users}
            {...calculateTrend(
              Object.keys(current.user_expenses || {}).length,
              Object.keys(previous.user_expenses || {}).length
            )}
          />
          <Stat
            label="Transaction Velocity"
            value={`${current.transaction_velocity.toFixed(1)}/day`}
            icon={Activity}
            {...calculateTrend(current.transaction_velocity, previous.transaction_count / 30)}
          />
          <Stat
            label="Settlement Efficiency"
            value={`${(current.settlement_efficiency * 100).toFixed(1)}%`}
            icon={Share2}
            {...calculateTrend(current.settlement_efficiency, calculateSettlementEfficiency(previous.user_balances))}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlassCard className="p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Expense Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={current.daily_trends}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#007AFF"
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Top Spenders</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsDonut>
                  <Pie
                    data={Object.entries(current.user_expenses || {})
                      .map(([id, amount]) => ({
                        name: current.users?.find(u => u.id === id)?.username || 'Unknown',
                        value: amount
                      }))
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 5)}
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
                </RechartsDonut>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-6 mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Settlement Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(current.user_balances || {}).map(([userId, balance]) => {
              const user = current.users?.find(u => u.id === userId);
              const isPositive = balance >= 0;
              
              return (
                <div key={userId} className="p-4 bg-white/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{user?.username || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <Badge variant={isPositive ? 'success' : 'error'}>
                      {isPositive ? 'To Receive' : 'To Pay'}
                    </Badge>
                  </div>
                  <p className={`text-xl font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{Math.abs(balance).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Recent Transactions
</h3>
          <div className="space-y-4">
            {current.transactions?.slice(0, 5).map((transaction) => {
              const payer = current.users?.find(u => u.id === transaction.payer_id);
              const memberCount = transaction.members?.length || 0;
              const shareAmount = transaction.amount / memberCount;
              
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors"
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
                          Split among {memberCount} {memberCount === 1 ? 'person' : 'people'} 
                          (₹{shareAmount.toFixed(2)} each)
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-medium text-gray-900 mb-6">Monthly Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Average Transaction Size */}
              <div className="p-6 bg-white/50 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowUpRight className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-500">Average Transaction</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{(current.total_expenses / current.transaction_count).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {calculateTrend(
                    current.total_expenses / current.transaction_count,
                    previous.total_expenses / previous.transaction_count
                  ).value}% vs last month
                </p>
              </div>

              {/* Peak Day */}
              <div className="p-6 bg-white/50 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="text-blue-600" size={20} />
                  <span className="text-sm font-medium text-gray-500">Peak Transaction Day</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {current.daily_trends?.reduce((max, day) => 
                    day.count > (max?.count || 0) ? day : max
                  )?.date || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Highest activity day this month
                </p>
              </div>

              {/* Settlement Health */}
              <div className="p-6 bg-white/50 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Share2 className="text-purple-600" size={20} />
                  <span className="text-sm font-medium text-gray-500">Settlement Health</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {getSettlementHealth(current.settlement_efficiency)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Based on current balances
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              onClick={() => window.location.href = '/new-transaction'}
            >
              Add New Transaction
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              onClick={() => window.location.href = '/settlements'}
            >
              View All Settlements
            </motion.button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// Helper function to determine settlement health status
const getSettlementHealth = (efficiency) => {
  if (efficiency >= 0.9) return "Excellent";
  if (efficiency >= 0.7) return "Good";
  if (efficiency >= 0.5) return "Fair";
  return "Needs Attention";
};

export default SummaryTab;
