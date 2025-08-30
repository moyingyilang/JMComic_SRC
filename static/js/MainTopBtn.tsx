import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CasinoIcon from "@mui/icons-material/Casino";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useScrollToTop } from "../../Hooks";
import AdComponent from "../Ads/AdComponent";

const MainTopBtn = (props: any) => {
  const { setting, randomItem } = props;
  const scrollToTop = useScrollToTop();
  const [showScrollUp, setShowScrollUp] = useState(false);

  // 滾動切換icon
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollUp(true);
      } else {
        setShowScrollUp(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="w-14 h-14 fixed bottom-[22rem] right-3 z-40">
        <AdComponent adKey="app_home_float" adTag={false} />
      </div>
      {showScrollUp ? (
        <>
          <button
            onClick={scrollToTop}
            className="w-14 h-14 rounded-full fixed bottom-[18rem] right-3 bg-nbk text-white z-40"
          >
            <ExpandLessIcon />
          </button>
          <Link to={`/comic/detail?id=${randomItem[0]?.id}`}>
            <button className="w-14 h-14 rounded-full fixed bottom-[14rem] right-3 bg-nbk text-white z-40">
              <CasinoIcon />
            </button>
          </Link>
        </>
      ) : (
        <>
          <button className="w-14 h-14 rounded-full fixed bottom-[18rem] right-3 bg-og text-white z-40">
            <a href={setting.donate_url} target="_blank" rel="noreferrer">
              <LocalCafeIcon />
            </a>
          </button>
          <Link to="/daily" state={{ from: "/" }}>
            <button className="w-14 h-14 rounded-full fixed bottom-[14rem] right-3 bg-og text-white z-40">
              <CalendarTodayIcon />
            </button>
          </Link>
        </>
      )}
    </>
  );
};

export default MainTopBtn;
