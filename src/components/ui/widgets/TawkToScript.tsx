"use client";

import Script from "next/script";

// Tawk.to Property ID
const PROPERTY_ID = "69997c299d60291c30387e88";
const WIDGET_ID = "default";

// This script runs BEFORE the Tawk.to script loads to ensure
// the onLoad callback is registered in time (prevents race condition)
const TAWK_INIT_SCRIPT = `
    var Tawk_API = Tawk_API || {};
    Tawk_LoadStart = new Date();
    Tawk_API.onLoad = function() {
        // Hide default Tawk.to widget - we use our own custom trigger button
        Tawk_API.hideWidget();
    };
`;

export default function TawkToScript() {
    return (
        <>
            {/* Init script runs first (afterInteractive) to set onLoad BEFORE external script loads */}
            <Script
                id="tawk-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: TAWK_INIT_SCRIPT }}
            />
            {/* Tawk.to main script - loads lazily */}
            <Script
                id="tawk-to-script"
                strategy="lazyOnload"
                src={`https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`}
            />
        </>
    );
}

// TypeScript declarations for Tawk.to API
declare global {
    interface Window {
        Tawk_API: {
            onLoad?: () => void;
            onStatusChange?: (status: string) => void;
            hideWidget: () => void;
            showWidget: () => void;
            maximize: () => void;
            minimize: () => void;
            toggle: () => void;
            popup: () => void;
            getStatus: () => string;
            isChatMaximized: () => boolean;
            isChatMinimized: () => boolean;
            isChatHidden: () => boolean;
            isChatOngoing: () => boolean;
            isVisitorEngaged: () => boolean;
            isOnline: () => boolean;
        };
        Tawk_LoadStart: Date;
    }
}
