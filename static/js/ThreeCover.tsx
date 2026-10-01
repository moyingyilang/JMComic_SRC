import { CircularProgress } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getRandomAdsItems, getRandomItems } from "../../../utils/Function";
import { trackAdEvent, useAdImpression } from "../../../utils/analytics";

const ThreePlate = (props: any) => {
  const { onNext, config, adFreeStatus, adsFourCoverOpen } = props;
  const { adsContent, setting } = config;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [adsLoading, setAdsLoading] = useState(true);
  const coverLinks = adsContent.link?.exchange_link;
  const coverImgs = adsContent.img;
  const LinksAdd = coverLinks ? coverLinks.show_max - coverLinks.first_links?.length : 1;

  const { items: secondRandomItem } = getRandomItems(coverLinks?.second_links, LinksAdd);
  const allLinks = [...(coverLinks?.first_links || []), ...secondRandomItem];
  const fetchHost = localStorage.getItem("fetchHost");

  const { items: imgRandomItem } = useMemo(() => {
    const advs = coverImgs?.splash_top?.advs;
    if (!(advs?.length > 1)) return { items: advs || [] };
    return getRandomAdsItems(advs, 1, "splash_top");
  }, [coverImgs?.splash_top]);

  const { items: randomItem } = useMemo(() => {
    const advs = coverImgs?.pop1_list?.advs;
    if (!(advs?.length > 1)) return { items: advs || [] };
    return getRandomAdsItems(advs, advs.length, "pop1_ads");
  }, [coverImgs?.pop1_list]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const top_adv_key = coverImgs?.splash_top?.adv_group_name;
  const top_adv_desc = coverImgs?.splash_top?.adv_desc;
  const top_adv_name = imgRandomItem?.title;

  const pop1_adv_key = coverImgs?.pop1_list?.adv_group_name;
  const pop1_adv_desc = coverImgs?.pop1_list?.adv_desc;
  const pop1_adv_name = coverImgs?.pop1_list?.advs[activeIndex]?.title;

  useAdImpression(
    containerRef,
    true,
    () => trackAdEvent("jm3_ad_impression", { adKey: top_adv_key, ad_desc: top_adv_desc, adName: top_adv_name }),
    adsContent?.length
  );

  useAdImpression(
    containerRef,
    true,
    () => trackAdEvent("jm3_ad_impression", { adKey: pop1_adv_key, ad_desc: pop1_adv_desc, adName: pop1_adv_name }),
    adsContent?.length
  );

  useAdImpression(
    containerRef,
    true,
    () =>
      trackAdEvent("jm3_ad_impression", {
        adKey: "exchange_link",
        ad_desc: "exchange_link",
        adName: "exchange_link",
      }),
    adsContent?.length,
    activeIndex
  );

  const handleAction = () => {
    document.body.classList.add("fade");
    setLoading(true);
    if (!adsFourCoverOpen) {
      sessionStorage.setItem("state", JSON.stringify(true));
    }
    setTimeout(() => {
      onNext();
    }, 400);
  };

  useEffect(() => {
    if (adsContent && Object.keys(adsContent).length > 0) {
      setAdsLoading(false);
    }
  }, [adsContent]);

  const splicingLink = (link: string) => {
    const query = link.split("?")[1];
    return query ? `/pay?${query}` : "/pay";
  };

  return (
    <>
      <div className="w-full h-full bg-[#545454] absolute left-0 top-0 z-50" ref={containerRef}>
        <div className="w-9/12 h-[300px] mx-auto flex justify-center items-center mt-14 overflow-hidden">
          {adsLoading ? (
            <img src="/images/loading.gif" alt="loading" width="40px" />
          ) : (
            imgRandomItem.map((d: any) => {
              const isPayment = d.link.includes("payment?");
              const content = (
                <>
                  <img
                    src={d.img.startsWith("http") ? d.img : config.setting?.img_host + d.img}
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
                </>
              );

              const onClick = () =>
                trackAdEvent("jm3_ad_click", {
                  adKey: top_adv_key,
                  ad_desc: top_adv_desc,
                  adName: d.title ?? String(d.id),
                });

              return isPayment ? (
                <Link to={splicingLink(d.link)} key={d.id} onClick={onClick}>
                  {content}
                </Link>
              ) : (
                <a
                  href={d.link.startsWith("http") ? d.link : setting.main_web_host}
                  key={d.id}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onClick}
                >
                  {content}
                </a>
              );
            })
          )}
        </div>
        {!adFreeStatus && (
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
                        src={d.img.startsWith("http") ? d.img : config.setting?.img_host + d.img}
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
                    </>
                  );

                  const onClick = () =>
                    trackAdEvent("jm3_ad_click", {
                      adKey: pop1_adv_key,
                      ad_desc: pop1_adv_desc,
                      adName: d.title ?? String(d.id),
                    });

                  return (
                    <SwiperSlide key={d.id}>
                      {isPayment ? (
                        <Link to={splicingLink(d.link)} onClick={onClick}>
                          {content}
                        </Link>
                      ) : (
                        <a
                          href={d.link.startsWith("http") ? d.link : setting.main_web_host}
                          target="_blank"
                          rel="noreferrer"
                          onClick={onClick}
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
        )}
        <div className="w-full mt-6 flex justify-center">
          <button className="bg-og w-4/5 p-3 text-white" disabled={loading} onClick={handleAction}>
            {!loading ? t("modal.age_confirmation") : <CircularProgress color="inherit" size={16} />}
          </button>
        </div>
        {!adFreeStatus && (
          <div className="grid grid-rows-3 grid-cols-3 gap-4 mt-6 mx-6">
            {allLinks.map((d: any, i: number) => (
              <a
                key={i}
                href={d.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 text-center rounded flex flex-col items-center justify-center text-og"
                onClick={() =>
                  trackAdEvent("jm3_ad_click", { adKey: "exchange_link", ad_desc: "exchange_link", adName: d.text })
                }
              >
                <span style={{ color: d.color }}>{d.text}</span>
              </a>
            ))}
          </div>
        )}
        <div className="fixed bottom-2 left-0 right-0 flex justify-between px-6 py-1 text-white">
          <span>© 2008-2025 禁漫天堂</span>
          <span>
            JM v{config.version}（{fetchHost}）
          </span>
        </div>
      </div>
    </>
  );
};

export default ThreePlate;
