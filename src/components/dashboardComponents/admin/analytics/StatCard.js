import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  positive = true,
  color,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && (
            <p
              className={`text-sm mt-2 ${
                positive ? "text-green-600" : "text-red-600"
              } flex items-center`}
            >
              {positive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {sub}
            </p>
          )}
        </div>
        {Icon && (
          <Icon className={`w-8 h-8 ${color ? color : "text-gray-400"}`} />
        )}
      </div>
    </motion.div>
  );
}

// ecxepted usage example:

{
  /* <StatCard
  title={"Total Orders"}
  value={userAnalyticsData?.totalOrders || 0}
  icon={Package}
  color={"text-gray-900"}
/> */
}

{/* <StatCard
  title={"Total Revenue"}
  value={`$ ${overviewData?.revenue || 0}`}
  icon={DollarSign}
  color={"text-green-600"}
  sub={10}
  positive
/> */}
