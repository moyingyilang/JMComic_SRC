import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import Content from "../../components/Games/Content";
import BottomNav from "../../components/Main/BottomNav";
import TopBtn from "../../components/Common/TopBtn";
import AdComponent from "../../components/Ads/AdComponent";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { FETCH_GAMES_LIST_THUNK, FETCH_BANNERS_THUNK, FETCH_CATEGORIES_THUNK } from "../../actions/gamesAction";
import { CLEAR_GAMES_LIST, RESET_GAMES_STATE, CLEAR_GAMES_BANNERS } from "../../reducers/gamesReducer";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useGlobalConfig } from "../../GlobalContext";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { renderText } from "../../utils/Function";
import Header from "../../components/Common/Header";
import { useTranslation } from "react-i18next";

const Games: React.FC = () => {
  const dispatch = useAppDispatch();
  const { config } = useGlobalConfig();
  const { setting } = config;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { games, hotGames, categories, isLoading, isLoadMore, hasMore, bannerList } = useAppSelector(
    (state) => state.games
  );

  const [subCategories, setSubCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSlug, setSelectedSlug] = useState("");
  const [isSubMenuSelect, setIsSubMenuSelect] = useState("");
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [subCategorySlug, setSubCategorySlug] = useState("");
  const [searchText, setSearchText] = useState("");
  const [committedText, setCommittedText] = useState("");
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasInitLoaded, setHasInitLoaded] = useState(false);
  const observerLockRef = useRef(false);
  const loadMoreRef = useRef(null);
  const hasLoadedOnce = useRef(false);
  const { t } = useTranslation();

  sessionStorage.setItem("fromPage", `${window.location.pathname}`);
  interface CategoryItem {
    name: string;
    slug: string;
    [key: string]: any;
  }

  const loadGameList = useCallback(
    (page: number, append = false, customSlug?: string, customSubCategory?: string, customSearch?: string) => {
      return dispatch(
        FETCH_GAMES_LIST_THUNK({
          page,
          append,
          search_query: customSearch ?? committedText,
          category: customSlug ?? selectedSlug,
          sub_category: customSubCategory ?? subCategorySlug,
        })
      );
    },
    [dispatch, committedText, selectedSlug, subCategorySlug]
  );

  const handleCategoryClick = useCallback(
    (item: CategoryItem): void => {
      setSearching(false);
      setSelectedCategory(item.name);
      setSelectedSlug(item.slug);
      setIsSubMenuSelect("");
      setSubCategorySlug("");
      setIsMenuVisible(true);
      setCommittedText("");
      setPage(1);
      setHasInitLoaded(false);
      dispatch(CLEAR_GAMES_LIST());
      loadGameList(1, false, item.slug, "", "").then(() => setHasInitLoaded(true));
      sessionStorage.setItem("selectedCategory", item.name);
    },
    [dispatch, loadGameList]
  );

  const handleSubMenuClick = useCallback(
    (item: CategoryItem): void => {
      setIsSubMenuSelect(item.name);
      setSubCategorySlug(item.slug);
      setPage(1);
      setHasInitLoaded(false);
      dispatch(CLEAR_GAMES_LIST());
      loadGameList(1, false, selectedSlug, item.slug).then(() => setHasInitLoaded(true));
    },
    [dispatch, loadGameList]
  );

  const exitSearchMode = () => {
    setSearching(false);
    setSearchText("");
    setCommittedText("");
    setIsSubMenuSelect("");
    setSubCategorySlug("");
    setPage(1);
    setHasInitLoaded(false);
    dispatch(CLEAR_GAMES_LIST());
    if (categories.length > 0) {
      const firstCat = categories[0];
      setSelectedCategory(firstCat.name);
      setSelectedSlug(firstCat.slug);
      loadGameList(1, false, firstCat.slug, "", "").then(() => setHasInitLoaded(true));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      setSearching(true);
      setSelectedCategory("");
      setSelectedSlug("");
      setIsSubMenuSelect("");
      setSubCategorySlug("");
      setIsMenuVisible(false);
      setCommittedText(searchText);
      setPage(1);
      setHasInitLoaded(false);
      dispatch(CLEAR_GAMES_LIST());
      loadGameList(1, false, "", "", searchText).then(() => setHasInitLoaded(true));
    }
  };
  const handleRefresh = () => {
    setPage(1);
    setHasInitLoaded(false);
    dispatch(CLEAR_GAMES_LIST());
    setIsRefreshing(true);
    return loadGameList(1, false).then(() => {
      setHasInitLoaded(true);
      setIsRefreshing(false);
    });
  };

  useEffect(() => {
    if (hasInitLoaded) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadMore && !observerLockRef.current) {
          observerLockRef.current = true;
          setPage((prev) => prev + 1);
        }
      });
      const currentRef = loadMoreRef.current;
      if (currentRef) observer.observe(currentRef);
      return () => {
        if (currentRef) observer.unobserve(currentRef);
        observer.disconnect();
      };
    }
  }, [hasInitLoaded, hasMore, isLoadMore]);

  useEffect(() => {
    const category = categories.find((cat) => cat.name === selectedCategory);
    if (category && category.game_types) {
      const typesArray = Array.isArray(category.game_types)
        ? category.game_types
        : (Object.values(category.game_types) as CategoryItem[]);
      setSubCategories(typesArray);
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory && !hasLoadedOnce.current && games.length === 0) {
      hasLoadedOnce.current = true;
      handleCategoryClick(categories[0]);
    }
  }, [categories, selectedCategory, handleCategoryClick, games.length]);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(FETCH_CATEGORIES_THUNK());
    } else {
      const selectCat = sessionStorage.getItem("selectedCategory") || "";
      const firstCat = selectCat || categories[0].name;
      setSelectedCategory(firstCat);
    }
  }, [dispatch, categories.length]);

  useEffect(() => {
    if (setting && bannerList.length === 0) {
      // dispatch(CLEAR_GAMES_BANNERS());
      // dispatch(FETCH_BANNERS_THUNK(setting));
    }
  }, [dispatch, setting, bannerList.length]);

  useEffect(() => {
    if (page > 1) {
      loadGameList(page, true).then(() => {
        observerLockRef.current = false;
      });
    }
  }, [page, loadGameList]);

  return (
    <>
      {/* 頂部固定導航列 */}
      <div className="sticky top-0 w-full text-white z-50 bg-[#242424]">
        <Header />
        {/* 橫幅輪播 */}
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination]}
          className="mySwiper h-fit mb-3"
        >
          {bannerList?.map((item, index) => (
            <SwiperSlide key={index}>
              <a href={item.link} target="_blank" rel="noreferrer">
                <img
                  src={item ? item.image : "/images/title-circle.webp"}
                  alt={`banner-${index}`}
                  className="w-full h-full object-cover"
                />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* 分類選單區域 */}
        <div className="flex items-center space-x-6 p-2 text-white">
          <div className="w-full">
            <ul className="flex gap-5 rounded-full bg-white text-black px-4 py-2 items-center justify-between">
              {/* 非搜尋模式下顯示主分類清單 */}
              {!searching ? (
                <>
                  {categories.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        handleCategoryClick(item);
                      }}
                      className={`${selectedCategory === item.name ? "text-orange-500" : "text-black"} cursor-pointer`}
                    >
                      {item.name}
                    </li>
                  ))}
                  {/* 搜尋圖示按鈕 */}
                  <li className="ml-auto w-10 h-10 bg-black rounded-full text-white text-center flex items-center justify-center">
                    <SearchIcon
                      onClick={() => {
                        setSearching(true);
                        setSearchText("");
                        setCommittedText("");
                      }}
                      className="cursor-pointer"
                    />
                  </li>
                </>
              ) : (
                // 搜尋模式下顯示返回和輸入框
                <>
                  <ArrowBackIcon onClick={exitSearchMode} className="cursor-pointer" />
                  <input
                    type="text"
                    className="flex-1 px-3 py-1 outline-none text-black"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("games.search_placeholder")}
                  />
                  <SearchIcon
                    onClick={() => {
                      setSearching(true);
                      setSearchText("");
                      setCommittedText(""); // 清除舊的
                      setPage(1);
                      setHasInitLoaded(false);
                      dispatch(RESET_GAMES_STATE());
                      loadGameList(1, false).then(() => {
                        setHasInitLoaded(true);
                      });
                    }}
                    className="cursor-pointer"
                  />
                </>
              )}
            </ul>
            {/* 顯示子分類清單（在非搜尋模式且有子分類時） */}
            {!searching && isMenuVisible && (
              <div className="p-2 mt-2">
                <ul className="flex gap-5">
                  {subCategories.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSubMenuClick(item)}
                      className={`${
                        isSubMenuSelect === item.name ? "text-orange-500 border-orange-500" : "text-white border-white"
                      } rounded-full py-1 px-2 border cursor-pointer`}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 內容區域：熱門遊戲區塊和遊戲列表 */}
      {!isLoading ? (
        <PullToRefreshify
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          renderText={renderText}
          completeDelay={1000}
        >
          <Content games={games} hotGames={hotGames} selectedCategory={selectedCategory} />
        </PullToRefreshify>
      ) : (
        // 資料載入中的指示 (初次載入)
        <div className="w-full h-96 flex justify-center items-center flex-col">
          <img src="/images/loading.gif" alt="loading" width="80px" />
          <p className="dark:text-white">{t("games.loading")}</p>
        </div>
      )}

      {/* 無限滾動觸發點 */}
      {hasMore && <div ref={loadMoreRef} className="h-10"></div>}

      {!isLoading && (
        <>
          {games.length === 0 ? (
            //  沒資料時顯示這個
            <div className="w-full h-10 flex justify-center items-center mb-20">
              <p className="text-gray-500 dark:text-white">{t("games.no_data_found")}</p>
            </div>
          ) : (
            !hasMore && (
              //  有資料但到底時顯示這個
              <div className="w-full h-10 flex justify-center items-center mb-20">
                <p className="text-gray-400 dark:text-white">{t("games.no_more_content")}</p>
              </div>
            )
          )}
        </>
      )}
      {/* 底部導航 */}
      <BottomNav currentPage="games" />
      <TopBtn />
    </>
  );
};

export default Games;
