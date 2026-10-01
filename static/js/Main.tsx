import CircularProgress from "@mui/material/CircularProgress";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { useLocation } from "react-router-dom";
import { FETCH_LATEST_THUNK, FETCH_MAIN_THUNK } from "../../actions/mainAction";
import { FETCH_AD_FREE_PAY_THUNK } from "../../actions/memberAction";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import ClickPagination from "../../components/Common/ClickPagination";
import ComicCarousel from "../../components/Common/ComicCarousel";
import ComicList from "../../components/Common/ComicList";
import Header from "../../components/Common/Header";
import Loading from "../../components/Common/Loading";
import Banner from "../../components/Main/Banner";
import BottomNav from "../../components/Main/BottomNav";
import FirstCover from "../../components/Main/coverPlate/FirstCover";
import FourCover from "../../components/Main/coverPlate/FourCover";
import SecondCover from "../../components/Main/coverPlate/SecondCover";
import ThreeCover from "../../components/Main/coverPlate/ThreeCover";
import MainTopBtn from "../../components/Main/MainTopBtn";
import VersionUpdate from "../../components/Main/VersionUpdate";
import DialogModal from "../../components/Modal/DialogModal";
import { useGlobalConfig } from "../../GlobalContext";
import { CLEAR_MAIN_LIST, LOAD_LATEST_LIST, LOAD_MAIN_LIST } from "../../reducers/mainReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getRandomItems, renderText } from "../../utils/Function";
import { defaultEditInitialState } from "../../utils/InterFace";

const Home = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined, ads, defaultCoverImg, memberInfo, paginationMode } = config;
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const [coverOpen, setCoverOpen] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState({ imageSource: false, folder: false });
  const { mainList, latestList, isLoading, isLastLoading, isRefreshing } = useAppSelector((state) => state.main);
  const { items: randomItem } = getRandomItems(mainList[0]?.content);
  const [page, setPage] = useState<number>(() => {
    const stored = Number(sessionStorage.getItem("mainLoadMore"));
    return Number.isFinite(stored) && stored >= 0 ? stored : 0;
  });
  const { ref, inView } = useInView();
  const latestListRef = useRef<HTMLDivElement>(null);
  const pageLimit = latestList.total ? Math.ceil(latestList.total / 30) : 9500;
  // page 是 0-indexed（第一頁是 0），pageLimit 是總頁數，最後一頁的 index 是 pageLimit - 1
  const hasNextPage = page < pageLimit - 1;
  const [editFolder, setEditFolder] = useState(defaultEditInitialState);
  sessionStorage.setItem("fromPage", location.pathname);
  const trackList = mainList?.length && mainList.find((d: any) => d.id === "26")?.content.map((d: any) => d.id);
  const stateStr = sessionStorage.getItem("state");
  const mainStatus = stateStr ? JSON.parse(stateStr) : null;
  const { showHotUpdateModal } = useAppSelector((state) => state.hotUpdate);
  const { adsPaymentList } = useAppSelector((state) => state.member);
  const adFreeStatus = (memberInfo && memberInfo?.ad_free) || false;
  const fourCover =
    !adFreeStatus &&
    ((config.adsContent?.img?.["app_pop3_cover"]?.advs?.length ?? 0) > 0 ||
      (config.adsContent?.img?.["app_pop3_img"]?.advs?.length ?? 0) > 0);
  const [adsFourCoverOpen, setAdsFourCoverOpen] = useState<boolean>(fourCover);

  useEffect(() => {
    if (!mainStatus) {
      setAdsFourCoverOpen(fourCover);
    }
  }, [fourCover, mainStatus]);

  // cover
  const handleNext = (count = 1) => {
    if (coverOpen < 6) {
      setCoverOpen(Math.min(coverOpen + count, 6));
    }
  };

  useEffect(() => {
    if (showHotUpdateModal) {
      setCoverOpen(1);
    } else if (mainStatus) {
      setCoverOpen(6);
      setAdsFourCoverOpen(false);
    } else {
      setCoverOpen(2);
    }
  }, [showHotUpdateModal, mainStatus]);

  // GetList
  const loadList = (
    isLastLoadMore: boolean = false,
    isRefreshing: boolean = false,
    time: number = 0,
    page: number = 0
  ) => {
    if (!isLastLoadMore || isRefreshing) {
      dispatch(LOAD_MAIN_LIST({ isLoading: true, isLoadMore: false, isRefreshing }));
      setPage(0);
      sessionStorage.setItem("mainLoadMore", "0");
      dispatch(CLEAR_MAIN_LIST("mainList"));
      dispatch(CLEAR_MAIN_LIST("latestList"));
      setTimeout(() => {
        dispatch(FETCH_MAIN_THUNK());
      }, time);
    } else if (isLastLoadMore) {
      dispatch(LOAD_LATEST_LIST({ isLastLoading: true, isLastLoadMore, isLastLoadMoreLoading: false, isRefreshing }));
      setTimeout(() => {
        dispatch(FETCH_LATEST_THUNK(page));
      }, time);
      sessionStorage.setItem("mainLoadMore", String(page));
    }
  };

  // 付費廣告價格列表預先呼叫
  useEffect(() => {
    if (!adsPaymentList.plans?.length || !adsPaymentList.pay_methods?.length) {
      dispatch(FETCH_AD_FREE_PAY_THUNK({}));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("trackList", JSON.stringify(trackList));
    if (coverOpen >= 3 && !mainList?.length && !isRefreshing) {
      loadList(false, false, 1000, 0);
    }
  }, [dispatch, mainList?.length, coverOpen]);

  //isRefreshing
  const handleRefresh = () => {
    loadList(false, true);
  };

  // load more
  const loadMore = useCallback(() => {
    if (!hasNextPage) return;
    if (inView && hasNextPage) {
      const loadMorePage = sessionStorage.getItem("mainLoadMore");
      const nextPage = Number(loadMorePage) + 1;
      setPage(nextPage);
      loadList(true, false, 1000, nextPage);
    }
  }, [inView, hasNextPage]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  // click 分頁模式進入畫面時先載入第一頁
  useEffect(() => {
    if (paginationMode === "click" && mainList?.length > 0 && latestList.list?.length === 0 && !isRefreshing) {
      setPage(0);
      dispatch(
        LOAD_LATEST_LIST({
          isLastLoading: true,
          isLastLoadMore: false,
          isLastLoadMoreLoading: false,
          isRefreshing: false,
        })
      );
      dispatch(FETCH_LATEST_THUNK(0));
    }
  }, [dispatch, paginationMode, mainList?.length, latestList.list?.length, isRefreshing]);

  // click pagination
  const goToPage = (value: number) => {
    const targetPage = Math.min(Math.max(value, 1), pageLimit);
    const nextPage = targetPage - 1;
    setPage(nextPage);
    sessionStorage.setItem("mainLoadMore", String(nextPage));
    dispatch(
      LOAD_LATEST_LIST({
        isLastLoading: true,
        isLastLoadMore: false,
        isLastLoadMoreLoading: false,
        isRefreshing: false,
      })
    );
    dispatch(FETCH_LATEST_THUNK(nextPage));
    (document.activeElement as HTMLElement)?.blur?.();
    setTimeout(() => {
      latestListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <div className="h-full dark:bg-bk">
      {coverOpen === 1 && <VersionUpdate config={config} visible={showHotUpdateModal} onNext={handleNext} />}
      {coverOpen === 2 && (
        <FirstCover config={config} setConfig={setConfig} adFreeStatus={adFreeStatus} onNext={handleNext} />
      )}
      {coverOpen === 3 && <SecondCover onNext={handleNext} />}
      {coverOpen === 4 && (
        <ThreeCover
          config={config}
          onNext={handleNext}
          adFreeStatus={adFreeStatus}
          adsFourCoverOpen={adsFourCoverOpen}
        />
      )}
      {coverOpen === 5 && adsFourCoverOpen && !mainStatus && (
        <FourCover
          config={config}
          onNext={handleNext}
          adsFourCoverOpen={adsFourCoverOpen}
          setAdsFourCoverOpen={setAdsFourCoverOpen}
        />
      )}
      {(coverOpen === 0 || isLoading || (isLastLoading && latestList.list?.length > 0)) && <Loading />}
      {(coverOpen === 0 || coverOpen === 6) && mainStatus && (
        <>
          <Header currentPage="main" />
          <PullToRefreshify
            completeDelay={1000}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            renderText={renderText}
            className="overflow-y-visible"
          >
            {ads && ads["app_home_top"]?.advs?.length > 0 && (
              <Banner bannerList={ads["app_home_top"]?.advs} adFreeStatus={adFreeStatus} />
            )}
            {mainList?.length > 0 && (
              <>
                <ComicCarousel
                  t={t}
                  listName={"mainList"}
                  list={mainList}
                  setting={setting}
                  logined={logined}
                  editFolder={editFolder}
                  setEditFolder={setEditFolder}
                  setDialogOpen={setDialogOpen}
                  dialogOpen={dialogOpen}
                  showSnackbar={showSnackbar}
                  defaultCoverImg={defaultCoverImg}
                />
                <div ref={latestListRef}>
                  <ComicList
                    title="new"
                    t={t}
                    listName={"latestList"}
                    link={true}
                    list={latestList.list}
                    logined={logined}
                    setting={setting}
                    comicTags={true}
                    comicMark={true}
                    comicCheck={false}
                    editFolder={editFolder}
                    setEditFolder={setEditFolder}
                    setDialogOpen={setDialogOpen}
                    dialogOpen={dialogOpen}
                    showSnackbar={showSnackbar}
                    defaultCoverImg={defaultCoverImg}
                  />
                </div>
                {!adsFourCoverOpen && paginationMode === "click" ? (
                  <ClickPagination pageLimit={pageLimit} page={page + 1} onChange={goToPage} loading={isLastLoading} />
                ) : (
                  !adsFourCoverOpen && (
                    <button ref={ref} onClick={loadMore} className="w-full flex justify-center pt-4 pb-40">
                      {hasNextPage ? (
                        <div className="flex items-center">
                          <CircularProgress color="inherit" size={12} />
                          <p className="ml-2">{t("comic.pull_to_load")}</p>
                        </div>
                      ) : (
                        <p className="text-center">{t("comic.no_more")}</p>
                      )}
                    </button>
                  )
                )}
              </>
            )}
          </PullToRefreshify>
        </>
      )}
      <BottomNav currentPage="main" />
      <MainTopBtn setting={setting} randomItem={randomItem} />
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
      {dialogOpen.imageSource && <DialogModal setDialogOpen={setDialogOpen} dialogOpen={dialogOpen} />}
    </div>
  );
};

export default Home;
