"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";

// Fallback data (shown while API loads or if DB is empty)
const FALLBACK_ACTIVITIES = [
  { name: "Raylan A.", city: "Sleman", program: "Madrasah Tsanawiyah" },
  { name: "Muhammad A.", city: "Bantul", program: "I'dad Lughowi" },
];

interface Activity {
  name: string;
  city: string;
  program: string;
}

export default function LiveActivityToast() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [activities, setActivities] = useState<Activity[]>(FALLBACK_ACTIVITIES);

  // Fetch real registrant data from API
  useEffect(() => {
    fetch("/api/public/recent-registrants", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.registrants && data.registrants.length > 0) {
          setActivities(data.registrants);
        }
      })
      .catch(() => {
        // Silently fall back to static data
      });
  }, []);

  const showNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % activities.length);
    setVisible(true);
    setTimeout(() => setVisible(false), 4500);
  }, [activities.length]);

  useEffect(() => {
    // First toast after 8s
    const initial = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setVisible(false), 4500);
    }, 8000);

    // Repeat every 25s
    const interval = setInterval(showNext, 25000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [showNext]);

  const activity = activities[current % activities.length];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`${current}-${activity.name}`}
          initial={{ opacity: 0, x: -60, y: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-3 sm:left-6 z-50 bg-white rounded-2xl shadow-premium-xl border border-surface-100 px-4 py-3 flex items-center gap-3 max-w-[min(260px,calc(100vw-4.5rem))]"
        >
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-black text-ink-950 leading-tight">
              {activity.name} dari {activity.city}
            </p>
            <p className="text-[11px] text-ink-500 font-medium leading-tight mt-0.5">
              baru mendaftar Program {activity.program}
            </p>
          </div>
          {/* Live dot */}
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
