import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Loading from "../../components/Common/Loading";
import TopBtn from "../../components/Common/TopBtn";
import ComicList from "../../components/Common/ComicList";
import MsgModal from "../../components/Modal/MsgModal";
import DialogModal from "../../components/Modal/DialogModal";
import AdComponent from "../../components/Ads/AdComponent";
import { CLEAR_SEARCH_LIST, LOAD_SEARCH_LIST } from "../../reducers/searchReducer";
import { FETCH_SEARCH_THUNK, FETCH_HOT_TAGS_THUNK, FETCH_RECOMMEND_THUNK } from "../../actions/searchAction";
import { renderText } from "../../utils/Function";
import { SearchHelpData, SearchSortData } from "../../assets/JsonData";
import { defaultEditInitialState } from "../../utils/InterFace";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import { useScrollToTop } from "../../Hooks";

const Search = () => {
  const { config } = useGlobalConfig();
  const { setting, logined } = config;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const radioItems = t("search.radio_option", { returnObjects: true });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchSort = SearchSortData();
  const searchHelp = SearchHelpData();
  const dispatch = useAppDispatch();
  const { searchList, hotTagsList, randomRecommendList, isLoading, isRefreshing } = useAppSelector(
    (state) => state.search
  );
  const [dialogOpen, setDialogOpen] = useState({ search: false, folder: false });
  const [msgOpen, setMsgOpen] = useState({ search: false });
  const location = useLocation();
  const scrollToTop = useScrollToTop();
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get("filter") ?? "";
  const fromPage = sessionStorage.getItem("fromPage") || "/";
  const filterSerch = sessionStorage.getItem("searchQuery");
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const historyStored = localStorage.getItem("search");
    return historyStored ? JSON.parse(historyStored) : [];
  });
  const randomNum = Math.floor(Math.random() * randomRecommendList?.length);
  const randomItemId = randomRecommendList && randomRecommendList[randomNum]?.id;
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();
  const pageLimit = searchList.list?.length > 0 ? Math.ceil(searchList.total / 80) : 0;
  const hasNextPage = page <= pageLimit && pageLimit > 1;
  const searchInitialState = {
    start: false,
    query: "",
    selected: "成人A漫",
    sort: searchSort[0],
  };
  const [searchConfig, setSearchConfig] = useState(searchInitialState);
  const [editFolder, setEditFolder] = useState(defaultEditInitialState);

  const loadList = useCallback(
    (
      isLoadMore: boolean = false,
      isRefreshing: boolean = false,
      page: number = 1,
      time: number = 0,
      search_query: string = searchConfig.query,
      o: string = searchConfig.sort.key
    ) => {
      dispatch(LOAD_SEARCH_LIST({ isLoading: true, isLoadMore, isRefreshing }));
      if (!isLoadMore) {
        setPage(1);
      }
      setTimeout(async () => {
        const result = await dispatch(FETCH_SEARCH_THUNK({ search_query, o, page })).unwrap();
        if (result.redirect_aid) {
          navigate(`/comic/detail?id=${result.redirect_aid}`);
        }
      }, time);
    },
    [searchConfig]
  );

  // tags & recommend
  useEffect(() => {
    scrollToTop();
    if (hotTagsList?.length === 0 && randomRecommendList?.length === 0) {
      dispatch(FETCH_HOT_TAGS_THUNK());
      dispatch(FETCH_RECOMMEND_THUNK());
    }
  }, [hotTagsList.length, randomRecommendList.length]);

  // detail tag filter
  // 排序 預設最新 mv最多點閱 mp最多圖片 tf最多愛心

  useEffect(() => {
    if (filter === filterSerch) {
      setSearchConfig((prev: any) => ({ ...prev, start: true, query: filterSerch }));
      return;
    }
    if (filter && filter !== searchConfig.query) {
      handlerSearch(filter);
    } else if (filter === "") {
      setSearchConfig((prev: any) => ({ ...prev, ...searchInitialState }));
    }
  }, [filter]);

  // // search event
  const handlerSearch = (query: string, sort: string = "") => {
    if (searchConfig.selected === "成人A漫") {
      setPage(1);
      loadList(false, false, 1, 0, query, sort);
      setSearchConfig((prev: any) => ({ ...prev, start: true, query }));
      handleSearchStorage(query, "add");
      navigate(`/search?filter=${encodeURIComponent(query)}`);
    } else {
      const selected = searchConfig.selected === "小電影" ? "movie" : "video";
      navigate(`/movies?videoType=${selected}&searchQuery=${encodeURIComponent(query)}`);
    }
  };

  const handleRefresh = () => {
    if (!isLoading) {
      loadList(false, true, 1, 0);
    }
  };

  // search history
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem("search", JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  const handleSearchStorage = (item: string | null, action: "add" | "remove" | "allRemove") => {
    setSearchHistory((prevHistory: any) => {
      let updatedHistory;
      if (action === "add") {
        if (!prevHistory.includes(item)) {
          updatedHistory = [...prevHistory, item];
        } else {
          updatedHistory = prevHistory;
        }
      } else if (action === "remove") {
        updatedHistory = prevHistory.filter((historyItem: string) => historyItem !== item);
      } else if (action === "allRemove") {
        updatedHistory = [];
        localStorage.removeItem("search");
      }
      return updatedHistory;
    });
  };

  const loadMore = useCallback(() => {
    if (!hasNextPage) return;
    if (inView && hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadList(true, false, nextPage, 1000);
    }
  }, [inView, hasNextPage]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  const clearSearch = () => {
    dispatch(CLEAR_SEARCH_LIST("searchList"));
    navigate(`/search`);
    sessionStorage.removeItem("searchQuery");
    setSearchConfig((prev: any) => ({ ...prev, ...searchInitialState }));
  };

  const backPath = () => {
    if (location.search && filterSerch === null) {
      navigate(-2);
    } else if (filterSerch) {
      clearSearch();
      sessionStorage.removeItem("searchQuery");
    } else {
      navigate(fromPage);
    }
  };

  return (
    <div className="min-h-screen">
      {isLoading && searchConfig.start && <Loading />}
      <div className="w-full bg-og text-white flex justify-between p-2">
        <div className="flex items-center w-1/12" onClick={backPath}>
          <ArrowBackIosNewIcon sx={{ stroke: "white", strokeWidth: 2 }} />
        </div>
        <div className="flex flex-wrap items-start w-11/12 m-2 flex-col">
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              className="w-full h-8 border-none outline-none rounded-sm text-gy px-8"
              placeholder={t("search.search_keyword")}
              value={searchConfig.query}
              onChange={(e) => setSearchConfig((prev: any) => ({ ...prev, query: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlerSearch((e.target as HTMLInputElement).value);
                  sessionStorage.setItem("searchQuery", (e.target as HTMLInputElement).value);
                }
              }}
            />
            <SearchIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 text-[#aaa] text-3xl" />
            {searchConfig.query && (
              <CloseIcon
                sx={{ stroke: "#757575", strokeWidth: 2 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#aaa] text-xl stroke-gray-400"
                onClick={clearSearch}
              />
            )}
          </div>
          <div className="flex py-2">
            {Array.isArray(radioItems) &&
              radioItems.map((d, i) => (
                <div key={i} className="mr-4 mt-2">
                  <label>
                    <input
                      value={d}
                      type="radio"
                      checked={searchConfig.selected === d}
                      onChange={() => {
                        inputRef.current?.focus();
                        setSearchConfig((prev: any) => ({ ...prev, selected: d }));
                      }}
                    />
                    {d}
                  </label>
                </div>
              ))}
          </div>
          <div className="flex" onClick={() => setMsgOpen({ ...msgOpen, search: true })}>
            <HelpOutlineIcon />
            <span>{t("search.best_search_posture")}</span>
          </div>
        </div>
      </div>

      {searchConfig.start && searchList.list?.length > 0 ? (
        <PullToRefreshify
          completeDelay={1000}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderText={renderText}
          className="overflow-y-visible"
          style={{ marginTop: "30px" }}
        >
          <div className="bg-white w-full dark:bg-nbk">
            <div className="h-10 flex items-center p-2 pt-5">
              <p>
                {t("search.search")}&nbsp;'{searchConfig.query}'&nbsp;共&nbsp;{searchList.total || 0}
                &nbsp;{t("search.results")}
              </p>

              <button
                className="ml-auto border-[1px] border-solid border-og py-1 px-1 rounded-md flex items-center dark:bg-nbk"
                onClick={() => setDialogOpen({ ...dialogOpen, search: true })}
              >
                {searchConfig.sort.title}
                <ArrowDropDownIcon />
              </button>
            </div>
            <ComicList
              t={t}
              title="search"
              link={true}
              listName={"searchList"}
              list={searchList.list}
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
        </PullToRefreshify>
      ) : (
        <div>
          {!isLoading && searchConfig.start && searchList.list?.length === 0 && (
            <div className="bg-white text-gy text-center py-5 dark:bg-nbk">{t("search.no_data_found")}</div>
          )}
          <div className="bg-white mt-3 p-2 dark:bg-nbk">
            <p className="font-black">{t("search.popular_adult_topics")}</p>
            <div className="flex flex-wrap py-2">
              {hotTagsList?.length > 0 &&
                hotTagsList.map((d, i) => (
                  <p
                    key={i}
                    className="border-[1px] border-solid border-gy rounded-md m-1 p-1"
                    onClick={() => {
                      handlerSearch(d);
                      sessionStorage.setItem("searchQuery", d);
                    }}
                  >
                    {"#" + d}
                  </p>
                ))}
            </div>
          </div>
          {searchHistory.length > 0 && (
            <div className="bg-white mt-3 p-2 dark:bg-nbk">
              <p className="font-black">{t("search.search_history")}</p>
              <div className="mt-3">
                {[...searchHistory].reverse().map((d: string, i: number) => (
                  <div key={i} className="flex items-center px-1 border-b-[1px]">
                    <p
                      className="w-11/12 p-2 pt-3"
                      onClick={() => {
                        handlerSearch(d);
                        sessionStorage.setItem("searchQuery", d);
                      }}
                    >
                      {d}
                    </p>

                    <CloseIcon
                      className="ml-auto"
                      sx={{ stroke: "#757575", strokeWidth: 2 }}
                      onClick={() => {
                        handleSearchStorage(d, "remove");
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="w-full flex justify-end my-4">
                <p
                  className="text-og"
                  onClick={() => {
                    handleSearchStorage(null, "allRemove");
                  }}
                >
                  {t("search.clear_search_history")}
                </p>
              </div>
            </div>
          )}
          <div className="bg-white mt-3 p-2 dark:bg-nbk">
            <p className="font-black">{t("search.random_recommendation")}</p>
            <ComicList
              t={t}
              title="search"
              link={true}
              smImgSize={true}
              listName={"randomRecommendList"}
              list={randomRecommendList}
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
            <Link to={`/comic/detail?id=${randomItemId}`}>
              <p className="text-og text-center py-5 border-y-[1px] border-solid border-tgy">
                {t("search.random_recommendation")}
              </p>
            </Link>
          </div>
          <AdComponent adKey="app_search_bottom" />
        </div>
      )}
      <TopBtn />
      {msgOpen.search && <MsgModal content={searchHelp} msgOpen={msgOpen} setMsgOpen={setMsgOpen} />}
      {dialogOpen.search && (
        <DialogModal
          content={searchSort}
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          setSearchConfig={setSearchConfig}
          searchConfig={searchConfig}
          handlerSearch={handlerSearch}
        />
      )}
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
    </div>
  );
};
export default Search;
