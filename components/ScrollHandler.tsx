"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollHandler() {
    const pathname = usePathname();

    // Check if we are in any inbox route
    const isChatOpen = pathname?.startsWith("/inbox");

    useEffect(() => {
        if (isChatOpen) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }

        // Cleanup when component unmounts or path changes
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [isChatOpen]);

    return null;
}