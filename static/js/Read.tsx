import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useInView } from "react-intersection-observer";
import ShareIcon from "@mui/icons-material/Share";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import CloseIcon from "@mui/icons-material/Close";
import Series from "../../components/Comic/Series";
import Comment from "../../components/Comic/Comment";
import ReadNav from "../../components/Comic/ReadNav";
import Share from "../../components/Comic/Share";
import MsgModal from "../../components/Modal/MsgModal";
import DialogModal from "../../components/Modal/DialogModal";
import MemberModal from "../../components/Modal/MemberModal";
import Loading from "../../components/Common/Loading";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import { FETCH_DETAIL_THUNK, FETCH_COMIC_READ_THUNK } from "../../actions/detailAction";
import { FETCH_POST_NOTIFICATIONS_SERTRACK_THUNK } from "../../actions/memberAction";
import { CLEAR_DETIAL_LIST, LOAD_COMBIC_DETIAL_LIST, RESET_DETAIL_STATE } from "../../reducers/detailReducer";
import { RESET_FORUM_STATE } from "../../reducers/forumReducer";
import { defaultUserFormData } from "../../utils/InterFace";
import { GoBack, useDelayedFlag, useScrambleTracker } from "../../Hooks";
import { chunkArray, scramble_image } from "../../utils/Function";
import AdComponent from "../../components/Ads/AdComponent";
import { Capacitor } from "@capacitor/core";

const Read = () => {
  const navigate = useNavigate();
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined } = config;
  const { t } = useTranslation();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const readRules = t("detail.read_rules", { returnObjects: true });
  const [dialogOpen, setDialogOpen] = useState({
    readSource: false,
    login: false,
    signUp: false,
    forgot: false,
    newTopic: false,
    folder: false,
    series: false,
    comment: false,
  });
  const [isVertical, setIsVertical] = useState(true);
  const [formData, setFormData] = useState(defaultUserFormData);
  const dispatch = useAppDispatch();
  const { detailList, readList, isLoading } = useAppSelector((state) => state.detail);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryId = searchParams.get("id") as string;
  const readId = searchParams.get("readId") as string;
  const queryEp = searchParams.get("episode") as string;
  const querySubEp = searchParams.get("subEpisode") as string;
  const [readImgSource, setReadImgSource] = useState<any[]>([]);
  const [share, setShare] = useState(false);
  const [closeNav, setCloseNav] = useState(false);
  const [msgOpen, setMsgOpen] = useState({ detail: false, detailDownload: false, readTrack: false });
  const [changeCurrentPage, setChangeCurrentPage] = useState({ prev: true, next: true });
  const [seriesGroups, setSeriesGroups] = useState<any>({
    menus: [],
    episode: Number(queryEp),
    subEpisode: querySubEp,
    currentChapterId: readId,
  });
  const [readHistory, setReadHistory] = useState<string[]>(() => {
    const historyStored = localStorage.getItem("read");
    return historyStored ? JSON.parse(historyStored) : [];
  });
  const imageCount = readList.images?.length + 3 || 1;
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [scrollProgress, setScrollProgress] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    sessionStorage.removeItem("searchQuery");

    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const hasShownVolumeHint = localStorage.getItem("hasShownVolumeHint");

      if (!hasShownVolumeHint) {
        const timer = setTimeout(() => {
          showSnackbar("可使用音量鍵＋翻頁", "success");
          localStorage.setItem("hasShownVolumeHint", "true");
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    setScrollProgress(1);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    dispatch(CLEAR_DETIAL_LIST("readList"));
    dispatch(RESET_FORUM_STATE());
    if (readId && queryId) {
      dispatch(FETCH_COMIC_READ_THUNK(readId));
      dispatch(FETCH_DETAIL_THUNK(queryId));
    }
    if (swiperRef.current?.swiper && !isVertical) {
      swiperRef.current.swiper.slideTo(0, 0);
    }
  }, [readId, queryId, isVertical, config.app_img_shunt]);

  const loadImages = async () => {
    dispatch(LOAD_COMBIC_DETIAL_LIST({ isLoading: true }));
    const imagesContain = imgRefs.current;
    const indexesToLoad = [
      scrollProgress - 2,
      scrollProgress - 1,
      scrollProgress,
      scrollProgress + 1,
      scrollProgress + 2,
    ];

    try {
      for (const index of indexesToLoad) {
        const img = imagesContain[index];
        if (!img) continue;

        const existingCanvas = img.nextElementSibling;
        const isCanvasMissingOrInvalid = !(existingCanvas instanceof HTMLCanvasElement);

        if (isCanvasMissingOrInvalid) {
          await new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
            }
          });

          // 進行 scramble 圖片處理
          await scramble_image(img, readList.id, readList.scramble_id, img.alt);

          const canvas = img.nextElementSibling;

          if (canvas instanceof HTMLCanvasElement) {
            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.addEventListener("click", () => {
              setCloseNav((prev) => !prev);
            });
            canvas.addEventListener("contextmenu", (e) => {
              e.preventDefault();
            });
          }
          if (canvas === null || img.src.indexOf(".gif") === 0) {
            img.classList.remove("opacity-0");
            img.style.opacity = "1";
            img.dataset.noScrambleMark = "noScramble";
            img.addEventListener("click", () => {
              setCloseNav((prev) => !prev);
            });
          }

          dispatch(LOAD_COMBIC_DETIAL_LIST({ isLoading: false }));
        }
      }
    } finally {
      dispatch(LOAD_COMBIC_DETIAL_LIST({ isLoading: false }));
    }
  };

  useEffect(() => {
    if (readList.images?.length > 0 && imgRefs.current?.length > 0) {
      loadImages();
    }
  }, [readList, scrollProgress]);

  // 直向滾動監聽
  useEffect(() => {
    if (isVertical && !isLoading) {
      let lastScrollTop = 0;
      let accumulatedScrollDown = 0;
      let accumulatedScrollUp = 0;

      const handleScroll = () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        // 處理進度邏輯
        const { images, total_page } = readList;
        const progress = Math.ceil((scrollTop / scrollHeight) * imageCount);

        if (images?.length) {
          setScrollProgress(progress);

          if (detailList.series?.length > 0) {
            const thirdLastImageIndex = total_page - 3;
            const lastObject = detailList.series[detailList.series.length - 1];
            const storedData = localStorage.getItem("dontShowExpiry");
            if (progress === thirdLastImageIndex && querySubEp === lastObject.sort) {
              setMsgOpen({ ...msgOpen, readTrack: storedData === null });
            }
          }
        }

        // 滾動方向與距離累加
        const delta = scrollTop - lastScrollTop;

        if (delta > 0) {
          // 向下滾動
          accumulatedScrollDown += delta;
          accumulatedScrollUp = 0;

          if (accumulatedScrollDown >= 2000) {
            const canvasList = document.querySelectorAll("canvas");
            if (canvasList.length > 0) {
              canvasList[0].remove();
            }
            accumulatedScrollDown = 0;
          }
        } else if (delta < 0) {
          // 向上滾動
          accumulatedScrollUp += Math.abs(delta);
          accumulatedScrollDown = 0;

          if (accumulatedScrollUp >= 2000) {
            const canvasList = document.querySelectorAll("canvas");
            if (canvasList.length > 0) {
              canvasList[canvasList.length - 1].remove();
            }
            accumulatedScrollUp = 0;
          }
        }
        lastScrollTop = scrollTop;
      };

      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [readList, detailList, isVertical]);

  // 進度條移動變化
  const scrollToProgress = (progress: number) => {
    const totalPages = Math.max(imageCount, 1);
    const adHight = 600;

    const { scrollHeight, clientHeight } = document.documentElement;
    const maxScroll = scrollHeight - adHight - clientHeight;
    if (maxScroll <= 0) return;

    const percentage = progress / totalPages;

    window.scrollTo({
      top: percentage * maxScroll,
      behavior: "smooth",
    });
  };

  // 進度條點擊
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const newProgress = newValue as number;

    if (isVertical) {
      scrollToProgress(newProgress);
    } else {
      if (swiperRef.current) {
        swiperRef.current.swiper.slideTo((newValue as number) - 1);
        setScrollProgress(newProgress);
      }
    }
  };

  // 橫向移動監聽
  const handleSwiperSlideChange = (swiper: SwiperClass) => {
    const displayPage = swiper.activeIndex + 1;
    setScrollProgress(displayPage);
    if (swiperRef.current) {
      const canvasList = document.querySelectorAll("canvas");
      if (swiperRef.current.swiper.realIndex % 5 === 0 && canvasList.length > 0) canvasList[0].remove();
    }
  };

  // 音量鍵改變進度條
  useEffect(() => {
    if (isLoading) return;
    let lastTriggerTime = 0;
    const throttleTime = 150;

    function onVolumeKeyPressed(e: any) {
      const now = Date.now();
      if (now - lastTriggerTime < throttleTime) return;
      lastTriggerTime = now;

      const { direction } = e.detail || {};

      setScrollProgress((prev) => {
        let newProgress = prev;

        if (direction === "up") {
          newProgress = Math.max(0, prev - 1);
        } else if (direction === "down") {
          newProgress = Math.min(imageCount - 1, prev + 1);
        }

        if (isVertical) {
          scrollToProgress(newProgress); // 垂直捲動
        } else {
          swiperRef.current?.swiper?.slideTo(newProgress - 1); // 水平滑動
        }

        return newProgress;
      });
    }

    window.addEventListener("volumeKeyPressed", onVolumeKeyPressed);
    return () => window.removeEventListener("volumeKeyPressed", onVolumeKeyPressed);
  }, [imageCount, isVertical]);

  // 閱讀紀錄儲存
  useEffect(() => {
    if (readHistory.length > 0) {
      localStorage.setItem("read", JSON.stringify(readHistory));
    }
  }, [readHistory]);

  const handlerReadStorage = (currentChapterId: string) => {
    setReadHistory((prevHistory: string[]) => {
      if (!prevHistory.includes(currentChapterId)) {
        return [...prevHistory, currentChapterId];
      }
      return prevHistory;
    });
  };

  // 章節按鍵顯示檢查
  useEffect(() => {
    const series = detailList.series;

    if (!series || series.length === 0) {
      setChangeCurrentPage({ next: false, prev: false });
      return;
    }

    const currentItem = series.find((item: any) => item.id === readId);

    if (!currentItem) {
      setChangeCurrentPage({ next: false, prev: false });
      return;
    }

    const sort = Number(currentItem.sort);
    const isFirstItem = sort === 1;
    const isLastItem = sort === series.length;

    setChangeCurrentPage({
      next: !isLastItem,
      prev: !isFirstItem,
    });
  }, [readId, detailList.series]);

  // 下方左右切換章節
  const handlePageChange = (direction: "next" | "prev") => {
    setChangeCurrentPage({ ...changeCurrentPage, next: true, prev: true });
    const { series } = detailList;
    if (series?.length > 0) {
      const currentIndex = series.findIndex((item: any) => item.id === readId);

      const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      const targetItem = series[newIndex];

      if (targetItem) {
        const chunkIndex = seriesGroups.menus.findIndex((chunk: any) => chunk.some((item: any) => item.id === readId));

        setSeriesGroups((prev: any) => ({
          ...prev,
          subEpisode: targetItem.sort,
          currentChapterId: targetItem.id,
        }));
        handlerReadStorage(targetItem.id);
        navigate(
          `/comic/detail/read?id=${queryId}&readId=${targetItem.id}&episode=${chunkIndex}&subEpisode=${targetItem.sort}`
        );
      }
    }
  };

  // Modal章節
  useEffect(() => {
    const chunkSize = 10;
    const { series } = detailList;
    if (series?.length > 0) {
      const chunkedSeries = [];
      for (let i = 0; i < series.length; i += chunkSize) {
        chunkedSeries.push(series.slice(i, i + chunkSize));
      }
      const chunkIndex = chunkedSeries
        .reverse()
        .findIndex((chunk: any) => chunk.some((item: any) => item.id === readId));

      setSeriesGroups({
        ...seriesGroups,
        menus: chunkedSeries,
        episode: chunkIndex,
      });
    }
  }, [detailList.series]);

  // 追蹤漫畫
  const handleTracking = async (id: string) => {
    if (!logined) {
      showSnackbar(t("login.please_login"), "error");
      setDialogOpen({ ...dialogOpen, login: true });
    } else {
      const result = await dispatch(FETCH_POST_NOTIFICATIONS_SERTRACK_THUNK(id)).unwrap();
      const { code, data } = result;
      if (code === 200) {
        showSnackbar(data, "success");
      }
    }
  };

  // 三天不顯示視窗
  const handleSetDontShow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const storedData = localStorage.getItem("threeDaysDontShow");
    const threeDaysDontShow = storedData ? JSON.parse(storedData) : [];
    if (event.target.checked) {
      if (!threeDaysDontShow.includes(queryId)) {
        threeDaysDontShow.push(queryId);
        localStorage.setItem("threeDaysDontShow", JSON.stringify(threeDaysDontShow));
        const expiryTime = Date.now() + 3 * 24 * 60 * 60 * 1000;
        localStorage.setItem("dontShowExpiry", expiryTime.toString());
      }
    } else {
      const updatedDontShow = threeDaysDontShow.filter((id: string) => id !== queryId);
      localStorage.setItem("threeDaysDontShow", JSON.stringify(updatedDontShow));
      localStorage.removeItem("dontShowExpiry");
    }
  };

  // 快速通道
  useEffect(() => {
    if (setting?.is_cn === 1) {
      const d = [{ title: t("modal.fast_track"), key: 0 }, ...(setting.app_shunts || [])];
      setReadImgSource(d);
    } else {
      setReadImgSource(setting.app_shunts);
    }
  }, [setting?.is_cn]);

  return (
    <>
      {isLoading && <Loading />}
      <div className="min-h-screen bg-white text-white relative">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: closeNav ? -64 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed top-0 w-full h-14 bg-nbk bg-opacity-90 flex justify-between items-center px-3 py-2 z-50`}
        >
          <GoBack back={`/comic/detail?id=${queryId || detailList.series_id}`} />
          <p className="truncate w-10/12">{readList.name}</p>
          <ShareIcon sx={{ fontSize: 26, stroke: "white", strokeWidth: 1 }} onClick={() => setShare(true)} />
        </motion.div>
        <div
          onClick={(e) => e.preventDefault()}
          className="pt-20 pb-40 flex items-center min-h-screen"
          ref={containerRef}
          style={{
            flexDirection: isVertical ? "column" : "row",
            overflowX: isVertical ? "hidden" : "scroll",
            overflowY: isVertical ? "scroll" : "hidden",
            scrollSnapType: isVertical ? "y mandatory" : "x mandatory",
          }}
        >
          {isVertical ? (
            <>
              <AdComponent adKey="app_chapter_next" />
              {readList.images?.length > 0 &&
                readList.images.map((d: any, i: number) => (
                  <div key={d.page} className="w-full relative">
                    <img
                      ref={(el) => (imgRefs.current[i] = el as HTMLImageElement)}
                      src={d.image}
                      alt={d.image.match(/\/([^\/]+)\.webp/)[1]}
                      width="100%"
                      height="auto"
                      id={"img_" + d.page}
                      className="w-full object-cover"
                      style={{ opacity: 0 }}
                      loading="lazy"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>
                ))}
              <AdComponent adKey="app_thewayhome" />
              <AdComponent adKey="app_chapter_last" />
            </>
          ) : (
            <>
              <Swiper
                initialSlide={0}
                className="mySwiper h-screen"
                onSlideChange={handleSwiperSlideChange}
                ref={swiperRef}
              >
                <SwiperSlide>
                  <AdComponent adKey="app_chapter_next" />
                </SwiperSlide>
                {readList.images?.length > 0 &&
                  readList.images.map((d: any, i: number) => (
                    <SwiperSlide key={d.image}>
                      <img
                        ref={(el) => (imgRefs.current[i] = el as HTMLImageElement)}
                        src={d.image}
                        alt={d.image.match(/\/([^\/]+)\.webp/)[1]}
                        width="100%"
                        height="auto"
                        loading="lazy"
                        id={"img_" + d.page}
                        className="w-full object-cover opacity-0"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    </SwiperSlide>
                  ))}
                <SwiperSlide className="w-100%">
                  <AdComponent adKey="app_thewayhome" />
                </SwiperSlide>
                <SwiperSlide>
                  <AdComponent adKey="app_chapter_last" />
                </SwiperSlide>
              </Swiper>
            </>
          )}
        </div>

        {dialogOpen.series && (
          <div
            className={`w-full h-[90vh] sticky bottom-0 left-0 bg-white dark:bg-bbk z-50 overflow-y-auto transition-all duration-1000 ${
              dialogOpen.series ? "animate-move-up" : "animate-move-down"
            }`}
          >
            <div className="h-12 sticky top-0 bg-nbk flex items-center z-20">
              <CloseIcon
                sx={{ fontSize: 24, stroke: "white", strokeWidth: 2, marginLeft: 2 }}
                onClick={() => setDialogOpen({ ...dialogOpen, series: false })}
              />
              <p className="ml-5 truncate w-9/12">{readList.name}</p>
            </div>
            <div className="w-11/12 m-auto">
              <Series
                t={t}
                episodeOnTop={true}
                queryId={queryId}
                detailList={detailList}
                seriesGroups={seriesGroups}
                setSeriesGroups={setSeriesGroups}
                msgOpen={msgOpen}
                handlerReadStorage={handlerReadStorage}
                readHistory={readHistory}
                setDialogOpen={setDialogOpen}
              />
            </div>
          </div>
        )}
        {dialogOpen.comment && (
          <div
            className={`w-full h-[90vh] sticky bottom-0 left-0 bg-[#ededed] z-30 overflow-y-auto transition-all duration-1000 ${
              dialogOpen.comment ? "animate-move-up" : "animate-move-down"
            }`}
          >
            <div className="h-12 sticky top-0 bg-nbk flex items-center z-20">
              <CloseIcon
                sx={{ fontSize: 24, stroke: "white", strokeWidth: 2, marginLeft: 2 }}
                onClick={() => setDialogOpen({ ...dialogOpen, comment: false })}
              />
              <p className="ml-5 truncate w-9/12">{readList.name}</p>
            </div>
            <div className="w-full m-auto text-gy dark:text-tgy dark:bg-bbk">
              <div className="py-3 px-2">
                {Array.isArray(readRules) && readRules.map((d: any) => <p key={d}>{d}</p>)}
              </div>
              <Comment
                t={t}
                setConfig={setConfig}
                bottomTopicInput={true}
                queryId={queryId}
                setting={setting}
                logined={logined}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                showSnackbar={showSnackbar}
              />
            </div>
          </div>
        )}
        <AnimatePresence>
          {!closeNav && (
            <motion.button
              className="fixed left-4 bottom-40 bg-og rounded-full size-16 z-20"
              onClick={() => setDialogOpen({ ...dialogOpen, readSource: true })}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              <FlashOnIcon className="text-4xl" />
            </motion.button>
          )}
        </AnimatePresence>
        <ReadNav
          readId={readId}
          logined={logined}
          isLoading={isLoading}
          setIsVertical={setIsVertical}
          isVertical={isVertical}
          changeCurrentPage={changeCurrentPage}
          handlePageChange={handlePageChange}
          scrollProgress={scrollProgress}
          imageCount={imageCount}
          handleSliderChange={handleSliderChange}
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          readList={readList}
          detailList={detailList}
          showSnackbar={showSnackbar}
          closeNav={closeNav}
        />
      </div>
      {dialogOpen.readSource && (
        <DialogModal readImgSource={readImgSource} setDialogOpen={setDialogOpen} dialogOpen={dialogOpen} />
      )}
      {share && (
        <Share share={share} setShare={setShare} setting={setting} queryId={readId} showSnackbar={showSnackbar} />
      )}
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
      {msgOpen.readTrack && (
        <MsgModal
          t={t}
          logined={logined}
          queryId={queryId}
          setMsgOpen={setMsgOpen}
          msgOpen={msgOpen}
          handleTracking={handleTracking}
          handleSetDontShow={handleSetDontShow}
        />
      )}

      <PositionedSnackbar setSnackbars={setSnackbars} snackbars={snackbars} />
    </>
  );
};

export default Read;
