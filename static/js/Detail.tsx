import ShareIcon from "@mui/icons-material/Share";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { GoBack, useScrollToTop } from "../../Hooks";
import { FETCH_DETAIL_THUNK } from "../../actions/detailAction";
import { FETCH_COIN_BUY_THUNK } from "../../actions/mainAction";
import AdComponent from "../../components/Ads/AdComponent";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import Comment from "../../components/Comic/Comment";
import Desc from "../../components/Comic/Desc";
import Series from "../../components/Comic/Series";
import Share from "../../components/Comic/Share";
import HeaderAds from "../../components/Common/HeaderAds";
import Loading from "../../components/Common/Loading";
import TopBtn from "../../components/Common/TopBtn";
import DialogModal from "../../components/Modal/DialogModal";
import MemberModal from "../../components/Modal/MemberModal";
import { RESET_DETAIL_STATE } from "../../reducers/detailReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { defaultEditInitialState, defaultUserFormData } from "../../utils/InterFace";

const Detail = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined, darkMode, memberInfo, adsContent } = config;
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollToTop = useScrollToTop();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const searchParams = new URLSearchParams(location.search);
  const queryId = searchParams.get("id") as string;
  const readId = searchParams.get("readId") as string;
  const queryEp = searchParams.get("episode") as string;
  const querySubEp = searchParams.get("subEpisode") as string;
  const menuItems = t("detail.menu_items", { returnObjects: true });
  const [tab, setTab] = useState(1);
  const [showTagMore, setShowTagMore] = useState(false);
  const [share, setShare] = useState(false);
  const dispatch = useAppDispatch();
  const { detailList, isLoading } = useAppSelector((state) => state.detail);
  const hasData = detailList && Object.keys(detailList).length > 0 && String(detailList.id) === String(queryId);

  const [goBack, setGoBack] = useState<string | number>("");
  const [clearFinish, setClearFinish] = useState(false);
  const [readHistory, setReadHistory] = useState<{ [comicId: string]: string[] }>(() => {
    const historyStored = localStorage.getItem("read");
    return historyStored ? JSON.parse(historyStored) : {};
  });

  const [dialogOpen, setDialogOpen] = useState({
    login: false,
    signUp: false,
    forgot: false,
    folder: false,
    newTopic: false,
    buyComic: false,
  });
  const [editFolder, setEditFolder] = useState(defaultEditInitialState);
  const [formData, setFormData] = useState(defaultUserFormData);
  const [msgOpen, setMsgOpen] = useState({
    detail: false,
    detailDownload: false,
  });
  const [seriesGroups, setSeriesGroups] = useState<any>({
    menus: [],
    episode: 0,
    subEpisode: "1",
    currentChapterId: "",
  });

  const closeExpress = () => {
    if (config.express === "on") {
      sessionStorage.setItem("imageSource", "1");

      setConfig((prev) => ({ ...prev, express: "", app_img_shunt: "1" }));
    }
  };

  useEffect(() => {
    closeExpress();
  }, [config.express]);

  useEffect(() => {
    if (queryId && readId) {
      handlerReadEpisodeStorage();
      setTab(2);
      setClearFinish(true);
    } else {
      setSeriesGroups({ menus: [], episode: 0, subEpisode: "1", currentChapterId: "" });
      dispatch(RESET_DETAIL_STATE());
    }
  }, [queryId, readId]);

  useEffect(() => {
    scrollToTop();
    if (queryId && !hasData) {
      dispatch(FETCH_DETAIL_THUNK(queryId));
      setClearFinish(true);
    }
  }, [queryId, hasData, logined, dispatch, scrollToTop]);

  useEffect(() => {
    if (!queryId || !clearFinish || !detailList?.series?.length) return;

    const chunkSize = 10;
    const { series } = detailList;

    // chunk
    const chunkedSeries = Array.from({ length: Math.ceil(series.length / chunkSize) }, (_, i) =>
      series.slice(i * chunkSize, i * chunkSize + chunkSize)
    );

    // current item
    const currentIndex = series.findIndex((item: any) => item.id === queryId);
    const currentItem = series[currentIndex] || series[0];

    // localStorage
    const storageKey = "readEp";
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const storedItem = existing.find((item: any) => item.id === queryId);

    // chunk index
    const chunkIndex = [...chunkedSeries]
      .reverse()
      .findIndex((chunk) => chunk.some((item: any) => item.id === queryId));

    setSeriesGroups((prev: any) => ({
      ...prev,
      menus: chunkedSeries,
      episode: Number(storedItem?.episode) || chunkIndex || 0,
      subEpisode: storedItem?.subEpisode || currentItem?.sort || series[0]?.sort || "",
      currentChapterId: storedItem?.readId || currentItem?.id || series[0]?.id || String(detailList.id),
    }));
  }, [queryId, clearFinish, detailList?.series]);

  // read history localStorage
  useEffect(() => {
    localStorage.setItem("read", JSON.stringify(readHistory));
  }, [readHistory]);

  const handlerReadStorage = (comicId: string, chapterId: string) => {
    setReadHistory((prev) => {
      const chapters = prev[comicId] || [];
      if (!chapters.includes(chapterId)) {
        return {
          ...prev,
          [comicId]: [...chapters, chapterId],
        };
      }
      return prev;
    });
  };

  // read episode history localStorage
  const handlerReadEpisodeStorage = () => {
    if (!queryId) return;

    const newEntry = {
      id: queryId,
      readId: readId,
      episode: queryEp,
      subEpisode: querySubEp,
    };

    const storageKey = "readEp";
    const existing: (typeof newEntry)[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const index = existing.findIndex((item) => item.id === queryId);

    if (index !== -1) {
      existing[index] = newEntry;
    } else {
      existing.push(newEntry);
    }

    localStorage.setItem(storageKey, JSON.stringify(existing));
  };

  // exchange decode comic
  const handleDecensored = async () => {
    if (!logined) {
      showSnackbar(t("login.please_login"), "error");
      return;
    }
    const result = await dispatch(FETCH_COIN_BUY_THUNK(queryId)).unwrap();
    const { status, msg } = result;
    const type = status !== "success" ? "error" : "success";
    showSnackbar(msg, type);
    if (status === "ok") {
      dispatch(FETCH_DETAIL_THUNK(queryId));
    }
  };

  // full color comic check
  const handleClick = () => {
    if (Object.keys(detailList)?.length > 0) {
      const { purchased } = detailList;
      const isPurchased = purchased || purchased === "";

      if (!isPurchased) {
        setDialogOpen({ ...dialogOpen, buyComic: true });
      } else {
        const lastReadChapter = readHistory[queryId]?.slice(-1)[0] || seriesGroups.currentChapterId;
        handlerReadStorage(queryId, seriesGroups.currentChapterId);
        const displayValue = lastReadChapter === "" ? queryId : lastReadChapter;

        navigate(
          `/comic/detail/read?id=${queryId}&readId=${displayValue}&episode=${seriesGroups.episode}&subEpisode=${seriesGroups.subEpisode}`
        );
      }
    }
  };

  // goback
  const goBackState = sessionStorage.getItem("fromPage") || "";
  const relatedQuery = sessionStorage.getItem("relatedQuery") || "";
  const filterSerch = sessionStorage.getItem("searchQuery") || "";

  useEffect(() => {
    const gobackSearch = `/search?filter=${encodeURIComponent(filterSerch)}`;
    const gobackDetail = `/comic/detail?id=${relatedQuery}`;

    if (relatedQuery) {
      setGoBack(gobackDetail);
    } else if (filterSerch) {
      setGoBack(gobackSearch);
    } else {
      setGoBack(goBackState);
    }
    if (relatedQuery === queryId) {
      sessionStorage.removeItem("relatedQuery");
    }
  }, [relatedQuery, queryId]);

  return (
    <>
      <div className="h-full dark:text-tgy dark:bg-bk">
        {isLoading && !hasData && <Loading />}
        <div className="sticky top-safe z-50">
          <HeaderAds />
        </div>
        <div className="relative w-full h-14 text-white flex justify-between items-center px-3 py-2 z-20">
          <GoBack back={goBack} />
          <ShareIcon sx={{ fontSize: 26, stroke: "white", strokeWidth: 1 }} onClick={() => setShare(true)} />
        </div>
        <div className="bg-tgy transform translate-y-[-70px] relative overflow-hidden z-10">
          <div className="relative">
            {hasData || !isLoading ? (
              <img
                src={setting.img_host + "/media/albums/" + detailList.id + "_3x4.jpg?v=" + detailList.addtime}
                alt={detailList.id}
                loading="lazy"
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.opacity = "1";
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/chapter_default.jpg";
                }}
                className="h-96 w-screen object-cover"
                style={{
                  opacity: "0",
                  transition: "opacity 0.5s ease-in-out",
                }}
              />
            ) : (
              <div className="h-96 w-screen object-cover"></div>
            )}
            <div
              className="absolute inset-0 opacity-90"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom, #323232 0%, transparent 30%, transparent 60%, #323232 90%)",
              }}
            ></div>
          </div>
          <div>
            <div className="absolute bottom-2 px-4 text-white">
              <p>{detailList.name}</p>
              {detailList.author?.map((auther: string, i: number) => (
                <span key={i} className="text-og">
                  {auther}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleClick} className="w-full bg-og flex justify-center text-white mt-[-70px]">
          <p className="py-4 text-lg">
            {queryId in readHistory ? t("detail.continue_reading") : t("detail.start_reading")}
          </p>
        </button>
        <nav className="grid grid-cols-3 sticky top-0 bg-defaultBg overflow-hidden dark:bg-bk z-30">
          {Array.isArray(menuItems) &&
            menuItems.map((d: string, i: number) => (
              <ul key={i} className="flex flex-col items-center" onClick={() => setTab(i + 1)}>
                <li className="pt-2 pb-1">{d}</li>
                <motion.hr
                  className="w-full border-2"
                  initial={{ borderWidth: "rgba(0, 0, 0, 0)", x: "0%" }}
                  animate={{
                    borderColor: tab === i + 1 ? "#ff6f00" : "rgba(0, 0, 0, 0)",
                    x: tab === i + 1 ? 0 : tab === i + 2 || (tab === 1 && i === 2) ? "100%" : "-100%",
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </ul>
            ))}
        </nav>
        <div className="max-h-[70px] overflow-hidden">
          <AdComponent adKey="app_detail_tab_bottom_jm3" comicId={queryId} />
        </div>
        <motion.div
          initial={{ opacity: 0, x: "0%" }}
          animate={{
            opacity: tab === 1 ? 1 : 0,
            x: tab === 1 ? "0%" : tab === 2 ? "-100%" : "100%",
          }}
          transition={{ duration: 0.5 }}
        >
          {tab === 1 && (
            <Desc
              t={t}
              darkMode={darkMode}
              queryId={queryId}
              setting={setting}
              logined={logined}
              memberInfo={memberInfo}
              adsContent={adsContent}
              detailList={detailList}
              setTab={setTab}
              setMsgOpen={setMsgOpen}
              msgOpen={msgOpen}
              setShowTagMore={setShowTagMore}
              showTagMore={showTagMore}
              seriesGroups={seriesGroups}
              setSeriesGroups={setSeriesGroups}
              showSnackbar={showSnackbar}
              editFolder={editFolder}
              setEditFolder={setEditFolder}
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
            />
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{
            opacity: tab === 2 ? 1 : 0,
            x: tab === 2 ? "0%" : tab === 1 ? "100%" : "-100%",
          }}
          transition={{ duration: 0.5 }}
        >
          {tab === 2 && (
            <Series
              t={t}
              queryId={queryId}
              detailList={detailList}
              seriesGroups={seriesGroups}
              setSeriesGroups={setSeriesGroups}
              msgOpen={msgOpen}
              handlerReadStorage={handlerReadStorage}
              readHistory={readHistory}
              setDialogOpen={setDialogOpen}
              closeExpress={closeExpress}
            />
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{
            opacity: tab === 3 ? 1 : 0,
            x: tab === 3 ? "0%" : tab === 2 ? "100%" : "-100%",
          }}
          transition={{ duration: 0.5 }}
          exit={{
            opacity: 0,
            x: tab === 1 ? "-100%" : "100%",
          }}
        >
          {tab === 3 && (
            <Comment
              t={t}
              centerTopicInput={true}
              queryId={queryId}
              setting={setting}
              memberInfo={memberInfo}
              logined={logined}
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              showSnackbar={showSnackbar}
            />
          )}
        </motion.div>
        <div className="max-h-[70px] overflow-hidden">
          <AdComponent adKey="app_detail_introduction_bottom_jm3" comicId={queryId} closeBtn={true} />
        </div>
      </div>
      {share && (
        <Share share={share} setShare={setShare} setting={setting} queryId={queryId} showSnackbar={showSnackbar} />
      )}
      {dialogOpen.buyComic && (
        <DialogModal
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          showSnackbar={showSnackbar}
          handleDecensored={handleDecensored}
        />
      )}
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
      <TopBtn />
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
    </>
  );
};

export default Detail;
