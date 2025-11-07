import baseApi from "../baseApi";

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // --- Dashboard Overview ---
    getOverview: builder.query({
      query: () => `/analytics/overview`,
      providesTags: ["Overview"],
    }),

    // --- Summary Cards ---
    getSummary: builder.query({
      query: ({ from, to }) => `/analytics/summary?from=${from}&to=${to}`,
      providesTags: ["Analytics"],
    }),

    // --- Conversion Funnel ---
    getConversion: builder.query({
      query: ({ from, to }) => `/analytics/conversion?from=${from}&to=${to}`,
      providesTags: ["Conversion"],
    }),

    // --- Product Analytics ---
    getProducts: builder.query({
      query: ({ from, to }) => `/analytics/products?from=${from}&to=${to}`,
      providesTags: ["Products"],
    }),

    // --- Customer Analytics ---
    getCustomers: builder.query({
      query: ({ from, to }) => `/analytics/customers?from=${from}&to=${to}`,
      providesTags: ["Customers"],
    }),

    // --- Orders Analytics ---
    getOrders: builder.query({
      query: ({ from, to }) => `/analytics/orders?from=${from}&to=${to}`,
      providesTags: ["Orders"],
    }),

    // --- Timeline Data ---
    getTimeline: builder.query({
      query: ({ from, to }) => `/analytics/timeline?from=${from}&to=${to}`,
      providesTags: ["Analytics"],
    }),

    // --- User-Specific Analytics ---
    // getUserAnalytics: builder.query({
    //   query: ({ userId }) => `/analytics/user/${userId}`,
    //   providesTags: ["Analytics"],
    // }),
      getUserAnalytics: builder.query({
      query: () => `/analytics/user/`,
      providesTags: ["Analytics"],
    }),

    // --- Events ---
    getEvents: builder.query({
      query: ({ from, to, page = 1, limit = 10 }) =>
        `/analytics/events?from=${from}&to=${to}&page=${page}&limit=${limit}`,
      providesTags: ["Events"],
    }),

    // --- Log New Event (for debug/testing) ---
    createEvent: builder.mutation({
      query: (body) => ({
        url: `/analytics/events`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Events"],
    }),
  }),
});

export const {
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
} = analyticsApi;
