import AodIcon from "@mui/icons-material/Aod";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import SendIcon from "@mui/icons-material/Send";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getRandomAdsItems } from "../../utils/Function";
import AdComponent from "../Ads/AdComponent";

const Banner = (props: any) => {
  const { bannerList, adFreeStatus } = props;
  const { t } = useTranslation();
  const [isSwiping, setIsSwiping] = useState(false);
  const novelSearchQuery = sessionStorage.getItem("novelSearchQuery") || "";

  const bannerRandomIndex = useMemo(() => {
    return getRandomAdsItems(bannerList, bannerList?.length, "main_banner_ads").indexes;
  }, [bannerList]);

  const items = [
    { icon: <SendIcon className="text-orange-500" />, label: t("banner.latest"), link: "/categories" },
    {
      icon: <WhatshotIcon className="text-red-500" />,
      label: t("banner.hot_ranking"),
      link: "/categories?slug=doujin&sort=mv",
    },
    {
      icon: <AodIcon className="text-indigo-500" />,
      label: t("banner.hanman"),
      link: "/categories?slug=hanman",
    },
    {
      icon: <ImportContactsIcon className="text-teal-500" />,
      label: t("banner.single_book"),
      link: "/categories?slug=single",
    },
    {
      icon: <AutoStoriesIcon className="text-orange-600" />,
      label: "小說",
      link: `/novels?filter=${novelSearchQuery}`,
    },
    {
      icon: <VideogameAssetIcon className="text-blue-500" />,
      label: t("banner.games"),
      link: "/games",
    },
    {
      icon: <VideocamIcon className="text-neutral-500" />,
      label: t("banner.movies"),
      link: "/movies",
    },
    {
      icon: <img src="/images/coin.png" alt="coin" className="w-6 h-6" />,
      label: t("banner.sponsor"),
      link: "/pay?utm_source=platform&utm_medium=app_icon",
    },
    // {
    //   icon: <InventoryIcon className="text-red-700" />,
    //   label: t("banner.library"),
    //   link: "/library",
    // },
  ];

  return (
    <div className="bg-white dark:bg-nbk text-white">
      {!adFreeStatus && (
        <Swiper
          spaceBetween={30}
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination]}
          onTouchStart={() => setIsSwiping(true)}
          onTouchEnd={() => setTimeout(() => setIsSwiping(false), 100)}
          className="mySwiper h-[250px]"
        >
          {bannerRandomIndex?.length > 0 &&
            bannerRandomIndex.map((itemIndex: any) => (
              <SwiperSlide key={itemIndex}>
                <div className="relative">
                  <div
                    className="absolute inset-0 z-10"
                    style={{
                      touchAction: "pan-y",
                      pointerEvents: isSwiping ? "none" : "auto",
                      backgroundColor: "transparent",
                    }}
                  />
                  <AdComponent adKey="app_home_top" adIndex={itemIndex} />
                </div>
              </SwiperSlide>
            ))}
        </Swiper>
      )}

      <div className="text-black dark:text-white">
        <div className="w-11/12 flex justify-around p-2 my-2 shadow-lg m-auto rounded-2xl dark:bg-bbk">
          {items.map((item, index) => (
            <Link key={index} to={item.link} state={{ from: "/" }} className="flex flex-col items-center pt-2">
              {item.icon}
              <span className="">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="w-full pt-3 dark:bg-black">
          <Link to="/week">
            <img className="w-full h-full object-contain" src="/images/week.gif" alt="img-link" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Banner;
