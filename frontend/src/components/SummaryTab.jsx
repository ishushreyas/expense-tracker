import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Wallet,
  Share2,
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
} from "recharts";

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
  const [monthlyData, setMonthlyData] = useState({
    currentMonth: null,
    previousMonth: null,
    loading: true,
    error: null,
  });
  const [trendData, setTrendData] = useState([]);

  const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"];

  const fetchMonthlyData = async () => {
    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const formatDate = (date) => date.toISOString().split("T")[0];

      const currentMonthResponse = await fetch(
        `/api/summary?start_date=${formatDate(currentMonthStart)}&end_date=${formatDate(currentMonthEnd)}`
      );
      const currentMonthData = await currentMonthResponse.json();

      const prevMonthResponse = await fetch(
        `/api/summary?start_date=${formatDate(prevMonthStart)}&end_date=${formatDate(prevMonthEnd)}`
      );
      const prevMonthData = await prevMonthResponse.json();

      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: formatDate(date),
          amount:
            Math.random() * currentMonthData.total_expenses / 7, // Simulated data
        };
      }).reverse();

      setTrendData(last7Days);
      setMonthlyData({
        currentMonth: currentMonthData,
        previousMonth: prevMonthData,
        loading: false,
        error: null,
      });
    } catch (err) {
      setMonthlyData((prev) => ({
        ...prev,
        loading: false,
        error: err.message,
      }));
    }
  };

  const prepareSettlementData = (userBalances) => {
    if (!userBalances) return [];
    return Object.entries(userBalances)
      .filter(([_, balance]) => balance > 0)
      .map(([userId, balance], index) => ({
        name: `User ${index + 1}`,
        value: balance,
      }));
  };

  const CustomDonutLabel = ({ cx, cy }) => {
    const total = monthlyData.currentMonth?.total_expenses || 0;
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
        <tspan x={cx} dy="-0.5em" className="text-xl font-medium fill-gray-900">
          ₹{total.toFixed(0)}
        </tspan>
        <tspan x={cx} dy="1.5em" className="text-sm fill-gray-500">
          Total
        </tspan>
      </text>
    );
  };

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  if (monthlyData.loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  if (monthlyData.error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">Error: {monthlyData.error}</div>
      </div>
    );
  }

  const { currentMonth, previousMonth } = monthlyData;
  const settlementData = prepareSettlementData(currentMonth?.user_balances);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-gray-900">Expenses Dashboard</h1>
          <p className="text-lg text-gray-500 mt-2">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Wallet className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-2xl font-medium text-gray-900">
                  ₹
                  {Object.values(currentMonth.user_balances || {})
                    .reduce((sum, balance) => sum + Math.max(0, balance), 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="mb-8 p-8">
          <h2 className="text-2xl font-medium text-gray-900 mb-6">Expense Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#6366f1" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="mb-8 p-8">
          <h2 className="text-2xl font-medium text-gray-900 mb-6">Settlement Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsDonut>
              <Pie
                data={settlementData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                label={<CustomDonutLabel />}
                dataKey="value"
              >
                {settlementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </RechartsDonut>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}

export default SummaryTab;
