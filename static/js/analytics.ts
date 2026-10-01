import { useEffect, useRef } from "react";
import ReactGA from "react-ga4";

type GAEventParams = Record<string, string | number | boolean | undefined>;

export const trackEvent = (eventName: string, params?: GAEventParams) => {
  ReactGA.event(eventName, params);
};

type AdEventType = "jm3_ad_impression" | "jm3_ad_click";

type AdEventParams = {
  adKey: string;
  ad_desc: string;
  adName: string;
};

export const trackAdEvent = (eventType: AdEventType, { adKey = "", ad_desc = "", adName = "" }: AdEventParams) => {
  trackEvent(eventType, {
    ad_key: adKey,
    ad_desc: ad_desc,
    ad_name: adName,
    send_to: "G-69VXS5Z1FV",
    ...(process.env.NODE_ENV !== "production" && { debug_mode: true }),
  });
};

// 廣告曝光偵測：目標元素可見（達 threshold）且停留滿 dwellMs 才算一次曝光，滑走則取消計時
// resetKey 改變時（例如換了一則廣告）重新允許再次偵測曝光
export function useAdImpression(
  containerRef: React.RefObject<HTMLElement>,
  enabled: boolean,
  onImpression: () => void,
  resetKey: unknown,
  dwellMs: number = 3000
) {
  const impressionSentRef = useRef(false);
  const onImpressionRef = useRef(onImpression);
  onImpressionRef.current = onImpression;

  useEffect(() => {
    impressionSentRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (!enabled || impressionSentRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            if (!impressionSentRef.current) {
              impressionSentRef.current = true;
              onImpressionRef.current();
              observer.disconnect();
            }
          }, dwellMs);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, resetKey]);
}
