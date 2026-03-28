"use client";

import { ReactNode, useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [displayPathname, setDisplayPathname] = useState(pathname);

  useEffect(() => {
    startTransition(() => {
      setDisplayPathname(pathname);
    });
  }, [pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={displayPathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1], // Premium easing
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Loading indicator for transition */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 h-0.5 bg-brown-200 z-[100]"
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.3 }}
              className="h-full bg-brown-500"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
