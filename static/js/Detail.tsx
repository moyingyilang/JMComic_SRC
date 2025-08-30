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
import { CLEAR_DETIAL_LIST } from "../../reducers/detailReducer";

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
  const menuItems = t("detail.menu_items", { returnObjects: true });
  const [tab, setTab] = useState(1);
  const [showTagMore, setShowTagMore] = useState(false);
  const [share, setShare] = useState(false);
  const dispatch = useAppDispatch();
  const { detailList, isLoading } = useAppSelector((state) => state.detail);
  const goBackState = sessionStorage.getItem("fromPage") || "";
  const goBackDetailState = sessionStorage.getItem("relatedQuery") || "";
  const filterSerch = sessionStorage.getItem("searchQuery");
  const [goBack, setGoBack] = useState<string | number>("");
  const [clearFinish, setClearFinish] = useState(false);
  const [readHistory, setReadHistory] = useState<string[]>(() => {
    const historyStored = localStorage.getItem("read");
    return historyStored ? JSON.parse(historyStored) : [];
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
    setSeriesGroups({ menus: [], episode: 0, subEpisode: "1", currentChapterId: "" });
    dispatch(CLEAR_DETIAL_LIST("detailList"));
  }, [queryId]);

  useEffect(() => {
    scrollToTop();
    if (queryId && Object.keys(detailList).length === 0) {
      dispatch(FETCH_DETAIL_THUNK(queryId));
      setClearFinish(true);
    }
  }, [queryId, Object.keys(detailList).length, logined, dispatch]);

  useEffect(() => {
    const chunkSize = 10;
    const { series } = detailList;
    if (queryId && clearFinish && series?.length > 0) {
      const chunkedSeries = [];
      for (let i = 0; i < series.length; i += chunkSize) {
        chunkedSeries.push(series.slice(i, i + chunkSize));
      }
      const currentIndex = series.findIndex((item: any) => item.id === queryId);
      const chunkItem = series[currentIndex];

      const chunkIndex = chunkedSeries
        .reverse()
        .findIndex((chunk: any) => chunk.some((item: any) => item.id === queryId));

      setSeriesGroups({
        ...seriesGroups,
        menus: chunkedSeries,
        episode: chunkIndex || 0,
        subEpisode: chunkItem?.sort || series[0]?.sort || "",
        currentChapterId: chunkItem?.id || series[0]?.id || String(detailList.id),
      });
    }
  }, [queryId, clearFinish, detailList.series]);

  // read history localStorage
  useEffect(() => {
    if (readHistory.length > 0) {
      localStorage.setItem("read", JSON.stringify(readHistory));
    }
  }, [readHistory]);

  const handlerReadStorage = (currentChapterId: string) => {
    setReadHistory((prevHistory: string[]) => {
      if (!prevHistory.includes(currentChapterId)) {
        return [...prevHistory, currentChapterId];
      }
      return prevHistory;
    });
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
    if (Object.keys(detailList).length > 0) {
      const { purchased } = detailList;
      const isPurchased = purchased || purchased === "";

      if (!isPurchased) {
        setDialogOpen({ ...dialogOpen, buyComic: true });
      } else {
        handlerReadStorage(queryId as string);
        navigate(
          `/comic/detail/read?id=${queryId}&readId=${queryId}&episode=${seriesGroups.episode}&subEpisode=${seriesGroups.subEpisode}`
        );
      }
    }
  };

  // goback
  useEffect(() => {
    if (goBackDetailState && goBackDetailState.split("?id=")[1] !== queryId) {
      setGoBack(goBackDetailState);
    } else if (filterSerch) {
      setGoBack(-1);
      // sessionStorage.removeItem("searchQuery");
    } else {
      sessionStorage.removeItem("relatedFromDetail");
      setGoBack(goBackState);
    }
  }, [goBackDetailState, queryId]);

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
          <p className="py-4 text-lg">{t("detail.start_reading")}</p>
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
          <AdComponent adKey="app_detail_tab_bottom" />
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
          <AdComponent adKey="album_detail" closeBtn={true} />
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
