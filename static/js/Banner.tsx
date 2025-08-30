import { Link } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import VideocamIcon from "@mui/icons-material/Videocam";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useTranslation } from "react-i18next";
import AdComponent from "../Ads/AdComponent";
import { CLEAR_CATEGORIES_LIST } from "../../reducers/categoriesReducer";
import AodIcon from "@mui/icons-material/Aod";
import { useState } from "react";

const Banner = (props: any) => {
  const { dispatch, bannerList } = props;
  const { t } = useTranslation();
  const [isSwiping, setIsSwiping] = useState(false);

  const clearCatList = () => {
    dispatch(CLEAR_CATEGORIES_LIST("cateFilterList"));
  };

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
      icon: <InventoryIcon className="text-red-700" />,
      label: t("banner.library"),
      link: "/library",
    },
  ];

  return (
    <div className="bg-white dark:bg-nbk text-white">
      <Swiper
        spaceBetween={30}
        autoplay={{ delay: 5000 }}
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        onTouchStart={() => setIsSwiping(true)}
        onTouchEnd={() => setTimeout(() => setIsSwiping(false), 100)}
        className="mySwiper h-[250px]"
      >
        {bannerList?.length > 0 &&
          bannerList.map((item: any, index: number) => (
            <SwiperSlide key={index}>
              <div className="relative">
                <div
                  className="absolute inset-0 z-10"
                  style={{
                    touchAction: "pan-y",
                    pointerEvents: isSwiping ? "none" : "auto",
                    backgroundColor: "transparent",
                  }}
                />
                <AdComponent adKey="app_home_top" adIndex={index} />
              </div>
            </SwiperSlide>
          ))}
      </Swiper>

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
