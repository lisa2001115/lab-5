"use client";

import { useEffect, useState, useCallback } from "react";
import type React from "react";
import { supabase, type Event } from "@/lib/supabase";

const CATEGORIES = ["All", "guest_lecture", "workshop", "career"];

const CATEGORY_BADGE_STYLES: Record<string, React.CSSProperties> = {
  guest_lecture: { backgroundColor: "#e8e4f0", color: "#39275B" },
  workshop:      { backgroundColor: "#d6d0e8", color: "#39275B" },
  career:        { backgroundColor: "#c8c0df", color: "#39275B" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Date TBD";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isValidEvent(event: Event): boolean {
  return typeof event.title === "string" && event.title.trim().length > 0;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("All");
  const [skippedCount, setSkippedCount] = useState(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSkippedCount(0);

    let query = supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (category !== "All") query = query.eq("category", category);

    const { data, error: fetchError } = await query;

    // Error scenario 1: Supabase fetch fails
    if (fetchError) {
      setError("Could not load events. Please check your connection and try again.");
      setLoading(false);
      return;
    }

    // Assert statements for Component D / E validation
    console.assert(Array.isArray(data), "Events response should be an array");
    console.assert(data?.[0]?.title !== undefined, "Each event should have a title");

    // Error scenario 3: skip cards missing required fields
    const valid = (data ?? []).filter(isValidEvent);
    const skipped = (data ?? []).length - valid.length;
    setSkippedCount(skipped);
    setEvents(valid);
    setLoading(false);
    // Error scenario 2: no events found → handled in render (empty state)
  }, [category]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const GIX_PURPLE = "#39275B";

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: GIX_PURPLE }}>
          GIX Events
        </h1>
        <p className="mt-1" style={{ color: "#6b5f7a" }}>
          Guest lectures, workshops, and career panels happening at GIX.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
            style={
              category === c
                ? { backgroundColor: GIX_PURPLE, color: "#fff", borderColor: GIX_PURPLE }
                : { backgroundColor: "#fff", color: GIX_PURPLE, borderColor: GIX_PURPLE }
            }
          >
            {c === "All" ? "All Categories" : c.replace("_", " ")}
          </button>
        ))}
        <button
          onClick={fetchEvents}
          className="ml-auto px-3 py-1.5 text-sm rounded-full border transition-colors"
          style={{ backgroundColor: "#fff", color: GIX_PURPLE, borderColor: GIX_PURPLE }}
        >
          Refresh
        </button>
      </div>

      {/* Skipped items warning */}
      {skippedCount > 0 && (
        <div className="rounded-md px-4 py-2 mb-6 text-sm border" style={{ backgroundColor: "#f5f3fa", borderColor: "#c8c0df", color: GIX_PURPLE }}>
          {skippedCount} event{skippedCount !== 1 ? "s were" : " was"} skipped
          due to missing required fields.
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Failed to load events</p>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-24">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin w-8 h-8" style={{ color: GIX_PURPLE }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm" style={{ color: GIX_PURPLE }}>Loading events...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && events.length === 0 && (
        <div className="text-center py-24" style={{ color: "#6b5f7a" }}>
          <svg className="mx-auto w-12 h-12 mb-4 opacity-40" style={{ color: GIX_PURPLE }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">No events found</p>
          <p className="text-sm mt-1">
            {category !== "All"
              ? `No ${category.replace("_", " ")} events yet. Try a different category.`
              : "Check back soon for upcoming GIX events."}
          </p>
        </div>
      )}

      {/* Event cards */}
      {!loading && !error && events.length > 0 && (
        <>
          <p className="text-sm mb-4" style={{ color: "#6b5f7a" }}>
            {events.length} event{events.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
                style={{ borderLeft: `4px solid ${GIX_PURPLE}` }}
              >
                <div>
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={
                      CATEGORY_BADGE_STYLES[event.category ?? ""] ??
                      { backgroundColor: "#ede9f5", color: GIX_PURPLE }
                    }
                  >
                    {event.category ? event.category.replace("_", " ") : "Uncategorized"}
                  </span>
                </div>

                <h2 className="text-base font-semibold leading-snug" style={{ color: GIX_PURPLE }}>
                  {event.title}
                </h2>

                {event.description && (
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {event.description}
                  </p>
                )}

                <div className="mt-auto pt-3 flex flex-col gap-1.5 text-xs text-gray-500" style={{ borderTop: "1px solid #DFDDE8" }}>
                  {event.event_date && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" style={{ color: GIX_PURPLE }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.event_date)}
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" style={{ color: GIX_PURPLE }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
