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

function SummaryTab() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [monthlyData, setMonthlyData] = useState({
    currentMonth: null,
    previousMonth: null,
    loading: true,
    error: null
  });

  const fetchMonthlyData = async () => {
    try {
      // Get current and previous month dates
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Format dates for API
      const formatDate = (date) => date.toISOString().split('T')[0];

      // Fetch current month data
      const currentMonthResponse = await fetch(
        `/api/summary?start_date=${formatDate(currentMonthStart)}&end_date=${formatDate(currentMonthEnd)}`
      );
      const currentMonthData = await currentMonthResponse.json();

      // Fetch previous month data
      const prevMonthResponse = await fetch(
        `/api/summary?start_date=${formatDate(prevMonthStart)}&end_date=${formatDate(prevMonthEnd)}`
      );
      const prevMonthData = await prevMonthResponse.json();

      setMonthlyData({
        currentMonth: currentMonthData,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-gray-900 tracking-tight">
            Expenses
          </h1>
          <p className="text-lg text-gray-500 mt-2 tracking-wide">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
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
                <p className="text-gray-500">Average Transaction</p>
                <TrendIndicator 
                  current={currentMonth.average_transaction} 
                  previous={previousMonth.average_transaction}
                />
              </div>
              <p className="text-3xl font-medium text-gray-900 tracking-tight">
                ₹{currentMonth.average_transaction}
              </p>
            </div>

            <div className="p-6 bg-gray-500/5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500">Transaction Count</p>
                <TrendIndicator 
                  current={currentMonth.transaction_count} 
                  previous={previousMonth.transaction_count}
                />
              </div>
              <p className="text-3xl font-medium text-gray-900 tracking-tight">
                {currentMonth.transaction_count}
              </p>
            </div>
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
