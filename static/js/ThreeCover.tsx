import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { useAppSelector } from "../../../store/hooks";
import { getRandomItems } from "../../../utils/Function";

const ThreePlate = (props: any) => {
  const { onNext, config } = props;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { coverAds, isLoading } = useAppSelector((state) => state.main);
  const coverLinks = coverAds.link?.exchange_link;
  const coverImgs = coverAds.img;
  const LinksAdd = coverLinks ? coverLinks.show_max - coverLinks.first_links?.length : 1;
  const { items: secondRandomItem } = getRandomItems(coverLinks?.second_links, LinksAdd);
  const allLinks = [...(coverLinks?.first_links || []), ...secondRandomItem];

  const handleAction = () => {
    document.body.classList.add("fade");
    setLoading(true);
    sessionStorage.setItem("state", JSON.stringify(true));
    setTimeout(() => {
      onNext();
    }, 400);
  };

  return (
    <>
      <div className="w-full min-h-screen bg-[#545454] absolute left-0 top-0 z-50">
        <div className="w-9/12 h-[300px] mx-auto flex justify-center items-center mt-14 overflow-hidden">
          {isLoading ? (
            <img src="/images/loading.gif" alt="loading" width="40px" />
          ) : (
            (coverImgs?.splash_top.advs || []).map((d: any) => (
              <a href={d.link} key={d.id} target="blank">
                <img
                  src={config.setting?.img_host + d.img}
                  alt={d.id}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = "1";
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/loading.gif";
                  }}
                  width="100%"
                  height="auto"
                  className="relative object-contain max-h-[300px]"
                  style={{
                    opacity: "0",
                    transition: "opacity 0.5s ease-in-out",
                  }}
                />
                {d.adv_type !== "0" && (
                  <span className="absolute top-0 bg-og bg-opacity-80 rounded-full text-sm text-white p-1 z-30">
                    AD
                  </span>
                )}
              </a>
            ))
          )}
        </div>
        <div className="w-11/12 h-[80px] flex justify-center items-center mx-auto mt-6 overflow-hidden">
          <Swiper
            spaceBetween={30}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: false }}
            modules={[Autoplay, Pagination]}
            className="mySwiper"
          >
            {isLoading ? (
              <img src="/images/loading.gif" alt="loading" width="40px" />
            ) : (
              (coverImgs?.pop1_list.advs || []).map((d: any) => (
                <SwiperSlide key={d.id}>
                  <a href={d.link} target="blank">
                    <img
                      src={config.setting?.img_host + d.img}
                      alt={d.id}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.opacity = "1";
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/loading.gif";
                      }}
                      width="100%"
                      height="auto"
                      className="relative w-full object-contain max-h-[100px]"
                      style={{
                        opacity: "0",
                        transition: "opacity 0.5s ease-in-out",
                      }}
                    />
                    {d.adv_type !== "0" && (
                      <span className="absolute top-0 bg-og bg-opacity-80 rounded-full text-sm text-white p-1 z-30">
                        AD
                      </span>
                    )}
                  </a>
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>
        <div className="w-full mt-6 flex justify-center">
          <button className="bg-og w-4/5 p-3 text-white" disabled={loading} onClick={handleAction}>
            {!loading ? t("modal.age_confirmation") : <CircularProgress color="inherit" size={16} />}
          </button>
        </div>
        <div className="grid grid-rows-3 grid-cols-3 gap-4 mt-6 mx-6">
          {allLinks.map((d: any, i: number) => (
            <a
              key={i}
              href={d.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-2 text-center rounded flex flex-col items-center justify-center text-og"
            >
              <span style={{ color: d.color }}>{d.text}</span>
            </a>
          ))}
        </div>
        <div className="fixed bottom-2 left-0 right-0 flex justify-between px-6 py-1 text-white">
          <span>© 2008-2025 禁漫天堂</span>
          <span>JM v{config.version}</span>
        </div>
      </div>
    </>
  );
};

export default ThreePlate;
