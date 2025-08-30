import { useEffect, useImperativeHandle, useRef } from "react";
import Hls from "hls.js";

interface HlsPlayerProps {
  src: string; // 支援 mp4 和 m3u8
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useImperativeHandle(videoRef, () => videoRef.current as HTMLVideoElement);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const lowerSrc = src.toLowerCase();
    const isMp4 = lowerSrc.includes("prvhls2");

    let hls: Hls | null = null;

    try {
      if (isMp4) {
        video.src = src;
      } else {
        // 預設為 HLS（.m3u8）
        if (Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("HLS Manifest Loaded");
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari 原生支援 HLS
          video.src = src;
        } else {
          console.error("此瀏覽器不支援 HLS");
        }
      }
    } catch (error) {
      console.error("HlsPlayer 初始化錯誤:", error);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return <video ref={videoRef} controls autoPlay width="100%" />;
};

export default HlsPlayer;
