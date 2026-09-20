"use client";

import { useEffect, useRef } from "react";

type Props = {
  placement: string;
  slotUnitId: string;
  publisherId: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let scriptLoaded = false;

function loadAdSenseScript(publisherId: string) {
  if (scriptLoaded || typeof document === "undefined") return;
  const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  if (document.querySelector(`script[src="${src}"]`)) {
    scriptLoaded = true;
    return;
  }
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
  scriptLoaded = true;
}

export function AdSlotClient({ placement, slotUnitId, publisherId }: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!publisherId || !slotUnitId) return;
    loadAdSenseScript(publisherId);

    if (pushed.current) return;
    pushed.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers may prevent insertion
    }
  }, [publisherId, slotUnitId]);

  if (!publisherId || !slotUnitId) return null;

  return (
    <aside
      className="my-6 flex justify-center"
      data-ad-placement={placement}
      aria-label="Advertisement"
    >
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slotUnitId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
