import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// 廣告fixed高度調整
export function useAdResizeWatcher(adLoaded: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!adLoaded || !containerRef.current) return;

    const container = containerRef.current;

    const observer = new MutationObserver(() => {
      const video = container.querySelector("video");
      const img = Array.from(container.querySelectorAll("img")).find((imgEl) => !imgEl.src.includes("loading"));

      const updatePositionIfNeeded = () => {
        const imgHeight = img?.offsetHeight || 0;
        const videoHeight = video?.offsetHeight || 0;

        if (imgHeight <= 51 || videoHeight <= 51) {
          container.classList.remove("bottom-[-20px]");
          container.classList.add("bottom-[-40px]");
          observer.disconnect();
        }
      };

      if (img) {
        img.complete ? updatePositionIfNeeded() : (img.onload = updatePositionIfNeeded);
      }
      if (video) {
        video.readyState >= 1 ? updatePositionIfNeeded() : (video.onloadedmetadata = updatePositionIfNeeded);
      }
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [adLoaded, containerRef]);
}

/**
 * 回傳一個布林值，會在指定 delay 後變為 true
 * @param delay 毫秒數（預設 1500ms）
 */
export function useDelayedFlag(delay: number = 1500): boolean {
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFlag(true);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [delay]);

  return flag;
}

export const useScrollToTop = () => {
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return scrollToTop;
};

//漫畫拼圖確認
export function useScrambleTracker(length: number, isVertical: boolean) {
  const [scrambleStatus, setScrambleStatus] = useState<boolean[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setScrambleStatus(new Array(length).fill(false));
    setIsInitialized(true); // 標記初始化完成
  }, [length, isVertical]);

  const markAsScrambled = (index: number) => {
    setScrambleStatus((prev) => {
      if (index < 0 || index >= prev.length || prev[index]) return prev;
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };
  return {
    scrambleStatus,
    markAsScrambled,
    isInitialized,
  };
}

export const GoBack = ({ back, state }: { back: number | string; state?: any }) => {
  const navigate = useNavigate();

  const goBack = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    if (typeof back === "number") {
      navigate(back);
    } else {
      navigate(back, { state });
    }
  };

  return (
    <Link to="#" onClick={goBack}>
      <ArrowBackIcon sx={{ color: "white", fontSize: 28, stroke: "white", strokeWidth: 1 }} />
    </Link>
  );
};

// 自定義 Hook: 圖片切換
export const useImageInterval = (intervalTime = 1000) => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // 0 和 1 之間切換
      setCurrentImage((prev) => (prev === 0 ? 1 : 0));
    }, intervalTime);

    return () => clearInterval(interval);
  }, [intervalTime]);

  return currentImage;
};
