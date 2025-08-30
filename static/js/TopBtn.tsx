import React, { useState, useEffect } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const TopBtn = () => {
  const [showScrollUp, setShowScrollUp] = useState(false);

  // 滾動切換icon
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollUp(true);
      } else {
        setShowScrollUp(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 置頂
  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {showScrollUp && (
        <button
          onClick={scrollToTop}
          className="w-14 h-14 rounded-full fixed bottom-[10rem] right-3 bg-og text-white z-50"
        >
          <ExpandLessIcon />
        </button>
      )}
    </>
  );
};

export default TopBtn;
