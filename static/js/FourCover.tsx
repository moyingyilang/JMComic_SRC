import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useDelayedFlag } from "../../../Hooks";
import { getRandomAdsItems } from "../../../utils/Function";
import { trackAdEvent, useAdImpression } from "../../../utils/analytics";

const FourPlate = (props: any) => {
  const { onNext, config, adsFourCoverOpen, setAdsFourCoverOpen } = props;
  const { adsContent, setting } = config;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [adsLoading, setAdsLoading] = useState(false);
  const showCloseBtn = useDelayedFlag(3000);

  const coverImgs = adsContent.img;

  const { items: imgRandomItem } = useMemo(() => {
    const advs = coverImgs?.app_pop3_cover?.advs;
    if (!(advs?.length > 1)) return { items: advs || [] };
    return getRandomAdsItems(advs, 1, "app_pop3_cover");
  }, [coverImgs?.app_pop3_cover]);

  const { items: randomItem } = useMemo(() => {
    const advs = coverImgs?.app_pop3_img?.advs;
    if (!(advs?.length > 1)) return { items: advs || [] };
    return getRandomAdsItems(advs, advs.length, "app_pop3_img");
  }, [coverImgs?.app_pop3_img]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const top_adv_key = coverImgs?.app_pop3_cover?.adv_group_name;
  const top_adv_desc = coverImgs?.app_pop3_cover?.adv_desc;
  const top_adv_name = imgRandomItem.title;

  const pop3_adv_key = coverImgs?.app_pop3_img?.adv_group_name;
  const pop3_adv_desc = coverImgs?.app_pop3_img?.adv_desc;
  const pop3_adv_name = coverImgs?.app_pop3_img?.advs[activeIndex]?.title;

  useAdImpression(
    containerRef,
    true,
    () => trackAdEvent("jm3_ad_impression", { adKey: top_adv_key, ad_desc: top_adv_desc, adName: top_adv_name }),
    adsContent?.length
  );

  useAdImpression(
    containerRef,
    true,
    () => trackAdEvent("jm3_ad_impression", { adKey: pop3_adv_key, ad_desc: pop3_adv_desc, adName: pop3_adv_name }),
    adsContent?.length
  );

  const handleAction = () => {
    document.body.classList.add("fade");
    setLoading(true);
    if (adsFourCoverOpen) {
      sessionStorage.setItem("state", JSON.stringify(true));
    }
    setTimeout(() => {
      onNext();
      setAdsFourCoverOpen(false);
    }, 400);
  };

  const splicingLink = (link: string) => {
    const query = link.split("?")[1];
    return query ? `/pay?${query}` : "/pay";
  };

  return (
    <>
      <div className="fixed inset-0 w-full h-full bg-[#545454] z-50 overflow-y-auto">
        <div
          className="mx-auto flex justify-center items-center flex-col pt-10 pb-6"
          onClick={() =>
            trackAdEvent("jm3_ad_click", { adKey: top_adv_key, ad_desc: top_adv_desc, adName: top_adv_desc })
          }
        >
          {showCloseBtn && (
            <button className="absolute top-20 right-8 rounded-3xl bg-zinc-950 w-8 h-8 z-10" onClick={handleAction}>
              <CloseIcon sx={{ fontSize: 16, stroke: "red", strokeWidth: 2, color: "red" }} />
            </button>
          )}
          {adsLoading ? (
            <img src="/images/loading.gif" alt="loading" width="40px" />
          ) : (
            (imgRandomItem || []).map((d: any) => {
              const isPayment = d.link.includes("payment?");
              const content = (
                <img
                  src={d.img.startsWith("http") ? d.img : config.setting?.img_host + d.img}
                  alt={d.id}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = "1";
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/cover_default.jpg";
                  }}
                  width="100%"
                  height="auto"
                  className="relative object-contain"
                  style={{
                    opacity: "0",
                    transition: "opacity 0.5s ease-in-out",
                  }}
                />
              );

              return isPayment ? (
                <Link key={d.id} to={splicingLink(d.link)} onClick={handleAction}>
                  {content}
                </Link>
              ) : (
                <a
                  key={d.id}
                  href={d.link.startsWith("http") ? d.link : setting.main_web_host}
                  target="_blank"
                  rel="noreferrer"
                >
                  {content}
                </a>
              );
            })
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
            onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.activeIndex)}
          >
            {adsLoading ? (
              <img src="/images/loading.gif" alt="loading" width="40px" />
            ) : (
              (randomItem || []).map((d: any) => {
                const isPayment = d.link.includes("payment?");
                const content = (
                  <>
                    <img
                      key={d.id}
                      src={d.img.startsWith("http") ? d.img : config.setting?.img_host + d.img}
                      alt={d.id}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.opacity = "1";
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/cover_default.jpg";
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
                  </>
                );

                return (
                  <SwiperSlide
                    key={d.id}
                    onClick={() =>
                      trackAdEvent("jm3_ad_click", {
                        adKey: pop3_adv_key,
                        ad_desc: pop3_adv_desc,
                        adName: pop3_adv_desc,
                      })
                    }
                  >
                    {isPayment ? (
                      <Link to={splicingLink(d.link)} onClick={handleAction}>
                        {content}
                      </Link>
                    ) : (
                      <a
                        href={d.link.startsWith("http") ? d.link : setting.main_web_host}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {content}
                      </a>
                    )}
                  </SwiperSlide>
                );
              })
            )}
          </Swiper>
        </div>
        <div className="w-full mt-6 flex justify-center mb-10">
          <button className="bg-og w-4/5 p-3 text-white" disabled={loading} onClick={handleAction}>
            {!loading ? t("modal.age_confirmation") : <CircularProgress color="inherit" size={16} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default FourPlate;
