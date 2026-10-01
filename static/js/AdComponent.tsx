import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { adjustAdHight } from "../../assets/JsonData";
import { useGlobalConfig } from "../../GlobalContext";
import { useDelayedFlag } from "../../Hooks";
import { trackAdEvent, useAdImpression } from "../../utils/analytics";
import { getRandomAdsItems } from "../../utils/Function";

type AdComponentProps = {
  adKey: string;
  adIndex?: number;
  width?: string;
  height?: number;
  closeBtn?: boolean;
  adTag?: boolean;
  comicId?: string;
  handleAdResize?: () => void;
};

const enhanceAdHtml = (
  rawHtml: string = "",
  width = "100%",
  advgrpId = "0",
  comicId = "0",
  imgAutoHeight = false,
  instanceId = ""
) => {
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
      ${imgAutoHeight ? "img { height: auto !important; }" : ""}
      p {
        margin: 0;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
      }
    </style>
  `;

  const dataSubScript = `
    <script>
      (function() {
        var d = document.getElementsByTagName('ins');
        if (d.length > 0) {
          for (var i = 0; i < d.length; i++) {
            d[i].setAttribute('data-sub', '${advgrpId}');
            d[i].setAttribute('data-sub2', '${comicId}');
          }
        } else {
          var div = document.createElement('div');
          div.setAttribute('data-sub', '${advgrpId}');
          div.setAttribute('data-sub2', '0');
          document.body.appendChild(div);
        }
      })();
    </script>
  `;

  const imgSizeScript = imgAutoHeight
    ? `
    <script>
      (function() {
        var img = document.querySelector('img');
        if (!img) return;
        var report = function() {
          if (img.naturalWidth > 0) {
            window.parent.postMessage(
              { type: 'ad-img-size', instanceId: '${instanceId}', naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight },
              '*'
            );
          }
        };
        if (img.complete) {
          report();
        } else {
          img.addEventListener('load', report);
        }
      })();
    </script>
  `
    : "";

  const clickScript = `
    <script>
      (function() {
        document.addEventListener('click', function() {
          window.parent.postMessage(
            { type: 'ad-click', instanceId: '${instanceId}' },
            '*'
          );
        }, true);
      })();
    </script>
  `;

  return `<!DOCTYPE html>
    <html>
      <head>${injectedStyle}</head>
      <body>${rawHtml}${dataSubScript}${imgSizeScript}${clickScript}</body>
    </html>`;
};

const ARR_AD_KEY = ["app_home_top", "app_movies_top_banner"];
const ARR_AD_KEY_S = ["app_route", "app_home_top", "app_movies_top_banner"];
const ARR_AUTO_HEIGHT_KEY = ["app_chapter_top", "app_chapter_last", "app_thewayhome"];

const AdComponent = ({
  adKey = "",
  adIndex = 0,
  width = "100%",
  closeBtn = false,
  adTag = true,
  comicId = "",
  handleAdResize = () => {},
}: AdComponentProps) => {
  const instanceId = useId();
  const showCloseBtn = useDelayedFlag(3000);
  const [closeAds, setCloseAds] = useState<boolean>(false);
  const [adsLoading, setAdsLoading] = useState(true);
  const [dynamicHeight, setDynamicHeight] = useState<number | undefined>(undefined);
  const { config } = useGlobalConfig();
  const { memberInfo, ads } = config;
  const dataKey = adKey;
  const adsScript = ads[dataKey];
  const adsItems = adsScript?.advs;

  // 隨機選擇廣告索引，若廣告數量大於 1，則從 adsItems 中隨機選擇一個索引，否則使用預設的 adIndex
  const slotIndex = useMemo(() => {
    if (ARR_AD_KEY.includes(dataKey)) return adIndex;
    return adsItems?.length >= 1 && getRandomAdsItems(adsItems, adsItems.length, dataKey).indexes[0];
  }, [adIndex, adsItems, dataKey]);

  const adRawHtml = adsItems?.[slotIndex]?.adv_text;
  const adType = adsItems?.[slotIndex]?.adv_type;
  const advName = adsItems?.[slotIndex]?.adv_name;
  const advDesc = adsItems?.[slotIndex]?.adv_desc;
  const shouldSkipAds = memberInfo?.ad_free === true && !ARR_AD_KEY.includes(dataKey);

  // 廣告名稱包含 EXO 或 ADU（不分大小寫）代表是聯播網廣告，不記錄 GA 事件
  const isAdNetwork = Boolean(advName && /exo|adu/i.test(advName));

  // 判斷是否為付費廣告
  const isPaymentAd = Boolean(adRawHtml?.includes("payment?"));

  // 移除 a 標籤本身，避免手機瀏覽器在攔截到 click 前就先用原生連結的預設行為開新分頁跳走
  const paymentAdHtml = useMemo(() => {
    if (!isPaymentAd) return "";
    return (adRawHtml || "").replace(/<a\b[^>]*>/gi, "").replace(/<\/a>/gi, "");
  }, [isPaymentAd, adRawHtml]);

  const splicingLink = (link: string) => {
    const query = link.split("?")[1];
    return query ? `/pay?${query}` : "/pay";
  };

  const paymentLink = useMemo(() => {
    if (!isPaymentAd) return "";
    const match = (adRawHtml || "").match(/href=["']([^"']*payment\?[^"']*)["']/i);
    return splicingLink(match?.[1] || "");
  }, [isPaymentAd, adRawHtml]);

  const processedHtml = useMemo(
    () =>
      enhanceAdHtml(
        adRawHtml,
        width,
        adsScript?.advgrp_id || "0",
        comicId || "0",
        ARR_AUTO_HEIGHT_KEY.includes(dataKey),
        instanceId
      ),
    [adRawHtml, width, adsScript?.advgrp_id, comicId, dataKey, instanceId]
  );

  useEffect(() => {
    if (shouldSkipAds || (adsScript !== undefined && !adRawHtml)) {
      setCloseAds(true);
      setAdsLoading(false);
    }
  }, [shouldSkipAds, adRawHtml, adsScript]);

  useEffect(() => {
    if (isPaymentAd) {
      setAdsLoading(false);
    }
  }, [isPaymentAd]);

  const containerRef = useRef<HTMLDivElement>(null);

  useAdImpression(
    containerRef,
    !isAdNetwork,
    () => trackAdEvent("jm3_ad_impression", { adKey: dataKey, ad_desc: advDesc, adName: advName }),
    adRawHtml
  );

  // 點擊：廣告連結點擊發生在 iframe 內，透過 postMessage 回傳給外層
  // 付費廣告改由 Link 直接點擊，不經過 iframe，於下方 onClick 記錄
  useEffect(() => {
    if (isPaymentAd || isAdNetwork || !adRawHtml) return;
    const handleAdClickMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== "ad-click" || data.instanceId !== instanceId) return;
      trackAdEvent("jm3_ad_click", { adKey: dataKey, ad_desc: advDesc, adName: advName });
    };
    window.addEventListener("message", handleAdClickMessage);
    return () => window.removeEventListener("message", handleAdClickMessage);
  }, [isPaymentAd, isAdNetwork, adRawHtml, instanceId, dataKey, advDesc, advName]);

  // 只針對 需要寬度滿版的廣告 ARR_AUTO_HEIGHT_KEY 根據圖片真實尺寸計算等比高度
  // 尺寸由 iframe 內已載入的 <img> 量測後透過 postMessage 回傳,避免額外重複發送圖片請求
  useEffect(() => {
    if (!ARR_AUTO_HEIGHT_KEY.includes(dataKey) || !adRawHtml) return;
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== "ad-img-size" || data.instanceId !== instanceId) return;
      if (data.naturalWidth > 0) {
        const displayWidth = window.innerWidth;
        setDynamicHeight(Math.round(data.naturalHeight * (displayWidth / data.naturalWidth)));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [dataKey, adRawHtml, instanceId]);

  const iframeHeight = ARR_AUTO_HEIGHT_KEY.includes(dataKey)
    ? dynamicHeight ?? adsScript?.adv_height
    : adsScript?.adv_height;

  return (
    <>
      {!closeAds && adsScript && adsScript?.advs !== null && (
        <div className="relative overflow-hidden" ref={containerRef}>
          {adsLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10 dark:bg-nbk pointer-events-none">
              <img src="/images/loading.gif" alt="loading" className="w-14 h-14 object-contain" />
            </div>
          )}
          {isPaymentAd && (
            <Link
              to={paymentLink}
              className="block mt-1"
              onClick={() => trackAdEvent("jm3_ad_click", { adKey: dataKey, ad_desc: advDesc, adName: advName })}
              dangerouslySetInnerHTML={{
                __html: paymentAdHtml,
              }}
            />
          )}
          {!isPaymentAd && (
            <iframe
              title={`frame-${dataKey}`}
              width="100%"
              height={iframeHeight}
              srcDoc={processedHtml}
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-forms"
              onLoad={() => {
                setAdsLoading(false);
                handleAdResize();
              }}
              style={{
                border: "none",
                opacity: adsLoading ? 0 : 1,
                transition: "opacity 0.3s ease-in-out",
                width: adjustAdHight.includes(dataKey) ? "32rem" : "100%",
                pointerEvents: adsLoading ? "none" : "auto",
              }}
            />
          )}
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
