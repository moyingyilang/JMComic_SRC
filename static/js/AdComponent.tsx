import { useEffect, useMemo, useRef, useState } from "react";
import { useGlobalConfig } from "../../GlobalContext";
import CloseIcon from "@mui/icons-material/Close";
import { useDelayedFlag } from "../../Hooks";
import { adjustAdHight, filterAdKey } from "../../assets/JsonData";
import { getRandomItems } from "../../utils/Function";

type AdComponentProps = {
  adKey: string;
  adIndex?: number;
  width?: string;
  height?: number;
  closeBtn?: boolean;
  adTag?: boolean;
  comicId?: string;
  // ads?: any;
  handleAdResize?: () => void;
};

type ExoLoaderType = {
  serve: (options: { script_url: string; force: boolean }) => void;
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
  comicId = "",
  handleAdResize = () => {},
}: AdComponentProps) => {
  const showCloseBtn = useDelayedFlag(3000);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [closeAds, setCloseAds] = useState<boolean>(false);
  const [adsLoading, setAdsLoading] = useState(true);
  const { config } = useGlobalConfig();
  const { memberInfo, ads } = config;
  const dataKey = adKey;
  const adsScript = ads[dataKey];
  const adsItems = adsScript?.advs;
  const arrAdKey = ["app_home_top", "app_movies_top_banner"];

  const slotIndex = useMemo(() => {
    if (arrAdKey.includes(dataKey)) return adIndex;
    return getRandomItems(adsItems, adsItems?.length).indexes[0];
  }, [adsItems, dataKey]);

  const adRawHtml = adsScript?.advs?.[slotIndex]?.adv_text;
  const adType = adsScript?.advs?.[slotIndex]?.adv_type;
  const shouldSkipAds = memberInfo?.ad_free === true && filterAdKey.includes(dataKey);
  const processedHtml = enhanceAdHtml(adRawHtml, width);

  useEffect(() => {
    if (shouldSkipAds || !processedHtml || adsScript?.length === 0) {
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

      const d = innerDoc.getElementsByTagName("ins");

      if (d.length > 0 && comicId !== "") {
        for (let i = 0; i < d.length; i++) {
          d[i].setAttribute("data-sub2", comicId);
        }
      } else {
        const newDiv = innerDoc.createElement("div");
        newDiv.setAttribute("data-sub2", "0");
        innerDoc.body.appendChild(newDiv);
      }

      const img = innerDoc.querySelector("img");
      const video = innerDoc.querySelector("video");

      if (img && img.clientHeight <= 51 && dataKey !== "app_home_float") {
        // console.log("Image found. Height:", img.clientHeight);
        handleAdResize();
      }

      if (video && video.clientHeight <= 51) {
        // console.log("Video found. Height:", video.clientHeight);
        handleAdResize();
      }
      // 插入 backendScript
      try {
        if (
          Array.isArray(adsScript?.advs) &&
          adsScript.advs?.length > 0 &&
          adsScript.advs[0]?.adv_name?.includes("EXO")
        ) {
          const script = innerDoc.createElement("script");
          script.type = "text/javascript";
          script.text = `
            (function () {
              var myEl = { el: null }; 
              try { 
                var event = new CustomEvent("getexoloader", { detail: myEl }); 
              } catch (e) { 
                event = document.createEvent("CustomEvent");
                event.initCustomEvent("getexoloader", false, false, myEl); 
              } 
              window.document.dispatchEvent(event); 
              var ExoLoader = myEl.el;
              if (ExoLoader) {
                ExoLoader.serve({ 
                  script_url: "/templates/frontend/airav/js/f_361.js", 
                  force: true,
                  neverblock: true 
                });
              }
            })();
          `;
          innerDoc.body.appendChild(script);
        }
      } catch (err) {
        console.warn("Failed to inject backend script:", err);
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
            title={`frame-${dataKey}`}
            width="100%"
            height={adsScript?.adv_height}
            onLoad={() => {
              setAdsLoading(false);
            }}
            style={{
              border: "none",
              opacity: adsLoading ? 0 : 1,
              transition: "opacity 0.3s ease-in-out",
              width: adjustAdHight.includes(dataKey) ? "32rem" : "100%",
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
              id={`${dataKey}_tag`}
              className="absolute top-0 bg-og bg-opacity-80 rounded-full text-white text-sm p-1 z-30"
            >
              <span>A</span>
              <span>D</span>
            </span>
          )}
        </div>
      )}
    </>
  );
};

export default AdComponent;
