"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, type Item } from "@/lib/supabase";

const CATEGORIES = ["all", "IT", "maker_space", "discard"];
const STATUSES = ["all", "returned", "missing", "consumed", "checked_out"];

const STATUS_COLORS: Record<string, string> = {
  returned: "bg-green-100 text-green-800",
  missing: "bg-red-100 text-red-800",
  consumed: "bg-gray-100 text-gray-700",
  checked_out: "bg-yellow-100 text-yellow-800",
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from("items")
      .select("*")
      .order("asset_name", { ascending: true });

    if (categoryFilter !== "all") query = query.eq("category", categoryFilter);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError("Failed to load items. Please check your connection and try again.");
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const { error: updateError } = await supabase
      .from("items")
      .update({ status: newStatus })
      .eq("id", id);

    if (updateError) {
      alert("Failed to update status. Please try again.");
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    }
    setUpdatingId(null);
  };

  const filteredCount = items.length;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          GIX Equipment Returns
        </h1>
        <p className="text-gray-500 mt-1">
          Track and update equipment return status for end-of-semester checkout.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : s}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchItems}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors"
        >
          Refresh
        </button>

        {!loading && (
          <span className="text-sm text-gray-500 self-center ml-auto">
            {filteredCount} item{filteredCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm">Loading equipment...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium">No items found</p>
          <p className="text-sm mt-1">Try adjusting the filters above.</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && items.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Asset Name", "Asset Tag", "Category", "Team", "Status"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 min-w-[180px]">
                      {item.asset_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono whitespace-nowrap">
                      {item.asset_tag ?? (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {item.category ?? (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {item.team_name ?? (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.status && (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_COLORS[item.status] ??
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                        <select
                          value={item.status ?? ""}
                          onChange={(e) => updateStatus(item.id, e.target.value)}
                          disabled={updatingId === item.id}
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait"
                        >
                          <option value="" disabled>
                            Change…
                          </option>
                          {["returned", "missing", "consumed", "checked_out"].map(
                            (s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            )
                          )}
                        </select>
                        {updatingId === item.id && (
                          <svg
                            className="animate-spin w-4 h-4 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
