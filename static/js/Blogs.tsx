import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { FETCH_BLOGS_LIST_THUNK } from "../../actions/blogsAction";
import AdComponent from "../../components/Ads/AdComponent";
import BlogList from "../../components/Blogs/BlogsList";
import ClickPagination from "../../components/Common/ClickPagination";
import HeaderAds from "../../components/Common/HeaderAds";
import Loading from "../../components/Common/Loading";
import TopBtn from "../../components/Common/TopBtn";
import { useGlobalConfig } from "../../GlobalContext";
import { GoBack, useDelayedFlag, useScrollToTop } from "../../Hooks";
import { CLEAR_BLOG_STATE, LOAD_BLOGS_LIST } from "../../reducers/blogsReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { renderText } from "../../utils/Function";

const Blogs = () => {
  const { config } = useGlobalConfig();
  const { memberInfo, setting, ads, paginationMode } = config;
  const { t } = useTranslation();
  const tabItems = t("blogs.tab_items", { returnObjects: true });
  const dispatch = useAppDispatch();
  const scrollToTop = useScrollToTop();
  const { blogsList, isBlogLoading, isRefreshing } = useAppSelector((state) => state.blogs);
  const [tabChange, setTabChange] = useState(false);
  const [page, setPage] = useState(() => Number(sessionStorage.getItem("blogsLoadMore")) || 1);
  const { ref, inView } = useInView();
  const pageLimit = blogsList.total ? Math.ceil(blogsList.total / 12) : 1;
  const hasNextPage = page < pageLimit && pageLimit > 1;
  const hasScrolled = useDelayedFlag();
  const [tab, setTab] = useState(() => {
    const stored = sessionStorage.getItem("blogTab");
    return stored !== null ? JSON.parse(stored) : 1;
  });

  const loadList = (isLoadMore: boolean = false, isRefreshing: boolean = false, time: number = 0, page: number = 1) => {
    dispatch(LOAD_BLOGS_LIST({ isBlogLoading: true, isLoadMore, isRefreshing }));
    if (isRefreshing) {
      setPage(1);
      sessionStorage.setItem("blogsLoadMore", "0");
      dispatch(CLEAR_BLOG_STATE("blogsList"));
    }
    if (!isLoadMore) {
      scrollToTop();
    }
    const blog_type = tab === 1 ? "dinner" : "raiders";
    setTimeout(() => {
      dispatch(FETCH_BLOGS_LIST_THUNK({ page, blog_type }));
      setTabChange(false);
    }, time);
    sessionStorage.setItem("blogsLoadMore", String(page));
  };

  useEffect(() => {
    if (tabChange || !blogsList.list?.length) {
      loadList();
      sessionStorage.setItem("blogTab", String(tab));
    }
  }, [tabChange, blogsList.list?.length]);

  const handleRefresh = () => {
    loadList(false, true);
  };

  const loadMore = useCallback(() => {
    if (!hasNextPage) return;
    if (inView && hasNextPage) {
      const loadMorePage = sessionStorage.getItem("blogsLoadMore");
      const nextPage = Number(loadMorePage) + 1;
      setPage(nextPage);
      loadList(true, false, 1000, nextPage);
    }
  }, [inView, hasNextPage]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  // click pagination
  const goToPage = (value: number) => {
    const targetPage = Math.min(Math.max(value, 1), pageLimit);
    setPage(targetPage);
    loadList(false, false, 0, targetPage);
  };

  // ads fixed
  const [adResize, setAdResize] = useState(false);

  const handleAdResize = () => {
    setAdResize(true);
  };

  return (
    <div className="h-full dark:bg-bk">
      {isBlogLoading && <Loading />}
      <div className="sticky top-safe left-0 right-0 bg-defaultBg z-50 dark:bg-nbk">
        <HeaderAds />
        <div className="w-full h-14 bg-bbk text-white flex justify-between items-center px-3 z-10">
          <GoBack back={sessionStorage.getItem("fromPage") || "/"} />
          <div className="top-bar-icon flex items-center space-x-4">
            {Array.isArray(tabItems) &&
              tabItems.map((d, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center"
                  onClick={() => {
                    setTab(i + 1);
                    setTabChange(true);
                  }}
                >
                  <p className={`transition-colors duration-300 ${tab === i + 1 ? "text-og pb-2" : "pb-3"}`}>{d}</p>
                  {tab === i + 1 && (
                    <motion.div
                      className="h-1 bg-og rounded"
                      animate={{ width: tab === i + 1 ? "100%" : "0%" }}
                      initial={{ width: "0%" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{ transformOrigin: "left" }}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="pb-40">
        <PullToRefreshify
          completeDelay={1000}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderText={renderText}
          className="overflow-y-visible"
        >
          <div className="my-2">
            <AdComponent adKey="app_blogs_top_banner" />
          </div>
          <div className="border-l-4 border-og pl-1 mt-2">
            {tab === 1 ? t("blogs.night_bistro") : t("blogs.game_library")}
          </div>
          {blogsList.list?.length > 0 && (
            <>
              <BlogList
                t={t}
                list={blogsList.list}
                setting={setting}
                tab={tab}
                hasScrolled={hasScrolled}
                isBlogLoading={isBlogLoading}
                memberInfo={memberInfo}
              />
              {paginationMode === "click" ? (
                <ClickPagination pageLimit={pageLimit} page={page} onChange={goToPage} loading={isBlogLoading} />
              ) : (
                <button ref={ref} onClick={loadMore} className="w-full flex justify-center pb-40">
                  {hasNextPage ? (
                    <div className="flex items-center">
                      <CircularProgress color="inherit" size={12} />
                      <p className="ml-2">{t("comic.pull_to_load")}</p>
                    </div>
                  ) : (
                    <p className="text-center">{t("comic.no_more")}</p>
                  )}
                </button>
              )}
            </>
          )}
        </PullToRefreshify>
        <TopBtn />
        <div className={`fixed ${adResize ? "bottom-[-3rem]" : "bottom-0"} left-0 right-0 bg-white`}>
          <AdComponent key={1} adKey="app_blogs_fixed_bottom_jm3" closeBtn={true} handleAdResize={handleAdResize} />
        </div>
      </div>
    </div>
  );
};

export default Blogs;
