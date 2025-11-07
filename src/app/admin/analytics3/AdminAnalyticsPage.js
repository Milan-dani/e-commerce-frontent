// AdminAnalyticsPage.jsx
// Fully integrated admin analytics dashboard with RTK Query, Recharts, and Tailwind

"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { DateRange } from "react-date-range";
import { addDays, format } from "date-fns";
import { debounce } from "lodash";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Label,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  useGetOverviewQuery,
  useGetSummaryQuery,
  useGetConversionQuery,
  useGetProductsQuery,
  useGetCustomersQuery,
  useGetOrdersQuery,
  useGetTimelineQuery,
  useGetUserAnalyticsQuery,
  useGetEventsQuery,
  useCreateEventMutation,
} from "@/api/services/analyticsApi";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { objectToArray } from "@/utils/utilityFunctions";

export function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState([
    {
      // startDate: addDays(new Date(), -7),
      startDate: addDays(new Date(), -70),
      // endDate: new Date(),
      endDate: addDays(new Date(), +7),
      key: "selection",
    },
  ]);

  const [query, setQuery] = useState({
    from: format(addDays(new Date(), -7), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });
  // const [query, setQuery] = useState({
  //   from: format(addDays(new Date(), -70), "yyyy-MM-dd"),
  //   to: format(addDays(new Date(), +7), "yyyy-MM-dd"),
  // });

  const updateQuery = useMemo(
    () =>
      debounce((range) => {
        setQuery({
          from: format(range[0].startDate, "yyyy-MM-dd"),
          to: format(range[0].endDate, "yyyy-MM-dd"),
        });
      }, 400),
    []
  );

  useEffect(() => {
    updateQuery(dateRange);
  }, [dateRange, updateQuery]);

  const { data: summaryData } = useGetSummaryQuery(query);
  const { data: overviewData } = useGetOverviewQuery();
  const { data: conversionData } = useGetConversionQuery(query);
  const { data: ordersData } = useGetOrdersQuery(query);
  const { data: productsData } = useGetProductsQuery(query);
  const { data: customersData } = useGetCustomersQuery(query);
  const { data: eventsData } = useGetEventsQuery({
    ...query,
    page: 1,
    limit: 10,
  });

  const stats = summaryData ||
    overviewData || {
      revenue: 14560,
      orders: 834,
      customers: 421,
      avgOrder: 45.6,
      conversionRate: 6.2,
    };

  const funnel = conversionData?.funnel;

  // const conversion = funnel && Object.values(funnel).some(v => v > 0) //checks if all the values are zero to decide whether to use real data or fallback defaults
  const conversion = funnel
    ? [
        { stage: "Viewed", value: funnel.viewed },
        { stage: "Added to Cart", value: funnel.addedToCart },
        { stage: "Placed", value: funnel.ordered },
        { stage: "Paid", value: funnel.paid },
      ]
    : [
        { stage: "Viewed", value: 1000 },
        { stage: "Added to Cart", value: 400 },
        { stage: "Placed", value: 250 },
        { stage: "Paid", value: 230 },
      ];

  // const conversion = conversionData?.funnel || [
  //   { stage: "Viewed", value: 1000 },
  //   { stage: "Added to Cart", value: 400 },
  //   { stage: "Placed", value: 250 },
  //   { stage: "Paid", value: 230 },
  // ];
  // const conversion = [
  //   { stage: "Viewed", value: 1000 },
  //   { stage: "Added to Cart", value: 400 },
  //   { stage: "Placed", value: 250 },
  //   { stage: "Paid", value: 230 },
  // ];

  const orderSummary = objectToArray(
    ordersData?.summary,
    "name",
    "value",
    true
  ) || [
    { name: "Completed", value: 68 },
    { name: "Pending", value: 22 },
    { name: "Failed", value: 10 },
  ];

  const COLORS = ["#2563EB", "#9333EA", "#FACC15", "#EF4444"];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">Business performance and insights</p>
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
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Select Date Range
            </h3>
            <DateRange
              editableDateInputs
              onChange={(item) => setDateRange([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              rangeColors={["#2563EB"]}
            />
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* <StatCard icon={DollarSign} title="Revenue" value={`$${stats.revenue}`} color="text-green-600" /> */}
          {/* <StatCard icon={ShoppingCart} title="Orders" value={stats.orders} color="text-blue-600" /> */}
          {/* <StatCard icon={Users} title="Customers" value={stats.customers} color="text-purple-600" /> */}
          {/* <StatCard icon={TrendingUp} title="Conversion" value={`${stats.conversionRate}%`} color="text-orange-600" /> */}
          {/* <StatCard icon={Activity} title="Avg Order" value={`$${stats.avgOrder}`} color="text-yellow-500" /> */}
        </div>

        {/* Conversion Funnel */}
        <motion.div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Conversion Funnel
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversion}>
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Orders & Events Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Orders Summary">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  // data={ordersData?.summary || [
                  //   { name: "Completed", value: 68 },
                  //   { name: "Pending", value: 22 },
                  //   { name: "Failed", value: 10 },
                  // ]}
                  data={orderSummary}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  <Label
                    value={`Total: ${ordersData?.totalOrders || 0}`}
                    position="center"
                    // fill="#333"
                    className="text-xl font-bold text-gray-800 pointer-events-none"
                    // style={{ fontSize: "14px", fontWeight: "600" }}
                  />

                  {COLORS.map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Recent Events">
            <ul className="space-y-2">
              {eventsData?.events?.map((e) => (
                <li
                  key={e.id}
                  className="flex justify-between text-sm text-gray-700"
                >
                  <span>{e.type}</span>
                  <span>{format(new Date(e.createdAt), "MMM d, yyyy")}</span>
                </li>
              )) || <p className="text-gray-500 text-sm">No recent events</p>}
            </ul>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

// --- UI Components ---

const StatCard = ({ icon: Icon, title, value, color }) => (
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

const ChartCard = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white p-6 rounded-lg shadow-sm"
  >
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </motion.div>
);
