"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { DateRange } from "react-date-range";
import { addDays, format } from "date-fns";
import { debounce } from "lodash";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Users, ShoppingCart, DollarSign, Activity } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Button from "@/components/Button";
import { useGetAnalyticsQuery } from "@/api/services/analyticsApi copy";

const eventOptions = [
  { label: "All Events", value: "" },
  { label: "Orders", value: "orders" },
  { label: "Payments", value: "payments" },
  { label: "Customers", value: "customers" },
];

export default function AdminAnalyticsPage() {
  const [eventType, setEventType] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: addDays(new Date(), -7),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [queryParams, setQueryParams] = useState({
    startDate: format(addDays(new Date(), -7), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    eventType: "",
  });

  // Debounced query update
  const updateQuery = useMemo(
    () =>
      debounce((range, type) => {
        setQueryParams({
          startDate: format(range[0].startDate, "yyyy-MM-dd"),
          endDate: format(range[0].endDate, "yyyy-MM-dd"),
          eventType: type,
        });
      }, 500),
    []
  );

  useEffect(() => {
    updateQuery(dateRange, eventType);
  }, [dateRange, eventType, updateQuery]);

  const { data, isLoading } = useGetAnalyticsQuery(queryParams);

  const stats = data?.summary || {
    revenue: 12450.75,
    orders: 842,
    customers: 394,
    avgOrder: 48.3,
    conversionRate: 5.7,
  };

  const chartData = data?.chart || [
    { date: "Mon", revenue: 1200, orders: 20 },
    { date: "Tue", revenue: 2100, orders: 25 },
    { date: "Wed", revenue: 1800, orders: 22 },
    { date: "Thu", revenue: 2400, orders: 27 },
    { date: "Fri", revenue: 2000, orders: 24 },
    { date: "Sat", revenue: 2500, orders: 29 },
    { date: "Sun", revenue: 1700, orders: 18 },
  ];

  const pieData = [
    { name: "Completed", value: 68 },
    { name: "Pending", value: 22 },
    { name: "Failed", value: 10 },
  ];
  const COLORS = ["#2563EB", "#FACC15", "#EF4444"];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
            <p className="text-gray-600 mt-1">Insights and performance metrics</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white shadow-sm rounded-lg p-6 flex flex-col lg:flex-row gap-6"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select Date Range</h3>
            <DateRange
              editableDateInputs
              onChange={(item) => setDateRange([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              rangeColors={["#2563EB"]}
            />
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Event Type
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              {eventOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <SummaryCard
            icon={DollarSign}
            title="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            color="text-green-600"
          />
          <SummaryCard
            icon={ShoppingCart}
            title="Orders"
            value={stats.orders.toLocaleString()}
            color="text-blue-600"
          />
          <SummaryCard
            icon={Users}
            title="Customers"
            value={stats.customers.toLocaleString()}
            color="text-purple-600"
          />
          <SummaryCard
            icon={TrendingUp}
            title="Conversion"
            value={`${stats.conversionRate}%`}
            color="text-orange-600"
          />
          <SummaryCard
            icon={Activity}
            title="Avg Order"
            value={`$${stats.avgOrder}`}
            color="text-yellow-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue & Orders Trend
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="orders" fill="#9333EA" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Status</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


// 🔹 Summary Card Component
const SummaryCard = ({ icon: Icon, title, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white p-6 rounded-lg shadow-sm flex flex-col"
  >
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </motion.div>
);
