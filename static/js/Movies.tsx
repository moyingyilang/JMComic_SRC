import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { FETCH_MOVIES_LIST_THUNK, FETCH_LATEST_HANIME_THUNK } from "../../actions/moviesAction";
import {
  LOAD_MOVIES_LIST,
  CLEAR_MOVIES_STATE,
  SET_SELECTED_VIDEOTYPE,
  SET_SELECTED_SEARCHQUERY,
} from "../../reducers/moviesReducer";
import BottomNav from "../../components/Main/BottomNav";
import TopBtn from "../../components/Common/TopBtn";
import Content from "../../components/Movies/Content";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Keyboard, Scrollbar } from "swiper/modules";
import { useGlobalConfig } from "../../GlobalContext";
import CircularProgress from "@mui/material/CircularProgress";
import AdComponent from "../../components/Ads/AdComponent";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { renderText } from "../../utils/Function";
import { useInView } from "react-intersection-observer";
import Header from "../../components/Common/Header";
import { useTranslation } from "react-i18next";
import Loading from "../../components/Common/Loading";

const Movies = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { config } = useGlobalConfig();
  const { setting, ads } = config;
  const { ref, inView } = useInView();
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const [isSwiping, setIsSwiping] = useState(false);

  sessionStorage.setItem(
    "fromPage",
    `${location.pathname}?videoType=${searchParams.get("videoType") || "movie"}&searchQuery=${
      searchParams.get("searchQuery") || ""
    }`
  );

  const { moviesList, latestHanime, isLoading, isLoadMore, isRefreshing, selectedVideoType, selectedSearchQuery } =
    useAppSelector((state) => state.movies);

  const categories = [
    { label: t("movies.category.adult"), videoType: "movie", searchQuery: "" },
    { label: t("movies.category.uncensored"), videoType: "movie", searchQuery: t("movies.category.uncensored") },
    { label: t("movies.category.hanime"), videoType: "video", searchQuery: "" },
    { label: t("movies.category.outflow"), videoType: "iqiye", searchQuery: "" },
    { label: t("movies.category.cosplay"), videoType: "cos", searchQuery: "" },
  ];

  const pageLimit = moviesList.list?.length ? Math.ceil(moviesList.total / 40) : 0;
  const hasNextPage = page <= pageLimit;

  const sessionVideoType = sessionStorage.getItem("movieType");
  const sessionSearchQuery = sessionStorage.getItem("movieQuery");

  const urlVideoType = searchParams.get("videoType");
  const urlSearchQuery = searchParams.get("searchQuery");

  const currentVideoType = urlVideoType || sessionVideoType || "movie";
  const currentSearchQuery = urlSearchQuery || sessionSearchQuery || "";

  // 優先根據 currentVideoType 和 currentSearchQuery 配對
  const matched = categories.find((c) => c.videoType === currentVideoType && c.searchQuery === currentSearchQuery);

  // fallback 僅根據 currentVideoType（忽略 searchQuery）
  const fallback = categories.find((c) => c.videoType === currentVideoType && c.searchQuery === "");
  const displayTitle =
    matched?.label ||
    (fallback ? fallback.label + (selectedSearchQuery ? `-${selectedSearchQuery}` : "") : selectedVideoType);

  // 計算 realSelectedIndex
  const realSelectedIndex = matched
    ? categories.findIndex((c) => c.videoType === matched.videoType && c.searchQuery === matched.searchQuery)
    : fallback
    ? categories.findIndex((c) => c.videoType === fallback.videoType && c.searchQuery === "")
    : 0;

  const loadList = useCallback(
    (isLoadMore = false, isRefreshing = false, delay = 0, pageNum = 1) => {
      dispatch(LOAD_MOVIES_LIST({ isLoading: true, isLoadMore, isRefreshing }));
      if (!isLoadMore) {
        setPage(1);
        dispatch(CLEAR_MOVIES_STATE("moviesList"));
      }
      setTimeout(() => {
        dispatch(
          FETCH_MOVIES_LIST_THUNK({
            page: pageNum,
            search_query: currentSearchQuery === "无码破解版" ? "馬賽克破壞版" : currentSearchQuery,
            video_type: currentVideoType,
          })
        );
      }, delay);
    },
    [dispatch, searchParams]
  );

  const handleCategoryClick = (video_type: string, searchQuery = "") => {
    navigate(`/movies?videoType=${video_type}&searchQuery=${encodeURIComponent(searchQuery)}`);
    sessionStorage.setItem("movieType", video_type);
    sessionStorage.setItem("movieQuery", searchQuery);
  };

  const handleRefresh = () => {
    loadList(false, true);
  };

  const loadMore = useCallback(() => {
    if (!hasNextPage) return;

    if (inView && hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadList(true, false, 1000, nextPage);
    }
  }, [inView, hasNextPage]);

  useEffect(() => {
    const videoTypeParam = searchParams.get("videoType") || "movie";
    const searchQueryParam = searchParams.get("searchQuery") || "";

    dispatch(SET_SELECTED_VIDEOTYPE(videoTypeParam));
    dispatch(SET_SELECTED_SEARCHQUERY(searchQueryParam));

    const hasSearchParams = searchParams.get("videoType") || searchParams.get("searchQuery");

    const shouldFetch = hasSearchParams || !moviesList.list || moviesList.list.length === 0;

    if (shouldFetch) {
      setTimeout(() => {
        loadList();
        if (videoTypeParam === "video") {
          dispatch(FETCH_LATEST_HANIME_THUNK({}));
        }
      }, 0);
    }
  }, [searchParams]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  return (
    <div className="dark:bg-bbk transition-all duration-300">
      {isLoading && <Loading />}
      <div className="sticky top-0 w-full bg-[#242424] text-white z-50">
        <Header />
        <div className="flex items-center space-x-6 p-2">
          {categories.map(({ label, videoType, searchQuery }, index) => {
            const isSelected = index === realSelectedIndex;
            return (
              <button
                key={label}
                onClick={() => {
                  handleCategoryClick(videoType, searchQuery);
                }}
                className={`pb-1 ${isSelected ? "text-orange-500 border-b-2 border-orange-500" : ""}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <Swiper
        spaceBetween={30}
        centeredSlides
        autoplay={{ delay: 5000 }}
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        onTouchStart={() => setIsSwiping(true)}
        onTouchEnd={() => setTimeout(() => setIsSwiping(false), 100)}
        className="mySwiper h-[250px]"
      >
        {config.ads["app_movies_top_banner"]?.advs?.map((_: null, index: number) => (
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
              <AdComponent adKey="app_movies_top_banner" adIndex={index} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <PullToRefreshify
        completeDelay={1000}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        renderText={renderText}
        className="overflow-y-visible"
      >
        {selectedVideoType === "video" && latestHanime && (
          <div className="p-2">
            <div className="my-3 dark:text-white">{t("movies.latest_hanime")}</div>
            <Swiper modules={[Keyboard, Scrollbar, Pagination]} spaceBetween={8} slidesPerView={2.8} grabCursor>
              {latestHanime.map(({ id, photo, title }, idx) => (
                <SwiperSlide key={idx}>
                  <Link
                    to={`/movies/${id}?videoType=video&searchQuery=${encodeURIComponent(selectedSearchQuery || "")}`}
                    state={{ video_type: "video" }}
                  >
                    <img className="w-full h-full object-cover rounded" src={photo} alt={title} />
                  </Link>
                  <p className="line-clamp-2 dark:text-white">{title}</p>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        <div className="border-l-4 border-og pl-2 mt-2  dark:text-white">{displayTitle}</div>

        {moviesList?.list?.length > 0 && (
          <>
            <Content movie={moviesList.list} videoType={selectedVideoType} />
            {(() => {
              const total = moviesList?.total || 0;
              const hasNextPage = (moviesList?.list?.length || 0) < total;
              return (
                <button ref={ref} onClick={loadMore} className="w-full flex justify-center pb-40">
                  {hasNextPage ? (
                    <div className="flex items-center">
                      <CircularProgress color="inherit" size={12} />
                      <p className="ml-2">{t("movies.loading")}</p>
                    </div>
                  ) : (
                    <p className="text-center">{t("movies.no_more_content")}</p>
                  )}
                </button>
              );
            })()}
          </>
        )}
      </PullToRefreshify>
      <TopBtn />
      <BottomNav currentPage="movies" />
    </div>
  );
};

export default Movies;
