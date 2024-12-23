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
    className={`backdrop-blur-xl bg-white/80 rounded-3xl border border-white/20 shadow-lg ${className}`}
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    {...props}
  >
    {children}
  </motion.div>
);

function SummaryTab() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [monthlyData, setMonthlyData] = useState({
    currentMonth: null,
    previousMonth: null,
    loading: true,
    error: null
  });
  const [trendData, setTrendData] = useState([]);

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
          transaction_velocity: currentMonthData.transaction_count / 30, // transactions per day
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

  const calculateSettlementEfficiency = (balances) => {
    if (!balances) return 0;
    const totalAbsBalance = Object.values(balances).reduce((sum, balance) => sum + Math.abs(balance), 0);
    const totalPositiveBalance = Object.values(balances).reduce((sum, balance) => sum + Math.max(0, balance), 0);
    return (totalPositiveBalance > 0) ? (totalAbsBalance / (2 * totalPositiveBalance)) : 1;
  };

  useEffect(() => {
    fetchMonthlyData();
  }, []);

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

  if (monthlyData.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  if (monthlyData.error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 p-8 flex items-center justify-center">
        <div className="text-red-600">Error: {monthlyData.error}</div>
      </div>
    );
  }

  const { currentMonth, previousMonth } = monthlyData;
  
  const COLORS = ['#007AFF', '#34C759', '#5856D6', '#FF2D55', '#FF9500'];

  const prepareTopSpendersData = (userExpenses, users) => {
    if (!userExpenses) return [];
    return Object.entries(userExpenses)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([userId, amount], index) => {
        const user = users?.find(u => u.id === userId);
        return {
          name: user?.username || `User ${index + 1}`,
          value: amount,
          email: user?.email
        };
      });
  };

  const CustomDonutLabel = ({ cx, cy, viewBox }) => {
    const total = monthlyData.currentMonth?.total_expenses || 0;
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
        <tspan x={cx} dy="-0.5em" className="text-xl font-medium fill-gray-900">
          ₹{total.toFixed(0)}
        </tspan>
        <tspan x={cx} dy="1.5em" className="text-sm fill-gray-500">
          Total Spent
        </tspan>
      </text>
    );
  };

  // ... [Previous fetch and calculation functions remain the same]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-gray-600">₹{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-gray-900 tracking-tight">
            Expenses Dashboard
          </h1>
          <p className="text-lg text-gray-500 mt-2 tracking-wide">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Wallet className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-2xl font-medium text-gray-900">
                  ₹{Object.values(currentMonth.user_balances || {})
                      .reduce((sum, balance) => sum + Math.max(0, balance), 0)
                      .toFixed(2)}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Transaction Velocity</p>
                <p className="text-2xl font-medium text-gray-900">
                  {currentMonth.transaction_velocity.toFixed(1)}/day
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Share2 className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Settlement Efficiency</p>
                <p className="text-2xl font-medium text-gray-900">
                  {(currentMonth.settlement_efficiency * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Users className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Per Member</p>
                <p className="text-2xl font-medium text-gray-900">
                  ₹{currentMonth.avg_per_member.toFixed(2)}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Expense Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          <GlassCard className="p-4 md:p-8">
            <h2 className="text-2xl font-medium text-gray-900 tracking-tight mb-6">Top Spenders</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsDonut>
                  <Pie
                    data={prepareTopSpendersData(monthlyData.currentMonth?.user_expenses, monthlyData.currentMonth?.users)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {prepareTopSpendersData(monthlyData.currentMonth?.user_expenses, monthlyData.currentMonth?.users)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsDonut>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {prepareTopSpendersData(monthlyData.currentMonth?.user_expenses, monthlyData.currentMonth?.users)
                .map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{entry.name}</span>
                        <span className="text-xs text-gray-500">{entry.email}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ₹{entry.value.toFixed(2)}
                    </span>
                  </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4 md:p-8">
            <h2 className="text-2xl font-medium text-gray-900 tracking-tight mb-6">Expense Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#007AFF"
                    strokeWidth={2}
                    dot={{ fill: '#007AFF', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#007AFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Monthly Overview */}
        <GlassCard className="mb-8 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-gray-900 tracking-tight">Monthly Overview</h2>
            <div className="px-4 py-2 bg-gray-500/5 rounded-2xl text-sm text-gray-500">
              vs Previous Month
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-500/5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500">Total Expenses</p>
                <TrendIndicator 
                  current={currentMonth.total_expenses} 
                  previous={previousMonth.total_expenses}
                  reverseColors
                />
              </div>
              <p className="text-3xl font-medium text-gray-900 tracking-tight">
                ₹{currentMonth.total_expenses.toFixed(2)}
              </p>
            </div>

            <div className="p-6 bg-gray-500/5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500">Largest Transaction</p>
                <TrendIndicator 
                  current={currentMonth.largest_transaction} 
                  previous={Math.max(...Object.values(previousMonth.user_expenses || {}))}
                  reverseColors
                />
              </div>
              <p className="text-3xl font-medium text-gray-900 tracking-tight">
                ₹{currentMonth.largest_transaction.toFixed(2)}
              </p>
            </div>

            <div className="p-6 bg-gray-500/5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500">Active Members</p>
                <TrendIndicator 
                  current={Object.keys(currentMonth.user_expenses || {}).length} 
                  previous={Object.keys(previousMonth.user_expenses || {}).length}
                />
              </div>
              <p className="text-3xl font-medium text-gray-900 tracking-tight">
                {Object.keys(currentMonth.user_expenses || {}).length}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Settlement Status */}        <GlassCard className="p-4 md:p-8 mb-8">
          <h2 className="text-2xl font-medium text-gray-900 tracking-tight mb-6">Settlement Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(monthlyData.currentMonth?.user_balances || {}).map(([userId, balance]) => {
              const user = monthlyData.currentMonth?.users?.find(u => u.id === userId);
              const isPositive = balance >= 0;
              
              return (
                <div key={userId} className="p-4 bg-gray-500/5 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-gray-900 font-medium">{user?.username || 'Unknown User'}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className={`text-xl font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+ ' : '- '}₹{Math.abs(balance).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>


	          {/* Category Trends */}
        <GlassCard className="mb-8 p-8">
          <h2 className="text-2xl font-medium text-gray-900 tracking-tight mb-6">Category Trends</h2>
          <div className="space-y-4">
            {Object.entries(currentMonth.category_expenses || {}).map(([category, amount]) => {
              const prevAmount = previousMonth.category_expenses?.[category] || 0;
              const { percentage, trend } = calculateChange(amount, prevAmount);

              return (
                <div key={category} className="p-4 bg-gray-500/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-900 font-medium capitalize">{category}</p>
                    <TrendIndicator current={amount} previous={prevAmount} reverseColors />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-medium text-gray-900 tracking-tight">
                      ₹{amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Previous: ₹{prevAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Top Spenders */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-medium text-gray-900 tracking-tight mb-6">Top Spenders</h2>
          <div className="space-y-4">
            {Object.entries(currentMonth.user_expenses || {})
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([userId, amount]) => {
                const prevAmount = previousMonth.user_expenses?.[userId] || 0;
                const user = currentMonth.users?.find(u => u.id === userId);

                return (
                  <div key={userId} className="p-4 bg-gray-500/5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-gray-900 font-medium">{user?.username || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <TrendIndicator current={amount} previous={prevAmount} reverseColors />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-2xl font-medium text-gray-900 tracking-tight">
                        ₹{amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Previous: ₹{prevAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default SummaryTab;

