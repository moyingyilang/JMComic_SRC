import CircularProgress from "@mui/material/CircularProgress";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { useLocation } from "react-router-dom";
import { FETCH_MORE_THUNK, FETCH_SER_MORE_THUNK } from "../../actions/mainAction";
import { ComicType } from "../../assets/JsonData";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import ClickPagination from "../../components/Common/ClickPagination";
import ComicList from "../../components/Common/ComicList";
import HeaderAds from "../../components/Common/HeaderAds";
import Loading from "../../components/Common/Loading";
import TopBtn from "../../components/Common/TopBtn";
import { useGlobalConfig } from "../../GlobalContext";
import { GoBack, useScrollToTop } from "../../Hooks";
import { LOAD_MORE_LIST } from "../../reducers/mainReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getWeekInfo, renderText } from "../../utils/Function";
import { defaultEditInitialState } from "../../utils/InterFace";

const Comic = () => {
  const { config } = useGlobalConfig();
  const { setting, logined, paginationMode } = config;
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const scrollToTop = useScrollToTop();
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
  const defaultPageLimit: Record<string, number> = { "30": 8, "29": 100, "26": 2 };
  const pageLimit = moreList.total ? Math.ceil(moreList.total / 30) : defaultPageLimit[queryId] ?? 1;
  // page 是 0-indexed（第一頁是 0），pageLimit 是總頁數，最後一頁的 index 是 pageLimit - 1
  const hasNextPage = page < pageLimit - 1;

  const handleLoad = (isMoreListLoadMore: boolean, isMoreListRefreshing: boolean) => {
    if (!isMoreListLoadMore) {
      scrollToTop();
    }
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

  // click pagination
  const goToPage = (value: number) => {
    const targetPage = Math.min(Math.max(value, 1), pageLimit) - 1;
    setPage(targetPage);
    handleLoad(false, false);
    if (queryId) {
      dispatch(FETCH_MORE_THUNK({ id: queryId, page: targetPage }));
    }
  };

  const goToWeeklyPage = (value: number) => {
    const targetPage = Math.min(Math.max(value, 1), pageLimit);
    setFilter((prev) => ({ ...prev, page: targetPage }));
  };

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
      <div className="h-full transition-all duration-300 dark:text-tgy dark:bg-bk">
        <header className="bg-bbk fixed top-safe left-0 right-0 z-50">
          <HeaderAds />
          <div className="h-14 w-full bg-bbk text-white flex items-end px-2 py-3">
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
              moreList.list?.length > 0 && paginationMode === "click" ? (
                <ClickPagination
                  pageLimit={pageLimit}
                  page={page + 1}
                  onChange={goToPage}
                  loading={isMoreListLoading}
                />
              ) : (
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
              )
            ) : (
              <div className="w-full flex justify-center py-10">
                {moreList.list?.length > 0 &&
                  (moreList.error ? (
                    <p className="text-center">{t("comic.end_of_list")}</p>
                  ) : paginationMode === "click" ? (
                    <ClickPagination
                      pageLimit={pageLimit}
                      page={filter.page}
                      onChange={goToWeeklyPage}
                      loading={isMoreListLoading}
                    />
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
