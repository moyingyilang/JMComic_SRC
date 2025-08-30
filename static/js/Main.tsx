import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import Banner from "../../components/Main/Banner";
import ComicCarousel from "../../components/Common/ComicCarousel";
import BottomNav from "../../components/Main/BottomNav";
import MainTopBtn from "../../components/Main/MainTopBtn";
import ComicList from "../../components/Common/ComicList";
import DialogModal from "../../components/Modal/DialogModal";
import FirstCover from "../../components/Main/coverPlate/FirstCover";
import SecondCover from "../../components/Main/coverPlate/SecondCover";
import ThreeCover from "../../components/Main/coverPlate/ThreeCover";
import Loading from "../../components/Common/Loading";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import { FETCH_MAIN_THUNK, FETCH_LATEST_THUNK } from "../../actions/mainAction";
import { LOAD_MAIN_LIST, LOAD_LATEST_LIST, CLEAR_MAIN_LIST } from "../../reducers/mainReducer";
import { getRandomItems, renderText } from "../../utils/Function";
import { defaultEditInitialState } from "../../utils/InterFace";
import Header from "../../components/Common/Header";
import VersionUpdate from "../../components/Main/VersionUpdate";

const Home = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined, ads } = config;
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const [coverOpen, setCoverOpen] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState({ imageSource: false, folder: false });
  const { mainList, latestList, isLoading, isRefreshing } = useAppSelector((state) => state.main);
  const { items: randomItem } = getRandomItems(mainList[0]?.content);
  const [page, setPage] = useState<number>(0);
  const { ref, inView } = useInView();
  const pageLimit = latestList?.length ? Math.ceil(latestList.length / 30) : 30;
  const hasNextPage = page <= pageLimit;
  const [editFolder, setEditFolder] = useState(defaultEditInitialState);
  sessionStorage.setItem("fromPage", location.pathname);
  const trackList = mainList?.length && mainList.find((d: any) => d.id === "26")?.content.map((d: any) => d.id);
  localStorage.setItem("trackList", JSON.stringify(trackList));
  const stateStr = sessionStorage.getItem("state");
  const mainStatus = stateStr ? JSON.parse(stateStr) : null;
  const { showHotUpdateModal } = useAppSelector((state) => state.hotUpdate);

  // cover
  const handleNext = () => {
    if (coverOpen < 5) {
      setCoverOpen(coverOpen + 1);
    }
  };

  useEffect(() => {
    if (showHotUpdateModal) {
      setCoverOpen(1);
    } else if (mainStatus) {
      setCoverOpen(5);
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
      sessionStorage.setItem("mainLoadMore", "-1");
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

  useEffect(() => {
    if (coverOpen >= 3 && mainList.length === 0 && !isRefreshing) {
      loadList(false, false, 1000, 0);
    }
  }, [dispatch, mainList.length, coverOpen]);

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

  return (
    <div className="min-h-screen">
      {isLoading && <Loading />}
      {coverOpen === 1 && <VersionUpdate config={config} visible={showHotUpdateModal} onNext={handleNext} />}
      {coverOpen === 2 && <FirstCover config={config} setConfig={setConfig} ads={ads} onNext={handleNext} />}
      {coverOpen === 3 && <SecondCover setting={setting} ads={ads} onNext={handleNext} />}
      {coverOpen === 4 && <ThreeCover config={config} onNext={handleNext} />}
      {stateStr && (
        <PullToRefreshify
          completeDelay={1000}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderText={renderText}
          className="overflow-y-visible"
        >
          <Header currentPage="main" />
          <Banner dispatch={dispatch} bannerList={ads["app_home_top"]?.advs} />
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
              />
              <ComicList
                title="new"
                t={t}
                listName={"latestList"}
                link={true}
                list={latestList}
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
              />
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
            </>
          )}
        </PullToRefreshify>
      )}
      <BottomNav currentPage="main" />
      <MainTopBtn setting={setting} randomItem={randomItem} />
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
      {dialogOpen.imageSource && <DialogModal setDialogOpen={setDialogOpen} dialogOpen={dialogOpen} />}
    </div>
  );
};

export default Home;
