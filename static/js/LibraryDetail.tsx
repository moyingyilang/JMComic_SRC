import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard, Scrollbar } from "swiper/modules";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Loading from "../../components/Common/Loading";
import { FETCH_CREATOR_WORK_INFO_THUNK, FETCH_CREATOR_WORK_INFO_DETAIL_THUNK } from "../../actions/creatorAction";
import { CLEAR_CREATOR_LIST } from "../../reducers/creatorReducer";
import { getMarkColor } from "../../utils/Function";
import { GoBack } from "../../Hooks";

const LibraryDetail = () => {
  const { config } = useGlobalConfig();
  const { setting, logined } = config;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { creatorWorkInfo, creatorWorkInfoDetail, isLoading } = useAppSelector((state) => state.creator);
  const [related, setRelated] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryId = searchParams.get("id") as string;
  const creatorId = searchParams.get("creatorId") as string;

  useEffect(() => {
    if (queryId) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      dispatch(CLEAR_CREATOR_LIST("creatorWorkInfoDetail"));
      dispatch(FETCH_CREATOR_WORK_INFO_THUNK(queryId));
      dispatch(FETCH_CREATOR_WORK_INFO_DETAIL_THUNK(queryId));
    }
  }, [queryId]);

  return (
    <>
      {isLoading && <Loading />}
      <div className="dark:bg-gray-800 transition-all duration-300">
        <div className="sticky top-0 h-14 bg-bbk text-white flex items-center p-2 py-3 z-50">
          <GoBack back={creatorId !== "null" ? `/library/list?creatorId=${creatorId}` : "/"} />
          <p className="ml-4 w-11/12">{creatorWorkInfo.work_title}</p>
        </div>
        <div className="min-h-screen bg-white w-full text-center pt-2 pb-16">
          <div className="text-left px-4 my-10" dangerouslySetInnerHTML={{ __html: creatorWorkInfoDetail.content }} />
          {creatorWorkInfoDetail.images?.length > 0 &&
            creatorWorkInfoDetail.images.map((d: any, i: number) => (
              <img
                key={d.page}
                src={d.image || `/images/chapter_default.jpg`}
                alt={d.page}
                loading="lazy"
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.opacity = "1";
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/chapter_default.jpg";
                }}
                width="100%"
                height="auto"
                className="object-contain bg-gy"
                style={{
                  opacity: "0",
                  transition: "opacity 0.5s ease-in-out",
                }}
              />
            ))}
        </div>
        <div className="w-full fixed bottom-0 bg-bbk text-white p-1">
          <div className="flex items-start justify-between p-2 pb-4">
            <p>
              {" "}
              {related
                ? `${t("library.related_works")}→${t("library.swipe_right_for_more")}→`
                : t("library.related_works")}
            </p>
            <p className="flex items-center" onClick={() => setRelated(!related)}>
              {related ? (
                <>
                  {t("library.collapse")}
                  <KeyboardArrowUpIcon />
                </>
              ) : (
                <ExpandMoreIcon />
              )}
            </p>
          </div>
          {related && (
            <Swiper
              slidesPerView={3.5}
              centeredSlides={false}
              slidesPerGroupSkip={3.5}
              spaceBetween={16}
              grabCursor={true}
              keyboard={{
                enabled: true,
              }}
              breakpoints={{
                769: {
                  slidesPerView: 4,
                  slidesPerGroup: 4,
                  spaceBetween: 20,
                },
              }}
              scrollbar={true}
              modules={[Keyboard, Scrollbar, Pagination]}
              className="mySwiper2"
            >
              {Array.isArray(creatorWorkInfo.related_works) &&
                creatorWorkInfo.related_works?.length > 0 &&
                creatorWorkInfo.related_works.map((d) => (
                  <SwiperSlide key={d.id} className="bg-white text-black text-center relative">
                    <Link to={`/library/list/detail?creatorId=${creatorId}&id=${d.id}`}>
                      <img
                        src={`${setting.img_host}${d.work_image}`}
                        alt={d.id}
                        loading="lazy"
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = "1";
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/chapter_default.jpg";
                        }}
                        width="100%"
                        height="auto"
                        className="object-cover h-32 bg-gy"
                        style={{
                          opacity: "0",
                          transition: "opacity 0.5s ease-in-out",
                        }}
                      />
                    </Link>
                    <div
                      className="absolute right-2 top-2 rounded-lg text-white p-[0.2rem]"
                      style={{ ...getMarkColor(d.platform_name) }}
                    >
                      {d.platform_name}
                    </div>
                    <p className="truncate font-bold text-sm p-2">{d.work_title}</p>
                  </SwiperSlide>
                ))}
            </Swiper>
          )}
        </div>
      </div>
    </>
  );
};
export default LibraryDetail;
