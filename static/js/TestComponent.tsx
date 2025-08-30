import React, { useEffect, useRef, useState } from "react";

const AdComponent = () => {
  const adRef = useRef<HTMLDivElement>(null);
  const [ads, setAds] = useState("");

  useEffect(() => {
    fetch("http://hollie_18comic_dev.18comic.cc:8880/api/app/ad_content_all?debug_app=plkfdgkjdfe&ipcountry=TW&lang=CN")
      .then((res) => res.json())
      .then((res) => {
        setAds(res.data["app_movie_bottom_center_jm3"].advs[0].adv_text);
        console.log(res.data["app_movie_bottom_center_jm3"]);
      });
  }, []);

  useEffect(() => {
    if (!ads || !adRef.current) return;

    adRef.current.innerHTML = ""; // 清除舊內容
    const container = document.createElement("div");
    container.innerHTML = ads;
    adRef.current.appendChild(container);

    // 監聽 DOM 變化，尋找可能的廣告標籤
    //  const observer = new MutationObserver(() => {
    //    const adElements = container.querySelectorAll("ins, div, iframe, span");
    //    adElements.forEach((el) => {
    //      (el as HTMLElement).style.width = "100%";
    //      // (el as HTMLElement).style.height = height;
    //      (el as HTMLElement).style.display = "block"; // 避免 inline 顯示異常
    //    });

    //    if (adElements.length > 0) {
    //      observer.disconnect(); // 找到廣告標籤後停止監聽
    //    }
    //  });

    //  observer.observe(container, { childList: true, subtree: true });

    // 解析並載入 script
    const scripts = container.getElementsByTagName("script");
    for (let script of scripts) {
      const newScript = document.createElement("script");
      newScript.type = script.type || "text/javascript";

      if (script.src) {
        newScript.src = script.src;
        newScript.async = script.async;
      } else {
        newScript.textContent = script.textContent;
      }

      document.body.appendChild(newScript);
    }

    //  return () => observer.disconnect(); // 清理監聽器
  }, [ads]);

  return <div ref={adRef}></div>;
};

export default AdComponent;
