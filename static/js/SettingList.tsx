import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FETCH_COVER_ADS_THUNK } from "../../actions/mainAction";
import { FETCH_SETTINGS_THUNK } from "../../actions/settingAction";
import { SettingLinkData } from "../../assets/JsonData";
import MemberModal from "../../components/Modal/MemberModal";
import { clearAuth } from "../../Hooks/useAuth";
import { CLEAR_BLOG_STATE } from "../../reducers/blogsReducer";
import { CLEAR_CATEGORIES_LIST } from "../../reducers/categoriesReducer";
import { CLEAR_CONTACT_LIST } from "../../reducers/contactReducer";
import { CLEAR_CREATOR_LIST } from "../../reducers/creatorReducer";
import { CLEAR_FORUM_LIST } from "../../reducers/forumReducer";
import { RESET_GAMES_STATE } from "../../reducers/gamesReducer";
import { CLEAR_MAIN_LIST } from "../../reducers/mainReducer";
import { CLEAR_MEMBER_LIST } from "../../reducers/memberReducer";
import { CLEAR_MOVIES_STATE } from "../../reducers/moviesReducer";
import { CLEAR_NOVEL_LIST } from "../../reducers/novelReducer";
import { CLEAR_SEARCH_LIST } from "../../reducers/searchReducer";
import { CLEAR_WEEK_LIST } from "../../reducers/weekReducer";
import { useAppDispatch } from "../../store/hooks";
import { trackAdEvent, useAdImpression } from "../../utils/analytics";
import { getRandomItems } from "../../utils/Function";
import DarkModeToggle from "../Common/DarkModeToggle";
import DialogModal from "../Modal/DialogModal";

const SettingList = (props: any) => {
  const { t, i18n, memberInfo, setting, setConfig, adsContent, showSnackbar } = props;
  const dispatch = useAppDispatch();
  const [dialogOpen, setDialogOpen] = useState({
    setting: false,
    imageSource: false,
    darkMode: false,
    lang: false,
    pagination: false,
    watchAds: false,
    logout: false,
  });
  const settingData = SettingLinkData();
  const [allLinks, setAllLinks] = useState<any[]>([]);
  const [langChange, setLangChange] = useState(() => (localStorage.getItem("langCode") === "1" ? "zh-CN" : "zh-TW"));
  const [paginationModeChange, setPaginationModeChange] = useState<"infinite" | "click">(
    () => (localStorage.getItem("paginationMode") as "infinite" | "click") || "infinite"
  );

  const switchPaginationMode = () => {
    const previousMode = localStorage.getItem("paginationMode") || "infinite";
    localStorage.setItem("paginationMode", paginationModeChange);
    setConfig((prev: any) => ({ ...prev, paginationMode: paginationModeChange }));

    if (previousMode === paginationModeChange) return;

    // 切換時清空，讓相關頁面用新模式從第一頁重新載入
    dispatch(CLEAR_MAIN_LIST("latestList"));
    dispatch(CLEAR_MAIN_LIST("moreList"));
    dispatch(CLEAR_SEARCH_LIST("searchList"));
    dispatch(CLEAR_CATEGORIES_LIST("cateFilterList"));
    dispatch(CLEAR_MOVIES_STATE("moviesList"));
    dispatch(CLEAR_CREATOR_LIST("creatorAuthorList"));
    dispatch(CLEAR_CREATOR_LIST("creatorWorkList"));
    dispatch(CLEAR_MEMBER_LIST("favoriteList"));
    dispatch(CLEAR_MEMBER_LIST("trackedList"));
    dispatch(CLEAR_MEMBER_LIST("notificationList"));
    dispatch(CLEAR_MEMBER_LIST("watchList"));
    dispatch(CLEAR_NOVEL_LIST("novelFavoritesList"));
    dispatch(CLEAR_FORUM_LIST("forumList"));
    dispatch(CLEAR_CONTACT_LIST("supportReportList"));
    dispatch(CLEAR_BLOG_STATE("blogsList"));
    dispatch(RESET_GAMES_STATE());
    dispatch(CLEAR_WEEK_LIST("weekFilterList"));

    sessionStorage.setItem("mainLoadMore", "0");
    sessionStorage.setItem("catLoadMore", "1");
    sessionStorage.removeItem("searchLoadMore");
    sessionStorage.removeItem("moviesLoadMore");
    sessionStorage.removeItem("libLoadMore");
    sessionStorage.removeItem("gamesLoadMore");
    sessionStorage.removeItem("favoriteLoadMore");
    sessionStorage.removeItem("novelFavoriteLoadMore");
    sessionStorage.removeItem("trackedLoadMore");
    sessionStorage.removeItem("notificationLoadMore");
    sessionStorage.removeItem("watchLoadMore");
    sessionStorage.removeItem("blogsLoadMore");
    sessionStorage.removeItem("weekLoadMore");
    sessionStorage.removeItem("forumLoadMore");
    sessionStorage.removeItem("memberCommentsLoadMore");
    sessionStorage.removeItem("comicCommentsLoadMore");
    sessionStorage.removeItem("blogsCommentsLoadMore");
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const coverLinks = adsContent?.link?.exchange_link;

  useEffect(() => {
    if (!coverLinks) return;
    const LinksAdd = coverLinks.show_max - (coverLinks.first_links?.length ?? 0);
    const { items: secondRandomItem } = getRandomItems(coverLinks.second_links, LinksAdd);
    setAllLinks([...(coverLinks.first_links || []), ...secondRandomItem]);
  }, [adsContent]);

  useAdImpression(
    containerRef,
    true,
    () =>
      trackAdEvent("jm3_ad_impression", {
        adKey: "exchange_link_setting",
        ad_desc: "exchange_link_setting",
        adName: "exchange_link_setting",
      }),
    adsContent?.length
  );

  const switchLanguage = async () => {
    const isCN = langChange === "zh-CN";
    const langCode = isCN ? "1" : "0";
    const lang = isCN ? "CN" : "TW";
    i18n.changeLanguage(langChange);
    localStorage.setItem("langCode", langCode);
    localStorage.setItem("lang", lang);
    setConfig((prev: any) => ({ ...prev, langCode, lang }));
    dispatch(FETCH_SETTINGS_THUNK(langCode));
    dispatch(CLEAR_MAIN_LIST("mainList"));
    const coverAds = await dispatch(
      FETCH_COVER_ADS_THUNK({ lang, ipcountry: lang, v: setting.ad_cache_version })
    ).unwrap();
    if (coverAds) {
      localStorage.setItem("adsContent", JSON.stringify(coverAds));
      setConfig((prev: any) => ({ ...prev, adsContent: coverAds }));
    }
  };

  return (
    <>
      <div className="w-full text-[#aaa] dark:text-tgy pb-40" ref={containerRef}>
        <ul className="pt-1 text-base">
          <div className="mt-5">
            {Array.isArray(settingData[0].new) &&
              settingData[0].new.map((item) => (
                <li key={item.name} className="bg-white flex justify-between items-center px-4 py-2 my-1 dark:bg-nbk">
                  <span className="text-bbk dark:text-tgy">{item.title}</span>
                  {item.name === t("setting.view_articles") ? (
                    <span onClick={() => setDialogOpen({ ...dialogOpen, setting: true })}>{item.name}</span>
                  ) : (
                    <a
                      href={item.link?.startsWith("http") ? item.link : setting.main_web_host}
                      target="blank"
                      rel="noreferrer"
                    >
                      {item.name}
                    </a>
                  )}
                </li>
              ))}
            {Array.isArray(allLinks) &&
              allLinks.map((item: any, index: number) => (
                <li
                  key={item.name}
                  className="bg-white flex justify-between items-center px-4 py-2 my-1 dark:bg-nbk"
                  onClick={() =>
                    trackAdEvent("jm3_ad_click", {
                      adKey: "exchange_link_setting",
                      ad_desc: "exchange_link_setting",
                      adName: item.name,
                    })
                  }
                >
                  <span className="text-bbk dark:text-tgy">{index === 0 && t("setting.site_link")}</span>
                  <a
                    href={item.link.startsWith("http") ? item.link : setting.main_web_host}
                    target="blank"
                    rel="noreferrer"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            {Array.isArray(settingData[2].setting) &&
              settingData[2].setting.map((item) => (
                <li key={item.name} className="bg-white flex justify-between items-center px-4 py-2 my-1 dark:bg-nbk">
                  <span className="text-bbk dark:text-tgy">{item.title}</span>
                  {item.title === t("setting.language") && (
                    <span
                      className="text-og flex items-center"
                      onClick={() => setDialogOpen({ ...dialogOpen, lang: true })}
                    >
                      {item.name}
                      <KeyboardArrowRightIcon className="text-bbk dark:text-tgy" />
                    </span>
                  )}
                  {item.title === t("setting.pagination") && (
                    <span
                      className="text-og flex items-center"
                      onClick={() => setDialogOpen({ ...dialogOpen, pagination: true })}
                    >
                      {t(paginationModeChange === "click" ? "setting.pagination_click" : "setting.pagination_infinite")}
                      <KeyboardArrowRightIcon className="text-bbk dark:text-tgy" />
                    </span>
                  )}
                  {item.title === t("setting.switch_image_source") && (
                    <span
                      className="text-og flex items-center"
                      onClick={() => setDialogOpen({ ...dialogOpen, imageSource: true })}
                    >
                      {item.name}
                      <KeyboardArrowRightIcon className="text-bbk dark:text-tgy" />
                    </span>
                  )}
                  {item.title === t("setting.night_mode") && (
                    <div className="text-og flex items-center">
                      <DarkModeToggle isButtonVisible={true} />
                      <KeyboardArrowRightIcon className="text-bbk dark:text-tgy" />
                    </div>
                  )}
                </li>
              ))}
            {Array.isArray(settingData[3].sponsor) &&
              settingData[3].sponsor.map((item: any, index: number) => (
                <li
                  key={item.name}
                  className="bg-white flex justify-between items-center px-4 py-2 my-1 dark:bg-nbk"
                  onClick={() =>
                    trackAdEvent("jm3_ad_click", {
                      adKey: "exchange_link_setting",
                      ad_desc: "exchange_link_setting",
                      adName: item.name,
                    })
                  }
                >
                  <span className="text-bbk dark:text-tgy">{item.title}</span>
                  {index === 0 ? (
                    <Link to="/pay">{item.name}</Link>
                  ) : (
                    <button onClick={() => setDialogOpen({ ...dialogOpen, watchAds: true })}>{item.name}</button>
                  )}
                </li>
              ))}
            {Array.isArray(settingData[4].contact) &&
              settingData[4].contact.map((item) => (
                <li key={item.name} className="bg-white flex justify-between items-center px-4 py-2 my-1 dark:bg-nbk">
                  <span className="text-bbk dark:text-tgy">{item.title}</span>
                  <a
                    href={item.link.startsWith("http") ? item.link : setting.main_web_host}
                    target="blank"
                    rel="noreferrer"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            {memberInfo !== null &&
              Array.isArray(settingData[5].logout) &&
              settingData[5].logout.map((item) => (
                <li
                  key={item.name}
                  className="bg-white flex justify-center items-center px-4 py-4 my-1  dark:bg-nbk"
                  onClick={() => setDialogOpen({ ...dialogOpen, logout: true })}
                >
                  <span className="text-og">{item.name}</span>
                </li>
              ))}
          </div>
        </ul>
        {(dialogOpen.setting || dialogOpen.lang || dialogOpen.pagination || dialogOpen.logout) && (
          <MemberModal
            setDialogOpen={setDialogOpen}
            dialogOpen={dialogOpen}
            langChange={langChange}
            setLangChange={setLangChange}
            paginationModeChange={paginationModeChange}
            setPaginationModeChange={setPaginationModeChange}
            switchPaginationMode={switchPaginationMode}
            memberInfo={memberInfo}
            clearAuth={clearAuth}
            switchLanguage={switchLanguage}
            showSnackbar={showSnackbar}
            setConfig={setConfig}
            setting={setting}
          />
        )}
        <DialogModal setDialogOpen={setDialogOpen} dialogOpen={dialogOpen} />
      </div>
    </>
  );
};

export default SettingList;
