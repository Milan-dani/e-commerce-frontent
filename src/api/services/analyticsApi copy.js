import baseApi from "../baseApi";

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrdersAnalytics: builder.query({
      query: () => "/analytics/orders",
      providesTags: [{ type: "Analytics", id: "ORDERS" }],
    }),
    getRevenueAnalytics: builder.query({
      query: () => "/analytics/revenue",
      providesTags: [{ type: "Analytics", id: "REVENUE" }],
    }),
    getUsersAnalytics: builder.query({
      query: () => "/analytics/users",
      providesTags: [{ type: "Analytics", id: "USERS" }],
    }),
    getFunnel: builder.query({
      query: () => "/analytics/funnel",
      providesTags: [{ type: "Analytics", id: "FUNNEL" }],
    }),
    getSummary: builder.query({
      query: () => "/analytics/summary",
      providesTags: [{ type: "Analytics", id: "SUMMARY" }],
    }),
    getTrends: builder.query({
      query: () => "/analytics/trends",
      providesTags: [{ type: "Analytics", id: "TRENDS" }],
    }),
    getEvents: builder.query({
      query: ({ event, from, to, userId, limit = 100 } = {}) => {
        const params = new URLSearchParams();
        if (event) params.set("event", event);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        if (userId) params.set("userId", userId);
        params.set("limit", limit);
        return `/analytics/events?${params.toString()}`;
      },
      providesTags: [{ type: "Analytics", id: "EVENTS" }],
    }),

    // analytics 2 endpoint
     getAnalytics: builder.query({
      query: ({ startDate, endDate, eventType }) =>
        `/analytics?startDate=${startDate}&endDate=${endDate}&type=${eventType || ""}`,
      providesTags: ["Analytics"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersAnalyticsQuery,
  useGetRevenueAnalyticsQuery,
  useGetUsersAnalyticsQuery,
  useGetFunnelQuery,
  useGetSummaryQuery,
  useGetTrendsQuery,
  useGetEventsQuery,

  // analytics 2 hook
  useGetAnalyticsQuery,
} = analyticsApi;



// ///////////////////////////////
// import { baseApi } from "@/store/api/baseApi";

// export const analyticsApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getAnalytics: builder.query({
//       query: ({ startDate, endDate, eventType }) =>
//         `/analytics?startDate=${startDate}&endDate=${endDate}&type=${eventType || ""}`,
//       providesTags: ["Analytics"],
//     }),
//   }),
// });

// export const { useGetAnalyticsQuery } = analyticsApi;
