import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import ShareIcon from "@mui/icons-material/Share";
import Desc from "../../components/Comic/Desc";
import Series from "../../components/Comic/Series";
import Comment from "../../components/Comic/Comment";
import Share from "../../components/Comic/Share";
import Loading from "../../components/Common/Loading";
import MemberModal from "../../components/Modal/MemberModal";
import DialogModal from "../../components/Modal/DialogModal";
import { FETCH_DETAIL_THUNK } from "../../actions/detailAction";
import { FETCH_NOTIFICATIONS_SERTRACK_THUNK } from "../../actions/memberAction";
import { defaultEditInitialState, defaultUserFormData } from "../../utils/InterFace";
import { GoBack, useScrollToTop } from "../../Hooks";
import { FETCH_COIN_BUY_THUNK } from "../../actions/mainAction";
import AdComponent from "../../components/Ads/AdComponent";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import TopBtn from "../../components/Common/TopBtn";
import { CLEAR_FORUM_LIST } from "../../reducers/forumReducer";
import { CLEAR_DETIAL_LIST, RESET_DETAIL_STATE } from "../../reducers/detailReducer";

const Detail = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined, darkMode } = config;
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
    if (queryId && detailList && Object.keys(detailList)?.length === 0) {
      dispatch(FETCH_DETAIL_THUNK(queryId));
      setClearFinish(true);
    }
  }, [queryId, detailList, logined, dispatch]);

  useEffect(() => {
    const chunkSize = 10;
    if (queryId && clearFinish && detailList?.series?.length > 0) {
      const { series } = detailList;
      const chunkedSeries = [];
      for (let i = 0; i < series.length; i += chunkSize) {
        chunkedSeries.push(series.slice(i, i + chunkSize));
      }
      const currentIndex = series.findIndex((item: any) => item.id === queryId);
      const chunkItem = series[currentIndex];

      const storageKey = "readEp";
      const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const index = existing.findIndex((item: any) => item.id === queryId);

      const chunkIndex = chunkedSeries
        .reverse()
        .findIndex((chunk: any) => chunk.some((item: any) => item.id === queryId));

      setSeriesGroups({
        ...seriesGroups,
        menus: chunkedSeries,
        episode: Number(existing[index]?.episode) || chunkIndex || 0,
        subEpisode: existing[index]?.subEpisode || chunkItem?.sort || series[0]?.sort || "",
        currentChapterId: existing[index]?.readId || chunkItem?.id || series[0]?.id || String(detailList.id),
      });
    }
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
    const gobackSearch = `/search?filter=${filterSerch}`;
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
      <div className="dark:text-tgy min-h-screen">
        {isLoading && <Loading />}
        <div className="relative w-full h-20 text-white flex justify-between items-center px-3 py-2 z-20">
          <GoBack back={goBack} />
          <ShareIcon sx={{ fontSize: 26, stroke: "white", strokeWidth: 1 }} onClick={() => setShare(true)} />
        </div>
        <div className="bg-tgy transform translate-y-[-70px] relative overflow-hidden z-10">
          <div className="relative">
            {!isLoading ? (
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
              setConfig={setConfig}
              centerTopicInput={true}
              queryId={queryId}
              setting={setting}
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
