import apiPaths from "../api/apiPaths";
import { token, tokenParam, tryDecryption } from "../api/HttpUtil";
import GlobalStore from "../config/GlobalStore";

export type SpeedLevel = "smooth" | "normal" | "laggy";

export type HostSpeedResult = {
  latency: number | null;
  downloadSpeed: number | null;
  imageLoadTime: number | null;
};

// 延遲門檻：< SMOOTH 為綠(順暢)，< LAGGY 為橘(普通)，其餘或無法連線為紅(卡頓)
// 每次測速都是對海外線路發出全新請求（含 DNS + TLS 交握，無連線重用），門檻需放寬以反映冷連線的實際情況
export const SMOOTH_LATENCY_MS = 600;
export const LAGGY_LATENCY_MS = 1200;

export const getSpeedLevel = (latency: number | null): SpeedLevel => {
  if (latency === null) return "laggy";
  if (latency < SMOOTH_LATENCY_MS) return "smooth";
  if (latency < LAGGY_LATENCY_MS) return "normal";
  return "laggy";
};

export const speedLevelStyle: Record<SpeedLevel, { text: string; dot: string; }> = {
  smooth: { text: "text-green-500", dot: "bg-green-500" },
  normal: { text: "text-orange-400", dot: "bg-orange-400" },
  laggy: { text: "text-red-500", dot: "bg-red-500" },
};

// 跟 HttpUtil.fetchGet 送一樣的 header，伺服器的加密金鑰是跟著 Tokenparam/Token 走的，
// 少了這些 header 拿到的 data 常常解不開（空字串）
const buildSpeedTestHeaders = (): HeadersInit => {
  const jwttoken = JSON.parse(localStorage.getItem("jwttoken") as string) || "";
  const memberInfo = JSON.parse(localStorage.getItem("memberInfo") as string) || "";
  return {
    Tokenparam: tokenParam,
    Token: token,
    Authorization: jwttoken ? `Bearer ${jwttoken}` : "",
    Cookie: memberInfo ? `AVS=${memberInfo?.s}` : "",
  };
};

// 用 <img> 標籤量測圖片 CDN 的實際載入時間：img_host 只透過 <img> 載入、沒有開放 CORS，
// fetch 讀不到內容，但瀏覽器載入 <img> 本身不受 CORS 限制。
// 缺點是讀不到回應 byte 數，只能量到「載入時間」，無法換算成 Mbps。
const testImageLoadTime = (url: string, timeoutMs = 10000): Promise<number | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    const start = performance.now();
    const timer = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      resolve(null);
    }, timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(performance.now() - start);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
};

// 對該線路的設定 API 發出真實請求，量測延遲與下載速度；testImage 為 true 時，
// 額外用這條線路自己解密出來的 img_host 測圖片就緒時間（例如選線畫面只要延遲判斷燈號，不需要多測這段）
export const testHostSpeed = async (
  host: string,
  options?: { testImage?: boolean; }
): Promise<HostSpeedResult> => {
  const controller = new AbortController();

  const testImage = options?.testImage ?? true;
  const url = `https://${host}/${apiPaths.API_APP_SETTING}?lang=${localStorage.getItem("lang") || "TW"}`;
  try {
    const start = performance.now();
    const response = await fetch(url, {
      cache: "no-store",
      credentials: "include",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
      headers: buildSpeedTestHeaders(),
    });
    const headersReceived = performance.now();
    const responseForDecrypt = testImage ? response.clone() : null;
    const buffer = await response.arrayBuffer();
    const end = performance.now();

    const latency = headersReceived - start;
    const downloadSeconds = (end - headersReceived) / 1000;
    const downloadSpeed =
      downloadSeconds > 0 && buffer.byteLength > 0 ? (buffer.byteLength * 8) / (downloadSeconds * 1_000_000) : null;

    let imageLoadTime: number | null = null;
    if (testImage && responseForDecrypt) {
      try {
        let decryptedData: any = null;
        await tryDecryption(
          responseForDecrypt,
          (result) => {
            decryptedData = result?.data;
          },
          url
        );
        if (decryptedData?.img_host) {
          const imageUrl = `${decryptedData.img_host}/media/users/nopic-.gif?v=0`;
          const loaded = await testImageLoadTime(imageUrl);
          // 從發出 API 請求開始算到圖片載入完成，才是使用者實際感受到的等待時間（打 API 拿 img_host → 載圖）
          imageLoadTime = loaded === null ? null : performance.now() - start;
        }
      } catch {
        // 解密失敗（例如非 JSON 回應）就不測圖片
      }
    }

    return { latency, downloadSpeed, imageLoadTime };
  } catch {
    return { latency: null, downloadSpeed: null, imageLoadTime: null };
  }
};

// 跟 testHostSpeed 一樣，但會把結果同步寫回 GlobalStore
export const testHostSpeedAndStore = async (
  host: string,
  label: string,
  options?: { testImage?: boolean; }
): Promise<HostSpeedResult> => {
  const result = await testHostSpeed(host, options);
  GlobalStore.updateLineLatency(label, result.latency, result.downloadSpeed, result.imageLoadTime);
  return result;
};

export type UrlSpeedResult = { latency: number | null; downloadSpeed: number | null; };

// 對單一 API URL（例如某支請求失敗時錯誤彈窗要測速用的那個 url）做安全的 GET 測速，
// 只量延遲跟下載吞吐量。那個 url 可能是登入/付款等有副作用的端點，所以只發真正安全的 GET，不寫任何資料。
export const testUrlSpeed = async (url: string, timeoutMs = 10000): Promise<UrlSpeedResult> => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const start = performance.now();
    const response = await fetch(url, {
      cache: "no-store",
      credentials: "include",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
      headers: buildSpeedTestHeaders(),
    });
    const headersReceived = performance.now();
    const buffer = await response.arrayBuffer();
    const end = performance.now();
    clearTimeout(timer);

    const latency = headersReceived - start;
    const downloadSeconds = (end - headersReceived) / 1000;
    const downloadSpeed =
      downloadSeconds > 0 && buffer.byteLength > 0 ? (buffer.byteLength * 8) / (downloadSeconds * 1_000_000) : null;

    return { latency, downloadSpeed };
  } catch {
    return { latency: null, downloadSpeed: null };
  }
};

