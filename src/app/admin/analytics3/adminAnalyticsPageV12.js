/* Admin Analytics Pages (two designs)

This file exports two ready-to-use React components you can drop into your Next.js app.
They use RTK Query hooks from `@/store/api/analyticsApi` (the analyticsApi we discussed).

- AdminAnalyticsPageV1  -> matches your *first* design (uses StatCard + ChartCard components)
- AdminAnalyticsPageV2  -> matches your *second* design (self-contained SummaryCard)

Assumptions:
- You have an RTK Query api at `@/store/api/analyticsApi` that exports the hooks used below.
- `StatCard` and `ChartCard` components exist in your codebase (first design).
- Tailwind CSS is configured in your project.
- Recharts and lucide-react are installed.

Drop this file in e.g. `src/app/admin/analytics/pages/admin-analytics-pages.jsx` and import the preferred component from it.
*/

"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DollarSign, Users, ShoppingCart, AlertTriangle, TrendingUp, Activity } from "lucide-react";

// hooks from your analytics RTK Query
import {
  useGetOrdersQuery,
  useGetOverviewQuery,
  useGetCustomersQuery,
  useGetConversionQuery,
  useGetSummaryQuery,
  useGetTimelineQuery,
  useGetEventsQuery,
} from "@/api/services/analyticsApi";

// If your project already has StatCard and ChartCard components (first design), keep using them.
// For portability, we provide a lightweight fallback StatCard / ChartCard if they are missing.

const COLORS = {
  blue: "#2563EB",
  green: "#10B981",
  orange: "#F59E0B",
  red: "#EF4444",
  gray: "#9CA3AF",
};

/* ------------------
   Lightweight fallbacks (only used if your project doesn't export these components)
   ------------------ */
export const FallbackStatCard = ({ title, value, sub, icon: Icon }) => (
  <div className="bg-white p-4 rounded-lg shadow flex flex-col">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm text-gray-600">{title}</div>
      {Icon ? <Icon className="w-5 h-5 text-gray-500" /> : null}
    </div>
    <div className="text-2xl font-semibold text-gray-900">{value}</div>
    {sub ? <div className="text-sm text-gray-500 mt-1">{sub}</div> : null}
  </div>
);

export const FallbackChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    {title && <div className="text-sm text-gray-700 font-medium">{title}</div>}
    {subtitle && <div className="text-xs text-gray-500 mb-3">{subtitle}</div>}
    <div>{children}</div>
  </div>
);

/* ---------------------------------------------------------------------
   AdminAnalyticsPageV1
   - Matches your first page.js design
   - Uses RTK hooks: orders, overview (revenue), customers, conversion, summary, timeline, events
   --------------------------------------------------------------------- */
export  function AdminAnalyticsPageV1({ StatCard, ChartCard }) {
  // allow injection of existing StatCard/ChartCard; fall back to provided ones
  const Stat = StatCard || FallbackStatCard;
  const Chart = ChartCard || FallbackChartCard;

  // RTK Query hooks
  const { data: ordersData, isLoading: loadingOrders } = useGetOrdersQuery();
  const { data: overviewData, isLoading: loadingOverview } = useGetOverviewQuery();
  const { data: usersData, isLoading: loadingUsers } = useGetCustomersQuery();
  const { data: funnelData, isLoading: loadingFunnel } = useGetConversionQuery();
  const { data: summaryData, isLoading: loadingSummary } = useGetSummaryQuery();
  const { data: trendsData, isLoading: loadingTrends } = useGetTimelineQuery();
  const { data: eventsData, isLoading: loadingEvents } = useGetEventsQuery({ limit: 100 });

  // Derived KPIs
  const kpi = {
    ordersCreated: ordersData?.summary?.created ?? ordersData?.created ?? 0,
    ordersPlaced: ordersData?.summary?.placed ?? ordersData?.placed ?? 0,
    totalRevenue: overviewData?.revenue ?? overviewData?.totalRevenue ?? 0,
    transactions: overviewData?.totalTransactions ?? 0,
    newUsers: usersData?.length ?? (overviewData?.users?.new ?? 0),
    activeLogins: usersData?.active_logins ?? 0,
    funnel: funnelData ?? { viewed: 0, addedToCart: 0, placed: 0, paid: 0, conversionRate: "0%" },
  };

  // Transform timeline/trends to chart series expected by Recharts
  const trendSeries = useMemo(() => {
    if (!trendsData || !Array.isArray(trendsData)) return [];
    // trendsData expected as [{ _id: { day, event }, count, totalRevenue }]
    const map = {};
    trendsData.forEach((r) => {
      const day = r._id?.day || r.day || r._id || "";
      if (!map[day]) map[day] = { day };
      const eventKey = r._id?.event || r.event || r._id?.event || null;
      if (r.count != null && eventKey) map[day][eventKey] = r.count;
      if (r.totalRevenue != null) map[day].revenue = (map[day].revenue || 0) + Number(r.totalRevenue || 0);
    });
    return Object.values(map).sort((a, b) => (a.day > b.day ? 1 : -1));
  }, [trendsData]);

  const summaryChartData = useMemo(() => {
    if (!summaryData || !Array.isArray(summaryData)) return [];
    return summaryData.map((s) => ({ event: s._id, count: s.count }));
  }, [summaryData]);

  const paymentCounts = useMemo(() => {
    const failed = summaryData?.find((s) => s._id === "payment.failed")?.count ?? 0;
    const success = summaryData?.find((s) => s._id === "payment.success")?.count ?? 0;
    return [ { name: "Success", value: success }, { name: "Failed", value: failed } ];
  }, [summaryData]);

  const failureReasons = useMemo(() => {
    if (!eventsData || !Array.isArray(eventsData)) return [];
    const reasons = {};
    eventsData.forEach((e) => {
      if (e.event === "payment.failed") {
        const reason = e.payload?.reason || "unknown";
        reasons[reason] = (reasons[reason] || 0) + 1;
      }
    });
    return Object.entries(reasons).map(([reason, count]) => ({ reason, count })).sort((a,b)=>b.count-a.count).slice(0,6);
  }, [eventsData]);

  const formatCurrency = (v) => {
    const n = typeof v === "string" ? parseFloat(v) || 0 : v || 0;
    return n.toLocaleString(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 2 });
  };

  const loading = loadingOrders || loadingOverview || loadingUsers || loadingFunnel || loadingSummary || loadingTrends || loadingEvents;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">Realtime operational and business metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard"><button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50">Back to Admin</button></Link>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Stat title="Total Revenue" value={formatCurrency(kpi.totalRevenue)} sub={`${kpi.transactions} transactions`} icon={DollarSign} />
          <Stat title="Orders Created" value={kpi.ordersCreated} sub={`Placed: ${kpi.ordersPlaced}`} icon={ShoppingCart} />
          <Stat title="New Users" value={kpi.newUsers} sub={`Active logins: ${kpi.activeLogins}`} icon={Users} />
          <Stat title="Conversion Rate" value={kpi.funnel.conversionRate ?? "0%"} sub={`${kpi.funnel.placed ?? 0} orders`} icon={AlertTriangle} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Chart title="Daily Trends" subtitle="Orders / Payments / Signups (per day)">
              <div className="h-64">
                {trendSeries.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendSeries}>
                      <XAxis dataKey="day" tick={{ fill: "#6B7280" }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="order.placed" name="Orders Placed" stroke={COLORS.blue} />
                      <Line type="monotone" dataKey="payment.success" name="Payments" stroke={COLORS.green} />
                      <Line type="monotone" dataKey="user.signup" name="User Signups" stroke={COLORS.orange} />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.gray} strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg"><p className="text-gray-500">No trend data available</p></div>
                )}
              </div>
            </Chart>
          </div>

          <Chart title="Payments: Success vs Failed" subtitle="Quick health check">
            <div className="h-64">
              {paymentCounts.reduce((s, p) => s + p.value, 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      <Cell fill={COLORS.green} />
                      <Cell fill={COLORS.red} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg"><p className="text-gray-500">No payment events yet</p></div>
              )}
            </div>
          </Chart>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Chart title="Event Summary" subtitle="Counts by event type">
              <div className="h-56">
                {summaryChartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summaryChartData}>
                      <XAxis dataKey="event" tick={{ fill: "#6B7280" }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Count" fill={COLORS.blue} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg"><p className="text-gray-500">No summary data</p></div>
                )}
              </div>
            </Chart>
          </div>

          <Chart title="Conversion Funnel" subtitle="Viewed → Cart → Orders">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1"><span>Viewed</span><span>{kpi.funnel.viewed ?? 0}</span></div>
                <div className="w-full bg-gray-100 rounded-full h-3"><div className="h-3 rounded-full" style={{ width: `${kpi.funnel.viewed ? 100 : 0}%`, background: "linear-gradient(90deg,#60a5fa,#2563eb)" }} /></div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1"><span>Added to Cart</span><span>{kpi.funnel.addedToCart ?? 0}</span></div>
                <div className="w-full bg-gray-100 rounded-full h-3"><div className="h-3 rounded-full" style={{ width: `${kpi.funnel.viewed ? Math.min(((kpi.funnel.addedToCart||0)/(kpi.funnel.viewed||1))*100,100) : 0}%`, background: "linear-gradient(90deg,#34d399,#10b981)" }} /></div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1"><span>Orders Placed</span><span>{kpi.funnel.placed ?? 0}</span></div>
                <div className="w-full bg-gray-100 rounded-full h-3"><div className="h-3 rounded-full" style={{ width: `${kpi.funnel.viewed ? Math.min(((kpi.funnel.placed||0)/(kpi.funnel.viewed||1))*100,100) : 0}%`, background: "linear-gradient(90deg,#fbbf24,#f59e0b)" }} /></div>
              </div>

              <p className="text-sm text-gray-500 mt-2">Conversion Rate: {kpi.funnel.conversionRate ?? "0%"}</p>
            </div>
          </Chart>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1">
            <Chart title="Top Payment Failure Reasons" subtitle="Quick triage">
              <div className="space-y-3">
                {failureReasons.length ? failureReasons.map((f) => (
                  <div key={f.reason} className="flex items-center justify-between"><div className="text-sm text-gray-700 truncate pr-4">{f.reason}</div><div className="text-sm text-gray-600 font-medium">{f.count}</div></div>
                )) : <p className="text-gray-500">No failures recorded</p>}
              </div>
            </Chart>
          </div>

          <div className="lg:col-span-2">
            <Chart title="Recent Events" subtitle="Last 100 events">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left"><thead><tr className="text-gray-600"><th className="px-3 py-2">Event</th><th className="px-3 py-2">Source</th><th className="px-3 py-2">Entity</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">Time</th></tr></thead>
                  <tbody>
                    {eventsData && eventsData.length ? eventsData.map((e) => {
                      const amount = e.payload?.amount ?? null;
                      const entity = e.payload?.orderId ?? e.payload?.userId ?? "-";
                      return (
                        <tr key={e._id} className="border-t"><td className="px-3 py-2 text-gray-800 font-medium">{e.event}</td><td className="px-3 py-2 text-gray-600">{e.source}</td><td className="px-3 py-2 text-gray-600 truncate max-w-[220px]">{entity}</td><td className="px-3 py-2 text-gray-700">{amount ? Number(amount).toLocaleString('en-US',{style:'currency',currency:'INR'}) : '-'}</td><td className="px-3 py-2 text-gray-500">{new Date(e.timestamp).toLocaleString()}</td></tr>
                      );
                    }) : (<tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">No events</td></tr>)}
                  </tbody>
                </table>
              </div>
            </Chart>
          </div>
        </div>

        {loading && <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"><div className="bg-white/80 p-6 rounded-lg shadow-lg"><p className="text-gray-700">Loading analytics…</p></div></div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   AdminAnalyticsPageV2
   - Matches your second page.js design (date-range + summary + charts)
   - Uses a single RTK hook useGetOverviewQuery to fetch generic analytics
   --------------------------------------------------------------------- */
export default function AdminAnalyticsPageV2() {
  const [eventType, setEventType] = React.useState("");
  const [dateRange, setDateRange] = React.useState([
    { startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), endDate: new Date(), key: "selection" },
  ]);

  const [queryParams, setQueryParams] = React.useState({ startDate: null, endDate: null, eventType: "" });

  // debounce minimal implementation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const s = dateRange[0].startDate.toISOString().slice(0, 10);
      const e = dateRange[0].endDate.toISOString().slice(0, 10);
      setQueryParams({ startDate: s, endDate: e, eventType });
    }, 300);
    return () => clearTimeout(timer);
  }, [dateRange, eventType]);

  const { data, isLoading } = useGetOverviewQuery(queryParams);

  const stats = data?.overview || data?.summary || {
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

  const pieData = data?.status || [ { name: "Completed", value: 68 }, { name: "Pending", value: 22 }, { name: "Failed", value: 10 } ];
  const COLORS = ["#2563EB", "#FACC15", "#EF4444"];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
            <p className="text-gray-600 mt-1">Insights and performance metrics</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white shadow-sm rounded-lg p-6 flex flex-col lg:flex-row gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select Date Range</h3>
            {/* user will have react-date-range in their project */}
            <div className="border rounded p-3">
              <div className="text-sm text-gray-700">{new Date(dateRange[0].startDate).toLocaleDateString()} - {new Date(dateRange[0].endDate).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Event Type</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500" value={eventType} onChange={(e)=>setEventType(e.target.value)}>
              <option value="">All Events</option>
              <option value="orders">Orders</option>
              <option value="payments">Payments</option>
              <option value="customers">Customers</option>
            </select>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <SummaryCard icon={DollarSign} title="Revenue" value={`$${Number(stats.revenue).toLocaleString()}`} color="text-green-600" />
          <SummaryCard icon={ShoppingCart} title="Orders" value={Number(stats.orders).toLocaleString()} color="text-blue-600" />
          <SummaryCard icon={Users} title="Customers" value={Number(stats.customers).toLocaleString()} color="text-purple-600" />
          <SummaryCard icon={TrendingUp} title="Conversion" value={`${stats.conversionRate}%`} color="text-orange-600" />
          <SummaryCard icon={Activity} title="Avg Order" value={`$${Number(stats.avgOrder).toFixed(2)}`} color="text-yellow-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Orders Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#2563EB" radius={[6,6,0,0]} />
                <Bar dataKey="orders" fill="#9333EA" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Status</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
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

// Small SummaryCard used by V2
const SummaryCard = ({ icon: Icon, title, value, color }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-lg shadow-sm flex flex-col">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {Icon ? <Icon className={`w-6 h-6 ${color}`} /> : null}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </motion.div>
);
