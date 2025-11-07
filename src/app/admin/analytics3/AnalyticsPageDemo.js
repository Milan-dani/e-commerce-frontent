"use client";
import React from "react";
import { useGetConversionQuery, useGetSummaryQuery } from "@/api/services/analyticsApi";

export default function AnalyticsPageDemo() {
  const { data: summary, isLoading: loadingSummary } = useGetSummaryQuery({
    from: "2025-11-01",
    to: "2025-11-04",
  });

  const { data: conversion, isLoading: loadingConversion } = useGetConversionQuery({
    from: "2025-11-01",
    to: "2025-11-04",
  });

  if (loadingSummary || loadingConversion) return <p>Loading analytics...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📈 Analytics Dashboard</h1>

      <section className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="font-semibold mb-2">Summary</h2>
          <pre className="text-sm text-gray-600">
            {JSON.stringify(summary, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="font-semibold mb-2">Conversion Funnel</h2>
          <pre className="text-sm text-gray-600">
            {JSON.stringify(conversion, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}
