import CircularProgress from "@mui/material/CircularProgress";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Autoplay, Keyboard, Pagination, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FETCH_LATEST_HANIME_THUNK, FETCH_MOVIES_LIST_THUNK } from "../../actions/moviesAction";
import AdComponent from "../../components/Ads/AdComponent";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import ClickPagination from "../../components/Common/ClickPagination";
import Header from "../../components/Common/Header";
import Loading from "../../components/Common/Loading";
import TopBtn from "../../components/Common/TopBtn";
import BottomNav from "../../components/Main/BottomNav";
import MemberModal from "../../components/Modal/MemberModal";
import Content from "../../components/Movies/Content";
import { useGlobalConfig } from "../../GlobalContext";
import {
  CLEAR_MOVIES_STATE,
  LOAD_MOVIES_LIST,
  SET_SELECTED_SEARCHQUERY,
  SET_SELECTED_SUBCATEGORY,
  SET_SELECTED_VIDEOTYPE,
} from "../../reducers/moviesReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getRandomAdsItems, renderText } from "../../utils/Function";
import { defaultUserFormData } from "../../utils/InterFace";
import { useScrollToTop } from "../../Hooks";

const Movies = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollToTop = useScrollToTop();
  const [searchParams, setSearchParams] = useSearchParams();
  const { config, setConfig } = useGlobalConfig();
  const { memberInfo, ads, logined, paginationMode } = config;
  const { ref, inView } = useInView();
  const [page, setPage] = useState(() => Number(sessionStorage.getItem("moviesLoadMore")) || 1);
  const { t } = useTranslation();
  const [isSwiping, setIsSwiping] = useState(false);
  const [dialogOpen, setDialogOpen] = useState({ login: false, signUp: false, forgot: false });
  const [formData, setFormData] = useState(defaultUserFormData);
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const [pendingPrivateChat, setPendingPrivateChat] = useState(false);

  const isEmpty = (obj: object) => Object.keys(obj).length === 0;

  const {
    moviesList,
    // exclusiveList,
    latestHanime,
    isLoading,
    isLoadMore,
    isRefreshing,
    selectedVideoType,
    selecteSubCategory,
    selectedSearchQuery,
  } = useAppSelector((state) => state.movies);

  const categories = [
    { label: t("movies.category.adult"), videoType: "movie", searchQuery: "" },
    { label: t("movies.category.hanime"), videoType: "video", searchQuery: "" },
    { label: t("movies.category.cosplay"), videoType: "cos", searchQuery: "" },
    // { label: t("movies.category.private_chat"), videoType: "private_chat", searchQuery: "" },
    // { label: t("movies.category.dirt"), videoType: "dirt", searchQuery: "" },
  ];

  const exclusiveSubCategories = [
    { label: t("movies.incx"), sub_category: "incx" },
    { label: t("movies.self"), sub_category: "self" },
    { label: t("movies.yiji"), sub_category: "yiji" },
    { label: t("movies.dytw"), sub_category: "dytw" },
    { label: t("movies.glam"), sub_category: "glam" },
    { label: t("movies.nrec"), sub_category: "nrec" },
    { label: t("movies.kstr"), sub_category: "kstr" },
    { label: t("movies.goss"), sub_category: "goss" },
    { label: t("movies.oddw"), sub_category: "oddw" },
  ];

  const pageLimit = moviesList.total ? Math.ceil(moviesList.total / 40) : 1;
  const hasNextPage = page < pageLimit && pageLimit > 1;

  const currentVideoType = searchParams.get("videoType") || "movie";
  const currentSearchQuery = searchParams.get("searchQuery") || "";
  const currentSubCategory = searchParams.get("subCategory") || "";

  const getPath = () => {
    if (selectedVideoType === "dirt" && selecteSubCategory) {
      return `${location.pathname}?videoType=${selectedVideoType}&subCategory=${selecteSubCategory}`;
    } else {
      return `${location.pathname}?videoType=${selectedVideoType}&searchQuery=${selectedSearchQuery}`;
    }
  };

  sessionStorage.setItem("fromPage", getPath());

  useEffect(() => {
    const path = sessionStorage.getItem("fromPage");
    setSearchParams(new URLSearchParams(path?.split("?")[1] || ""));
  }, []);

  // sessionStorage.setItem(
  //   "fromPage",
  //   `${location.pathname}?videoType=${currentVideoType}&searchQuery=${currentSearchQuery}&subCategory=${currentSubCategory}`
  // );

  const displayTitle = categories.find((cat) => cat.videoType === currentVideoType)?.label || t("movies.title");

  const loadList = useCallback(
    (isLoadMore = false, isRefreshing = false, delay = 0, pageNum = 1) => {
      dispatch(LOAD_MOVIES_LIST({ isLoading: true, isLoadMore, isRefreshing }));
      if (!isLoadMore) {
        setPage(1);
        scrollToTop();
        sessionStorage.setItem("moviesLoadMore", "1");
        dispatch(CLEAR_MOVIES_STATE("moviesList"));
      }

      setTimeout(() => {
        dispatch(
          FETCH_MOVIES_LIST_THUNK({
            page: pageNum,
            video_type: selectedVideoType,
            search_query: selectedVideoType !== "dirt" ? currentSearchQuery : undefined,
            sub_category: selectedVideoType === "dirt" && selecteSubCategory ? selecteSubCategory : undefined,
          })
        );
      }, delay);
    },
    [dispatch, selectedVideoType, currentSearchQuery, selecteSubCategory]
  );

  // 統一處理取得 token 並跳轉
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClose = () => setShowConfirm(true);
  const handleConfirm = () => {
    setShowConfirm(false);
    setIframeUrl(null);
    dispatch(LOAD_MOVIES_LIST({ isLoading: false }));
  };

  const handleCancel = () => setShowConfirm(false);

  const [showPermissionAlert, setShowPermissionAlert] = useState(false);

  // const checkPermissions = async (): Promise<boolean> => {
  //   try {
  //     const timeoutPromise = new Promise<never>((_, reject) => {
  //       setTimeout(() => {
  //         reject(new Error("PERMISSION_TIMEOUT"));
  //       }, 1000);
  //     });

  //     const stream = await Promise.race([
  //       navigator.mediaDevices.getUserMedia({
  //         video: true,
  //         audio: true,
  //       }),
  //       timeoutPromise,
  //     ]);

  //     stream.getTracks().forEach((track) => track.stop());

  //     return true;
  //   } catch (err: any) {
  //     console.warn("權限被拒絕:", err?.name || err?.message);

  //     return false;
  //   }
  // };

  // const [cameFromSettings, setCameFromSettings] = useState(false);

  // const openAppSettings = () => {
  //   if ((window as any).__openNativeSettings) {
  //     (window as any).__openNativeSettings();
  //   }
  // };

  // useEffect(() => {
  //   const handleAppResumed = async () => {
  //     if (!cameFromSettings) return; // 不是從設定回來就忽略
  //     setCameFromSettings(false);

  //     const hasPermission = await checkPermissions();
  //     if (hasPermission) {
  //       // 有權限了，直接進 iframe
  //       setShowPermissionAlert(false);
  //       dispatch(LOAD_MOVIES_LIST({ isLoading: true }));
  //       try {
  //         const result = await dispatch(FETCH_BAITU_TOKEN_THUNK()).unwrap();
  //         const token = result.data?.token;
  //         if (token) {
  //           setIframeUrl(`https://baitu.app/auth/sso?utm_source=jmbaitu&token=${token}`);
  //         }
  //       } catch (error) {
  //         console.error("獲取token失敗", error);
  //       } finally {
  //         dispatch(LOAD_MOVIES_LIST({ isLoading: false }));
  //       }
  //     }
  //     // 沒有權限就什麼都不做，讓使用者自己再點
  //   };

  //   window.addEventListener("appResumed", handleAppResumed);
  //   return () => window.removeEventListener("appResumed", handleAppResumed);
  // }, [cameFromSettings, dispatch]);

  // const fetchTokenAndRedirect = async () => {
  //   const hasPermission = await checkPermissions();
  //   if (!hasPermission) {
  //     setShowPermissionAlert(true);
  //     return;
  //   }

  //   dispatch(LOAD_MOVIES_LIST({ isLoading: true }));
  //   try {
  //     const result = await dispatch(FETCH_BAITU_TOKEN_THUNK()).unwrap();
  //     const token = result.data?.token;
  //     if (token) {
  //       setIframeUrl(`https://baitu.app/auth/sso?utm_source=jmbaitu&token=${token}`);
  //     }
  //   } catch (error) {
  //     console.error("獲取token失敗", error);
  //   } finally {
  //     dispatch(LOAD_MOVIES_LIST({ isLoading: false }));
  //   }
  // };

  // 登入成功後自動觸發
  // useEffect(() => {
  //   if (pendingPrivateChat && !isEmpty(memberInfo)) {
  //     fetchTokenAndRedirect().finally(() => setPendingPrivateChat(false));
  //   }
  // }, [memberInfo, pendingPrivateChat]);

  // const iframeRef = useRef<HTMLIFrameElement>(null);

  // // iframe 獲得焦點後，確保可以持續互動
  // useEffect(() => {
  //   const iframe = iframeRef.current;
  //   if (!iframe) return;

  //   const handleBlur = () => {
  //     // 短暫延遲後讓 iframe 重新獲得焦點
  //     setTimeout(() => iframe.contentWindow?.focus(), 100);
  //   };

  //   window.addEventListener("blur", handleBlur);
  //   return () => window.removeEventListener("blur", handleBlur);
  // }, [iframeUrl]);

  const handleCategoryClick = async (videoType: string, subCategory: string, searchQuery = "") => {
    // 私訊聊天室：需要先確認登入狀態
    // if (videoType === "private_chat") {
    //   if (isEmpty(memberInfo)) {
    //     // 未登入：記錄待處理，開啟登入視窗
    //     setPendingPrivateChat(true);
    //     setDialogOpen({ ...dialogOpen, login: true });
    //   } else {
    //     // 已登入：直接取 token 跳轉
    //     await fetchTokenAndRedirect();
    //   }
    //   return;
    // }
    // 一般分類：更新選中的影片類型並導頁
    dispatch(SET_SELECTED_VIDEOTYPE(videoType));

    const params = new URLSearchParams({ videoType });

    if (videoType === "dirt") {
      dispatch(SET_SELECTED_SUBCATEGORY(subCategory));
      params.set("subCategory", subCategory);
    } else {
      params.set("searchQuery", searchQuery);
    }

    navigate(`/movies?${params.toString()}`);
  };

  const handleRefresh = () => {
    loadList(false, true);
  };

  // const getExclusiveList = async () => {
  //   await dispatch(
  //     FETCH_MOVIES_LIST_THUNK({
  //       page: 1,
  //       search_query: "",
  //       video_type: "movie_exclude",
  //     })
  //   ).unwrap();
  // };

  useEffect(() => {
    // if (exclusiveList.list?.length === 0) {
    // getExclusiveList();
    // }
    if (currentSearchQuery !== "") {
      dispatch(SET_SELECTED_SEARCHQUERY(selectedSearchQuery));
    }

    if (
      !moviesList.list?.length ||
      currentVideoType !== selectedVideoType ||
      currentSearchQuery !== selectedSearchQuery ||
      selecteSubCategory !== currentSubCategory
    ) {
      loadList();
    }
    if (!latestHanime?.length) {
      dispatch(FETCH_LATEST_HANIME_THUNK());
    }
  }, [dispatch, latestHanime?.length, selectedVideoType, selecteSubCategory, selectedSearchQuery]);

  // }, [dispatch, exclusiveList.list?.length, latestHanime?.length, selectedVideoType, selectedSearchQuery]);

  // isLoadMore(redux)要等 dispatch/re-render 才會變 true，這段空窗期若連續觸發
  // 好幾次，會用到還沒更新的 isLoadMore/page 導致重複打同一頁 API，改用 ref 同步鎖住
  const isFetchingRef = useRef(false);
  useEffect(() => {
    if (!isLoadMore) isFetchingRef.current = false;
  }, [isLoadMore]);

  const loadMore = useCallback(() => {
    if (!inView || !hasNextPage || isLoadMore || isFetchingRef.current) return;
    isFetchingRef.current = true;
    const nextPage = page + 1;
    setPage(nextPage);
    sessionStorage.setItem("moviesLoadMore", String(nextPage));
    loadList(true, false, 1000, nextPage);
  }, [inView, hasNextPage, isLoadMore, page]);

  // 只在 inView 真的改變（使用者捲動）時才嘗試載入下一頁，並debounce一下，
  // 避免圖片載入造成版面高度變動、讓偵測元素短時間內連續進出可視範圍，觸發好幾次
  const loadMoreRef = useRef(loadMore);
  useEffect(() => {
    loadMoreRef.current = loadMore;
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMoreRef.current();
    }, 300);
    return () => clearTimeout(timer);
  }, [inView]);

  // click pagination
  const goToPage = (value: number) => {
    const targetPage = Math.min(Math.max(value, 1), pageLimit);
    loadList(false, false, 0, targetPage);
    setPage(targetPage);
    sessionStorage.setItem("moviesLoadMore", String(targetPage));
  };

  const adKey = "app_movies_top_banner";
  const movieAds = ads[adKey]?.advs;

  const movieRandomIndex = useMemo(() => {
    return getRandomAdsItems(movieAds, movieAds?.length, "movie_banner_ads").indexes;
  }, [movieAds]);

  return (
    <div className="dark:bg-bk transition-all duration-300">
      {isLoading && <Loading />}
      <div className="sticky top-safe w-full bg-[#242424] text-white z-50">
        <Header />
        <div className="flex items-center space-x-6 p-2 text-tgy bg-nbk">
          {categories.map(({ label, videoType, searchQuery }, index) => (
            <button
              key={label}
              onClick={() => {
                if (videoType === "dirt") {
                  handleCategoryClick(videoType, "incx", searchQuery);
                } else {
                  handleCategoryClick(videoType, "", searchQuery);
                }
              }}
              className={`pb-1 ${
                selectedVideoType === videoType ? "text-orange-500 border-b-2 border-orange-500" : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {selectedVideoType === "dirt" && (
          <div className="flex items-center space-x-4 px-2 pb-2 overflow-x-auto scrollbar-hidden bg-nbk">
            {exclusiveSubCategories.map(({ label, sub_category }) => (
              <button
                key={label}
                onClick={() => handleCategoryClick("dirt", sub_category)}
                className={`pb-1 whitespace-nowrap ${
                  selecteSubCategory === sub_category ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!memberInfo.ad_free && (
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
          {movieRandomIndex?.map((itemIndex: any) => (
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
                <div
                  className={`w-full ${movieAds?.[itemIndex]?.adv_name?.includes("EXO") ? " flex justify-center" : ""}`}
                >
                  <AdComponent adKey={adKey} adIndex={itemIndex} />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* {selectedVideoType === "movie" && exclusiveList.list?.length > 0 && (
        <div className="p-2">
          <div className="my-3 dark:text-white">{t("movies.exclusive")}</div>
          <Swiper
            spaceBetween={30}
            centeredSlides
            autoplay={{ delay: 5000 }}
            pagination={{ clickable: true }}
            navigation
            modules={[Autoplay, Pagination, Navigation]}
            onTouchStart={() => setIsSwiping(true)}
            onTouchEnd={() => setTimeout(() => setIsSwiping(false), 100)}
            className="mySwiper h-[280px]
            [--swiper-navigation-color:white]
            [--swiper-pagination-color:white]

            [&_.swiper-button-prev]:w-10
            [&_.swiper-button-prev]:h-10
            [&_.swiper-button-prev]:rounded-full
            [&_.swiper-button-prev]:bg-gray-400/50
            [&_.swiper-button-prev]:flex
            [&_.swiper-button-prev]:items-center
            [&_.swiper-button-prev]:justify-center

            [&_.swiper-button-next]:w-10
            [&_.swiper-button-next]:h-10
            [&_.swiper-button-next]:rounded-full
            [&_.swiper-button-next]:bg-gray-400/50
            [&_.swiper-button-next]:flex
            [&_.swiper-button-next]:items-center
            [&_.swiper-button-next]:justify-center

            [&_.swiper-button-prev::after]:text-base
            [&_.swiper-button-next::after]:text-base"
          >
            {exclusiveList.list?.map((d: any, index: number) => (
              <SwiperSlide key={d.id}>
                <Link
                  to={`/movies/${d.id}?videoType=movie&searchQuery=${encodeURIComponent(selectedSearchQuery || "")}`}
                  state={{ video_type: "video" }}
                >
                  <div className="relative">
                    <div
                      className="absolute inset-0 z-10"
                      style={{
                        touchAction: "pan-y",
                        backgroundColor: "transparent",
                      }}
                    />
                    <img
                      src={d?.photo || "/images/title-circle.webp"}
                      alt={`exclusiveImg-${d?.id || "unknown"}`}
                      loading="lazy"
                      decoding="async"
                      className="object-cover"
                    />
                    <div className="bg-gy text-white line-clamp-2 p-1 my-2">{d.title}</div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )} */}

      <PullToRefreshify
        completeDelay={1000}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        renderText={renderText}
        className="overflow-y-visible"
      >
        {selectedVideoType === "video" && latestHanime && (
          <div className="p-2 bg-white dark:bg-nbk">
            <div className="my-3 dark:text-white">{t("movies.latest_hanime")}</div>
            <Swiper modules={[Keyboard, Scrollbar, Pagination]} spaceBetween={8} slidesPerView={2.8} grabCursor>
              {latestHanime.map(({ id, photo, title }, idx) => (
                <SwiperSlide key={idx}>
                  <Link
                    to={`/movies/${id}?videoType=video&searchQuery=${encodeURIComponent(selectedSearchQuery || "")}`}
                    state={{ video_type: "video" }}
                  >
                    <img
                      src={photo ? photo : "/images/cover_default.jpg"}
                      alt={title || "image"}
                      loading="lazy"
                      decoding="async"
                      onLoad={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                      onError={(e) => {
                        const img = e.currentTarget;
                        // 防止 fallback 無限觸發
                        if (!img.src.includes("cover_default.jpg")) {
                          img.src = "/images/cover_default.jpg";
                        }
                      }}
                      width={130}
                      height={190}
                      className="object-cover rounded-md  w-[130px] h-[190px] bg-gy"
                      style={{
                        opacity: 0,
                        transition: "opacity 0.4s ease",
                      }}
                    />
                  </Link>
                  <p className="line-clamp-2 dark:text-white mt-2">{title}</p>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        <div className="border-l-4 border-og pl-2 mt-2  dark:text-white">{displayTitle}</div>
        {/* {moviesList?.list?.length > 0 && selectedVideoType !== "movie_exclude" && ( */}
        {moviesList?.list?.length > 0 && (
          <>
            {/* {selectedVideoType === "dirt" ? (
              <DirtList list={moviesList?.list} demo={false} />
            ) : ( */}
            <Content memberInfo={memberInfo} movie={moviesList.list} videoType={selectedVideoType} />
            {/* )} */}
            {paginationMode === "click" ? (
              <ClickPagination pageLimit={pageLimit} page={page} onChange={goToPage} loading={isLoading} />
            ) : (
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
            )}
          </>
        )}
      </PullToRefreshify>
      <TopBtn />
      <BottomNav currentPage="movies" />
      {iframeUrl && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <button
              className="absolute top-16 right-4 z-[80] flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-gray-200 text-gray-700 shadow-lg"
              onClick={handleClose}
            >
              ✕
            </button>
            {/* <div className="absolute inset-0 pointer-events-none" /> */}
            <div className="relative z-[60] w-[90vw] h-[80vh] bg-white rounded-xl overflow-hidden shadow-2xl">
              <iframe
                src={iframeUrl}
                className="w-full h-full border-none"
                allow=" camera; microphone; clipboard-write"
                allowFullScreen
                style={{
                  pointerEvents: "auto",
                  touchAction: "auto",
                }}
              />
            </div>
          </div>

          {showConfirm && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-xl px-6 py-5 w-72 flex flex-col items-center gap-4">
                <p className="text-gray-800 font-medium text-base">{t("modal.confirm_close_cos_chat")}</p>

                <div className="flex gap-3 w-full">
                  <button
                    className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100"
                    onClick={handleCancel}
                  >
                    {t("member.cancel")}
                  </button>
                  <button className="flex-1 py-2 rounded-xl bg-og text-white hover:bg-og" onClick={handleConfirm}>
                    {t("member.confirm")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* {showPermissionAlert && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-xl px-6 py-5 w-72 flex flex-col items-center gap-4">
            <p className="text-gray-800 font-semibold text-base text-center">需要相機與麥克風權限</p>
            <p className="text-gray-500 text-sm text-center">請開啟相機和麥克風權限，開啟後請重新啟動 App</p>
            <div className="flex gap-3 w-full">
              <button
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100"
                onClick={() => setShowPermissionAlert(false)}
              >
                取消
              </button>
              <button
                className="flex-1 py-2 rounded-xl bg-og text-white"
                onClick={() => {
                  setShowPermissionAlert(false);
                  // openAppSettings();
                }}
              >
                開啟設定
              </button>
            </div>
          </div>
        </div>
      )} */}

      {(dialogOpen.login || dialogOpen.signUp || dialogOpen.forgot) && !logined && (
        <MemberModal
          setFormData={setFormData}
          formData={formData}
          setConfig={setConfig}
          logined={logined}
          isLoading={isLoading}
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          showSnackbar={showSnackbar}
        />
      )}
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
    </div>
  );
};

export default Movies;
