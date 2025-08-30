import { useEffect, useRef, useState } from "react";
import { useGlobalConfig } from "../../GlobalContext";
import CloseIcon from "@mui/icons-material/Close";
import { useDelayedFlag } from "../../Hooks";
import { adjustAdHight, filterAdKey } from "../../assets/JsonData";

type AdComponentProps = {
  adKey: string;
  adIndex?: number;
  width?: string;
  height?: number;
  closeBtn?: boolean;
  adTag?: boolean;
  // ads?: any;
  handleAdResize?: () => void;
};

const enhanceAdHtml = (rawHtml: string = "", width = "100%") => {
  const injectedStyle = `
    <style>
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      ins, div, iframe, span, img {
        width: ${width} !important;
      }
     p{
        margin:0;
        position: absolute;
        top: 0;
        left:0;
        right:0;
     }
    </style>
  `;
  return `
    <!DOCTYPE html>
    <html>
      <head>${injectedStyle}</head>
      <body>${rawHtml}</body>
    </html>
  `;
};

const AdComponent = ({
  adKey = "",
  adIndex = 0,
  width = "100%",
  height = 90,
  closeBtn = false,
  adTag = true,
  // ads = {},
  handleAdResize = () => {},
}: AdComponentProps) => {
  const showCloseBtn = useDelayedFlag(3000);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [closeAds, setCloseAds] = useState<boolean>(false);
  const [adsLoading, setAdsLoading] = useState(true);
  const { config } = useGlobalConfig();
  const { memberInfo, ads } = config;

  const adsScript = ads[adKey];
  const adRawHtml = adsScript?.advs?.[adIndex]?.adv_text;
  const adType = adsScript?.advs?.[adIndex]?.adv_type;
  const shouldSkipAds = memberInfo?.ad_free === true && filterAdKey.includes(adKey);
  const processedHtml = enhanceAdHtml(adRawHtml, width);

  useEffect(() => {
    // console.log(adsScript);

    if (shouldSkipAds || !processedHtml) {
      setCloseAds(true);
      setAdsLoading(false);
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(processedHtml);
      doc.close();
    }

    // 等待 HTML 寫入並載入完畢後再查找元素
    const checkMedia = () => {
      if (!iframeRef.current) return;
      const innerDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (!innerDoc) return;

      const img = innerDoc.querySelector("img");
      const video = innerDoc.querySelector("video");

      if (img && img.clientHeight <= 51 && adKey !== "app_home_float") {
        // console.log("Image found. Height:", img.clientHeight);
        handleAdResize();
      }

      if (video && video.clientHeight <= 51) {
        // console.log("Video found. Height:", video.clientHeight);
        handleAdResize();
      }
    };

    // 延遲一點檢查 DOM（確保寫入後內容已載入）
    const timeout = setTimeout(checkMedia, 500);

    return () => clearTimeout(timeout);
  }, [processedHtml, shouldSkipAds]);

  return (
    <>
      {!closeAds && adsScript && (
        <div className="relative overflow-hidden">
          {adsLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10 dark:bg-nbk">
              <img src="/images/loading.gif" alt="loading" className="w-14 h-14 object-contain" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            title={`ad-${adKey}`}
            width="100%"
            height={adsScript?.adv_height}
            onLoad={() => {
              setAdsLoading(false);
            }}
            style={{
              border: "none",
              opacity: adsLoading ? 0 : 1,
              transition: "opacity 0.3s ease-in-out",
              width: adjustAdHight.includes(adKey) ? "32rem" : "100%",
            }}
          />
          {closeBtn && showCloseBtn && (
            <button
              className="absolute top-0 right-0 rounded-full bg-black p-1 z-20 w-8 h-8"
              onClick={() => setCloseAds(true)}
            >
              <CloseIcon sx={{ fontSize: 16, stroke: "red", strokeWidth: 2, color: "red" }} />
            </button>
          )}

          {adTag && adType && adType !== "0" && (
            <span
              id={`${adKey}_tag`}
              className="absolute top-0 bg-og bg-opacity-80 rounded-full text-white text-sm p-1 z-30"
            >
              AD
            </span>
          )}
        </div>
      )}
    </>
  );
};

export default AdComponent;
