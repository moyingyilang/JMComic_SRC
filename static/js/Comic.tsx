import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import CircularProgress from "@mui/material/CircularProgress";
import ComicList from "../../components/Common/ComicList";
import TopBtn from "../../components/Common/TopBtn";
import Loading from "../../components/Common/Loading";
import { FETCH_MORE_THUNK, FETCH_SER_MORE_THUNK } from "../../actions/mainAction";
import { CLEAR_MAIN_LIST, LOAD_MORE_LIST } from "../../reducers/mainReducer";
import { getWeekInfo, renderText } from "../../utils/Function";
import { ComicType } from "../../assets/JsonData";
import { GoBack } from "../../Hooks";
import { defaultEditInitialState } from "../../utils/InterFace";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";

const Comic = () => {
  const { config } = useGlobalConfig();
  const { setting, logined } = config;
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const comicType = ComicType();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const weekDayItems = t("comic.weekDays", { returnObjects: true });
  const { today, todayIndex, allDays } = getWeekInfo(weekDayItems);
  const { moreList, isMoreListLoading, isMoreListLoadMore, isMoreListRefreshing } = useAppSelector(
    (state) => state.main
  );
  const searchParams = new URLSearchParams(location.search);
  const query = decodeURIComponent(searchParams.get("title") || "");
  const queryId = searchParams.get("id") as string;
  const isWeekly = queryId === "26";
  sessionStorage.setItem("fromPage", `${location.pathname}?id=${queryId}`);
  const [dialogOpen, setDialogOpen] = useState({ folder: false });
  const [filter, setFilter] = useState({ type: "all", date: todayIndex, page: 1 });
  const [editFolder, setEditFolder] = useState(defaultEditInitialState);
  const [page, setPage] = useState<number>(0);
  const { ref, inView } = useInView();
  const pageLimit = moreList.list?.length ? Math.ceil(moreList.total / 30) : 0;
  const hasNextPage = page <= pageLimit;

  const handleLoad = (isMoreListLoadMore: boolean, isMoreListRefreshing: boolean) => {
    dispatch(LOAD_MORE_LIST({ isMoreListLoading: true, isMoreListLoadMore, isMoreListRefreshing }));
  };

  useEffect(() => {
    handleLoad(false, false);
    if (!isWeekly) {
      dispatch(FETCH_MORE_THUNK({ id: queryId, page }));
    }
  }, []);

  // load more
  const loadMore = useCallback(() => {
    if (!inView || !hasNextPage || isMoreListLoadMore || isWeekly) return;
    const nextPage = page + 1;
    setPage(nextPage);
    handleLoad(true, false);
    setTimeout(() => {
      if (queryId) {
        dispatch(FETCH_MORE_THUNK({ id: queryId, page: nextPage }));
      }
    }, 1000);
  }, [inView, hasNextPage]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    if (isWeekly) {
      const { type, date, page } = filter;
      if (page > 1) {
        handleLoad(true, false);
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
      dispatch(FETCH_SER_MORE_THUNK({ type, date, page }));
    }
  }, [filter]);

  const handleRefresh = () => {
    if (isWeekly) {
      handleLoad(false, true);
      setFilter({ type: "all", date: todayIndex, page: 1 });
    } else {
      handleLoad(false, true);
      dispatch(FETCH_MORE_THUNK({ id: queryId, page: 0 }));
    }
  };

  return (
    <>
      {isMoreListLoading && <Loading />}
      <div className="min-h-screen transition-all duration-300 dark:text-tgy">
        <header className="bg-bbk fixed top-0 left-0 right-0 z-50">
          <div className="h-20 w-full bg-bbk text-white flex items-end px-2 py-3">
            <GoBack back="/" />
            <p className="ml-4 text-2xl text-og">{isWeekly ? t("comic.weekly_update") : query}</p>
          </div>
          {isWeekly && (
            <div className="text-tgy bg-nbk">
              <div className="h-10 w-full flex justify-around items-center text-tgy bg-nbk">
                {[...allDays, t("comic.completed")].map((d: any, i: number) => (
                  <span
                    key={d}
                    className={` ${filter.date === (i + 1 === 8 ? 0 : i + 1) ? "text-og" : ""}`}
                    onClick={() => {
                      setFilter({ ...filter, date: i + 1 === 8 ? 0 : i + 1, page: 1 });
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>

              <div className="h-10 w-4/12 flex justify-around items-center">
                {comicType.map((d: any, i: number) => (
                  <span
                    key={d.type}
                    className={`${filter.type === d.type ? "text-og" : ""}`}
                    onClick={() => {
                      setFilter({ ...filter, type: d.type, page: 1 });
                    }}
                  >
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </header>
        <div className={`${isWeekly ? "mt-40" : "mt-20"}`}>
          <PullToRefreshify
            completeDelay={1000}
            refreshing={isMoreListRefreshing}
            onRefresh={handleRefresh}
            renderText={renderText}
            className="overflow-y-visible"
          >
            <ComicList
              t={t}
              cols={6}
              link={true}
              listName={"moreList"}
              list={moreList.list}
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
              isWeekly={isWeekly}
            />
            {!isWeekly ? (
              <button ref={ref} onClick={loadMore} className="w-full flex justify-center pb-40">
                {moreList.list?.length > 0 &&
                  (hasNextPage ? (
                    <div className="flex items-center">
                      <CircularProgress color="inherit" size={12} />
                      <p className="ml-2">{t("comic.pull_to_load")}</p>
                    </div>
                  ) : (
                    <p className="text-center">{t("comic.no_more")}</p>
                  ))}
              </button>
            ) : (
              <div className="w-full flex justify-center py-10">
                {moreList.list?.length > 0 &&
                  (moreList.error ? (
                    <p className="text-center">{t("comic.end_of_list")}</p>
                  ) : (
                    <button
                      className="rounded bg-og w-36 h-12 dark:bg-nbk text-white"
                      onClick={() => setFilter((prev) => ({ ...prev, page: prev.page + 1 }))}
                    >
                      {isMoreListLoading ? <CircularProgress color="inherit" size={12} /> : t("comic.click_to_load")}
                    </button>
                  ))}
              </div>
            )}
          </PullToRefreshify>
        </div>
      </div>
      <TopBtn />
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
    </>
  );
};
export default Comic;
