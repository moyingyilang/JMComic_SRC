// hooks/usePageTracking.js
import { useEffect } from "react";
import ReactGA from "react-ga4";
import { useLocation } from "react-router-dom";

export default function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const trackingId = location.pathname === "/pay" ? "G-KMM0J6KRKX" : "G-69VXS5Z1FV";

    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
      send_to: trackingId,
    });
  }, [location.pathname, location.search]);
}
