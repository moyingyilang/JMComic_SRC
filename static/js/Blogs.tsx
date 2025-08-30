import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import CircularProgress from "@mui/material/CircularProgress";
import BlogList from "../../components/Blogs/BlogsList";
import TopBtn from "../../components/Common/TopBtn";
import Loading from "../../components/Common/Loading";
import { FETCH_BLOGS_LIST_THUNK } from "../../actions/blogsAction";
import { CLEAR_BLOG_STATE, LOAD_BLOGS_LIST } from "../../reducers/blogsReducer";
import { renderText } from "../../utils/Function";
import { GoBack, useDelayedFlag, useScrollToTop } from "../../Hooks";
import { motion } from "framer-motion";
import AdComponent from "../../components/Ads/AdComponent";

const Blogs = () => {
  const { config } = useGlobalConfig();
  const { setting } = config;
  const { t } = useTranslation();
  const tabItems = t("blogs.tab_items", { returnObjects: true });
  const dispatch = useAppDispatch();
  const scrollToTop = useScrollToTop();
  const { blogsList, isBlogLoading, isRefreshing } = useAppSelector((state) => state.blogs);
  const [tabChange, setTabChange] = useState(false);
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();
  const pageLimit = blogsList.list?.length ? Math.ceil(blogsList.total / 12) : 0;
  const hasNextPage = page <= pageLimit;
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
    const blog_type = tab === 1 ? "dinner" : "raiders";
    setTimeout(() => {
      dispatch(FETCH_BLOGS_LIST_THUNK({ page, blog_type }));
      setTabChange(false);
    }, time);
    sessionStorage.setItem("blogsLoadMore", String(page));
  };

  useEffect(() => {
    if (tabChange || blogsList.list?.length === 0) {
      scrollToTop();
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

  // ads fixed
  const [adResize, setAdResize] = useState(false);

  const handleAdResize = () => {
    setAdResize(true);
  };

  return (
    <div className="min-h-screen">
      {isBlogLoading && <Loading />}
      <div className="sticky top-0 w-full h-20 bg-bbk text-white  flex justify-between items-center px-3 z-10">
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
              />
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
            </>
          )}
        </PullToRefreshify>
        <TopBtn />
        <div className={`fixed ${adResize ? "bottom-[-3rem]" : "bottom-[-1rem]"} left-0 right-0 bg-white`}>
          <AdComponent key={1} adKey="app_blogs_fixed_bottom" closeBtn={true} handleAdResize={handleAdResize} />
        </div>
      </div>
    </div>
  );
};

export default Blogs;
