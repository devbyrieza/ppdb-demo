"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { BRANDING } from "@/config/branding";

export default function ProgressBarProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color={BRANDING.primaryColor}
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
}
