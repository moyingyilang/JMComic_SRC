import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import TopBtn from "../../components/Common/TopBtn";
import SearchIcon from "@mui/icons-material/Search";
import Loading from "../../components/Common/Loading";
import SelectMenu from "../../components/Library/SelectMenu";
import CreatorList from "../../components/Library/CreatorList";
import { FETCH_CREATOR_AUTHOR_THUNK, FETCH_CREATOR_WORK_THUNK } from "../../actions/creatorAction";
import { CLEAR_CREATOR_LIST, LOAD_CREATOR_LIST } from "../../reducers/creatorReducer";
import { GoBack } from "../../Hooks";

const Library = () => {
  const { config } = useGlobalConfig();
  const { setting } = config;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const libTab = sessionStorage.getItem("lib");
  const [searchConfig, setSearchConfig] = useState({ query: "", tab: Number(libTab) || 1, page: 1 });
  const [filter, setFilter] = useState<any>({ language: "", source: "" });
  const { creatorAuthorList, creatorWorkList, isLoading, isLoadMore } = useAppSelector((state) => state.creator);

  const currentTab = searchConfig.tab === 1 ? creatorAuthorList : creatorWorkList;
  const pageLimit = currentTab.list?.length ? Math.ceil(currentTab.total / 30) : 0;
  const hasNextPage = searchConfig.page <= pageLimit && pageLimit > 1;

  // GetList
  const loadList = (
    isLoadMore: boolean = false,
    isRefreshing: boolean = false,
    page: number = searchConfig.page,
    query: string = searchConfig.query,
    tab: number = searchConfig.tab
  ) => {
    if (isRefreshing) {
      sessionStorage.setItem("catLoadMore", "1");
      setSearchConfig({ ...searchConfig, query, tab, page: 1 });
      dispatch(CLEAR_CREATOR_LIST("creatorAuthorList"));
    }
    dispatch(LOAD_CREATOR_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    setTimeout(() => {
      if (tab === 1) {
        dispatch(FETCH_CREATOR_AUTHOR_THUNK({ page, search_query: query }));
      } else {
        dispatch(
          FETCH_CREATOR_WORK_THUNK({
            page: page,
            search_value: query,
            lang: filter.language,
            source: filter.source,
          })
        );
      }
      sessionStorage.setItem("libLoadMore", String(page));
    }, 500);
  };

  // lang & source
  useEffect(() => {
    loadList();
  }, [filter]);

  // loading more
  const handleLoadMore = () => {
    if (!hasNextPage) return;
    const loadMorePage = sessionStorage.getItem("libLoadMore");
    const nextPage = Number(loadMorePage) + 1;
    setSearchConfig({ ...searchConfig, page: nextPage });
    loadList(true, false, nextPage);
  };

  const handleClickTab = (tab: number) => {
    loadList(false, false, 1, "", tab);
    sessionStorage.setItem("lib", String(tab));
    setSearchConfig({ ...searchConfig, tab });
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className="sticky top-0 h-20 bg-bbk text-white flex items-end p-2 py-3 z-50">
        <GoBack back={sessionStorage.getItem("fromPage") || "/"} />
        <p className="ml-4 text-2xl text-og">{t("library.forbidden_comic_library")}</p>
      </div>
      <div className="relative w-full flex justify-cneter my-4">
        <input
          type="text"
          className="relative m-auto w-11/12 h-12 border-none outline-none rounded-full text-gy px-9 dark:bg-nbk"
          placeholder={t("search.search_keyword")}
          value={searchConfig.query}
          onChange={(e) => setSearchConfig((prev: any) => ({ ...prev, query: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter") loadList(false, false, 1, (e.target as HTMLInputElement).value);
          }}
        />
        <SearchIcon className="absolute left-7 top-1/2 transform -translate-y-1/2 text-[#aaa] text-2xl stroke-gray-400" />
        {searchConfig.query && (
          <CloseIcon
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-[#aaa] text-xl stroke-gray-400"
            onClick={() => loadList(false, false, 1, "")}
          />
        )}
      </div>
      <div className="w-full flex justify-around text-center text-lg text-gy">
        {["創作者", "作品"].map((d, i) => (
          <p
            key={d}
            className={`w-1/2 py-4 ${
              searchConfig.tab === i + 1 ? "bg-white text-og font-bold border-b-4 border-og dark:bg-nbk" : ""
            }`}
            onClick={() => handleClickTab(i + 1)}
          >
            {d}
          </p>
        ))}
      </div>
      {searchConfig.tab === 1 ? (
        <>
          {creatorAuthorList.list?.length > 0 &&
            creatorAuthorList.list.map((d: any, i: any) => (
              <Link to={`/library/list?creatorId=${d.id}`} key={i}>
                <div
                  className={`relative bg-cover bg-center overflow-hidden px-4 py-2 my-2`}
                  style={{ backgroundImage: `url(${setting?.img_host + d.background_image})` }}
                >
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-60"></div>
                  <div className="flex items-center relative z-10">
                    <div className="w-2/6">
                      <img
                        src={setting?.img_host + d.author_avatar}
                        alt={d.id}
                        loading="lazy"
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = "1";
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/title-circle.webp";
                        }}
                        className="w-32 object-cover rounded-xl"
                        style={{
                          opacity: "0",
                          transition: "opacity 0.5s ease-in-out",
                        }}
                      />
                    </div>
                    <div className="w-4/6">
                      <p className="text-og text-2xl font-bold p-3">{d.author_name}</p>
                      <span className="text-tgy p-3">
                        {d.update_date}
                        {t("library.update")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </>
      ) : (
        <>
          <SelectMenu t={t} filtersList={creatorWorkList.filters} filter={filter} setFilter={setFilter} />
          <CreatorList list={creatorWorkList.list} setting={setting} />
        </>
      )}
      <div className="flex flex-col justify-center items-center my-10 pb-40">
        {currentTab.list?.length > 0 && isLoading && <img src="/images/loading.gif" alt="loading" width="80px" />}
        {currentTab.list?.length > 0 &&
          (hasNextPage ? (
            <button
              onClick={() => handleLoadMore()}
              className="w-4/12 rounded-sm text-white p-2 bg-og shadow-lg shadow-stone-700/50"
            >
              {t("comic.load_more")}
            </button>
          ) : (
            <p className="text-center mt-10">{t("comic.no_more")}</p>
          ))}
      </div>
      <TopBtn />
    </>
  );
};

export default Library;
