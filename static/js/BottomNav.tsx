import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import BottomAds from "../Ads/BottomAds";
import HomeIcon from "@mui/icons-material/Home";
import WindowIcon from "@mui/icons-material/Window";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import VideocamIcon from "@mui/icons-material/Videocam";
import TextsmsIcon from "@mui/icons-material/Textsms";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useTranslation } from "react-i18next";
import AdComponent from "../../components/Ads/AdComponent";
import { FETCH_NOTIFICATIONS_UNREAD_THUNK } from "../../actions/memberAction";
import { useGlobalConfig } from "../../GlobalContext";
import { useAdResizeWatcher } from "../../Hooks";

const BottomNav = (props: any) => {
  const { currentPage } = props;
  const {
    config: { logined, ads },
  } = useGlobalConfig();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { unread, notifResult } = useAppSelector((state) => state.member);
  const catTab = sessionStorage.getItem("catTab") || "";

  useEffect(() => {
    if (logined && Object.keys(unread).length === 0) {
      dispatch(FETCH_NOTIFICATIONS_UNREAD_THUNK());
    }
  }, [logined, notifResult]);

  const items = [
    { icon: <HomeIcon className="text-3xl" />, nav: "main", label: t("nav.home"), link: "/" },
    {
      icon: <WindowIcon className="text-3xl" />,
      nav: "categories",
      label: t("nav.categories"),
      link: `/categories?slug=${catTab}`,
    },
    { icon: <VideogameAssetIcon className="text-3xl" />, nav: "games", label: t("nav.game"), link: "/games" },
    { icon: <VideocamIcon className="text-3xl" />, nav: "movies", label: t("nav.movie"), link: "/movies" },
    { icon: <TextsmsIcon className="text-3xl" />, nav: "forum", label: t("nav.forum"), link: "/forum" },
    { icon: <AccountCircleIcon className="text-3xl" />, nav: "member", label: t("nav.member"), link: "/member" },
  ];

  // ads fixed
  const [adResize, setAdResize] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAdResize = () => {
    setAdResize(true);
  };
  return (
    <>
      {currentPage !== "forum" && (
        <div
          ref={containerRef}
          className={`fixed left-0 right-0 transition-all duration-300 ease-in-out ${
            adResize ? "bottom-[3rem]" : "bottom-[4.5em]"
          }`}
        >
          {/* <div ref={containerRef} className={`fixed bottom-[3.5rem] left-0 right-0`}> */}
          <AdComponent adKey="board1" closeBtn={true} handleAdResize={handleAdResize} />
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 w-full z-20">
        <div className="flex justify-around items-start bg-bbk text-gy z-50 min-h-[6rem] pt-3 overflow-hidden">
          {items.map((item, i) => (
            <Link
              to={item.link}
              key={i}
              className={`animation-click-item flex flex-col items-center relative ${
                item.nav === currentPage ? "text-og" : ""
              }`}
            >
              <div className="relative">
                {item.icon}
                {logined && i === 5 && unread.comic_follow + unread.site_notice > 0 && (
                  <span className="absolute -top-1 -right-5 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {unread.comic_follow + unread.site_notice}
                  </span>
                )}
              </div>

              <span className="text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default BottomNav;
