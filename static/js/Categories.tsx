import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Header from "../../components/Common/Header";
import BottomNav from "../../components/Main/BottomNav";
import ComicList from "../../components/Common/ComicList";
import Loading from "../../components/Common/Loading";
import TopBtn from "../../components/Common/TopBtn";
import MemberModal from "../../components/Modal/MemberModal";
import { FETCH_CATEGORIES_FILTER_LIST_THUNK, FETCH_CATEGORIES_LIST_THUNK } from "../../actions/categoriesAction";
import { FETCH_TAGS_FAVORITE_LIST_THUNK } from "../../actions/memberAction";
import { FETCH_HOT_TAGS_THUNK } from "../../actions/searchAction";
import { CLEAR_CATEGORIES_LIST, LOAD_CATEGORIES_LIST } from "../../reducers/categoriesReducer";
import { renderText } from "../../utils/Function";
import { CatSortData } from "../../assets/JsonData";
import { defaultEditInitialState, defaultUserFormData } from "../../utils/InterFace";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";

const Categories = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined } = config;
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const { cateFilterList, categoriesList, isLoading, isRefreshing } = useAppSelector((state) => state.categories);
  const { tagsList } = useAppSelector((state) => state.member);
  const { hotTagsList } = useAppSelector((state) => state.search);
  const [formData, setFormData] = useState(defaultUserFormData);
  const [editFolder, setEditFolder] = useState(defaultEditInitialState);
  const [dialogOpen, setDialogOpen] = useState({ login: false, signUp: false, forgot: false });
  const searchParams = new URLSearchParams(location.search);
  const catSort = CatSortData();
  const querySlug = searchParams.get("slug") || "";
  const querySort = searchParams.get("sort") || "";
  const catTab = sessionStorage.getItem("catTab") || "";
  const fromPage = sessionStorage.getItem("fromPage") || "";
  const urlParams = new URLSearchParams(fromPage.split("?")[1] || "");
  const slugTab = urlParams.get("slug") || "";
  const sortTab = urlParams.get("sort") || "";

  const [filter, setFilter] = useState({ slug: querySlug || slugTab, sub_slug: "", sort: querySort || sortTab });
  const [tabChange, setTabChange] = useState(false);
  const filter_slug = (filter.slug || "") + (filter.sub_slug ? `_${filter.sub_slug}` : "");
  const [markOpen, setMarkOpen] = useState(() => {
    const stored = sessionStorage.getItem("markOpen");
    return stored !== null ? JSON.parse(stored) : true;
  });
  const catList = useRef<{ cat: any[]; blocks: any[]; marks: any[]; tags: any[]; ranking: any[] }>({
    cat: [],
    blocks: [],
    marks: [],
    tags: [],
    ranking: catSort,
  });
  const subList = catList.current.cat?.find((d: any) => d.slug === filter.slug)?.sub_categories || [];
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();
  const pageLimit = cateFilterList.list?.length ? Math.ceil(cateFilterList.total / 80) : 10;
  const hasNextPage = page <= pageLimit;

  useEffect(() => {
    sessionStorage.setItem("fromPage", `${location.pathname}?slug=${filter.slug}&sort=${filter.sort}`);
    navigate(`${location.pathname}?slug=${filter.slug}&sort=${filter.sort}`);
  }, [filter.slug, filter.sort, location.pathname]);

  // GetList
  const loadList = (
    isLoadMore: boolean = false,
    isRefreshing: boolean = false,
    time: number = 0,
    page: number = 1,
    o: string = filter.sort,
    c: string = filter_slug
  ) => {
    if (isRefreshing) {
      setPage(0);
      sessionStorage.setItem("catLoadMore", "0");
      dispatch(CLEAR_CATEGORIES_LIST("cateFilterList"));
    }
    dispatch(LOAD_CATEGORIES_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    setTimeout(() => {
      dispatch(FETCH_CATEGORIES_FILTER_LIST_THUNK({ page, o, c }));
    }, time);
    sessionStorage.setItem("catLoadMore", String(page));
    setTabChange(false);
  };

  // 排序 預設最新 '' || 最多愛心 'tf' || 總排行 'mv' || 月排行 'mv_m' || 週排行 'mv_w' || 日排行 'mv_t'
  useEffect(() => {
    if (filter.slug !== catTab || tabChange || cateFilterList.list?.length === 0) {
      loadList();
      sessionStorage.setItem("catTab", filter.slug);
    }
  }, [filter.slug, tabChange, cateFilterList.list?.length]);

  // header
  useEffect(() => {
    if (logined && tagsList.list?.length === 0) {
      dispatch(FETCH_TAGS_FAVORITE_LIST_THUNK());
    }
    if (Object.keys(categoriesList).length === 0 && hotTagsList.length === 0) {
      dispatch(FETCH_CATEGORIES_LIST_THUNK());
      dispatch(FETCH_HOT_TAGS_THUNK());
    }
  }, [dispatch, logined, Object.keys(categoriesList).length, hotTagsList.length]);

  useEffect(() => {
    const catLists = catList.current;
    const { blocks, categories } = categoriesList;
    Object.assign(catLists, {
      marks: tagsList.list || [],
      blocks,
      cat: categories,
      tags: hotTagsList,
    });
  }, [categoriesList, hotTagsList, tagsList]);

  const handleRefresh = () => {
    loadList(false, true);
  };

  const loadMore = useCallback(() => {
    if (!hasNextPage) return;
    if (inView && hasNextPage) {
      const loadMorePage = sessionStorage.getItem("catLoadMore");
      const nextPage = Number(loadMorePage) + 1;
      setPage(nextPage);
      loadList(true, false, 1000, nextPage);
    }
  }, [inView, hasNextPage]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  const handleMarkClick = () => {
    setMarkOpen(!markOpen);
    sessionStorage.setItem("markOpen", String(!markOpen));
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className="border-none min-h-screen">
        <div className="sticky top-0 z-50 bg-white dark:bg-bk">
          <Header
            currentPage="categories"
            catList={catList.current}
            subList={subList}
            setTabChange={setTabChange}
            filter={filter}
            setFilter={setFilter}
          />
          <div className="w-full bg-defaultBg flex items-center p-3 my-2  dark:bg-nbk">
            <span className="text-lg w-20">{t("comic.popular_tags")}</span>
            <div
              className="flex overflow-x-auto whitespace-nowrap"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {cateFilterList.tags?.length > 0 &&
                cateFilterList.tags.map((d: any, i: number) => (
                  <Link key={d + i} to={`/search?filter=${d}`} onClick={() => sessionStorage.setItem("searchQuery", d)}>
                    <p className="bg-white rounded-md border border-solid border-bk ml-3 px-2 py-1 dark:bg-nbk dark:border-white">
                      {d}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
          <div className="bg-defaultBg p-4 border-none outline-none  dark:bg-nbk">
            <div className="flex items-center justify-between">
              <span className="text-lg">{t("comic.my_favorites")}</span>
              {!markOpen ? (
                <ArrowDropUpIcon
                  sx={{ fontSize: 26, stroke: "#ff6f00", strokeWidth: 1, color: "#ff6f00" }}
                  onClick={handleMarkClick}
                />
              ) : (
                <ArrowDropDownIcon
                  sx={{ fontSize: 26, stroke: "#ff6f00", strokeWidth: 1, color: "#ff6f00" }}
                  onClick={handleMarkClick}
                />
              )}
            </div>
            <motion.div
              initial={{ opacity: 1, height: "auto" }}
              animate={{ opacity: markOpen ? 1 : 0, height: markOpen ? "auto" : 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {!logined ? (
                <div className="flex justify-center">
                  <button
                    className="px-4 py-2 rounded-md border-2 border-solid border-stone-600 bg-og text-white"
                    onClick={() => setDialogOpen({ ...dialogOpen, login: true })}
                  >
                    {t("login.login_register")}
                  </button>
                </div>
              ) : (
                <div className="w-full grid grid-cols-4 place-items-start mt-2">
                  {catList.current.marks?.length > 0 &&
                    catList.current.marks.map((d: any, i: number) => (
                      <Link
                        to={`/search?filter=${d.tag}`}
                        key={d.tag + i}
                        className="flex items-center flex-col"
                        onClick={() => sessionStorage.setItem("searchQuery", d)}
                      >
                        <p className="bg-white text-center w-24 text-wrap border border-solid border-bk rounded-md mb-1 p-1 dark:bg-nbk dark:border-white">
                          #{d.tag}
                        </p>
                        <p className="text-sm text-gy">{d.updated_at}</p>
                      </Link>
                    ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
        <PullToRefreshify
          completeDelay={1000}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderText={renderText}
          className="overflow-y-visible"
        >
          {cateFilterList.list?.length > 0 && (
            <>
              <div className="bg-white dark:bg-nbk">
                <ComicList
                  t={t}
                  link={true}
                  listName={"cateFilterList"}
                  list={cateFilterList.list}
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
              </div>
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
      </div>
      <BottomNav currentPage="categories" />
      <TopBtn />
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
    </>
  );
};
export default Categories;
