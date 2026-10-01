import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import SortIcon from "@mui/icons-material/Sort";
import TextsmsIcon from "@mui/icons-material/Textsms";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FETCH_FORUM_THUNK } from "../../actions/forumAction";
import {
  FETCH_ADD_NOVEL_FAVORITES_THUNK,
  FETCH_ADD_NOVEL_LIKE_THUNK,
  FETCH_EDIT_NOVEL_FAVORITES_THUNK,
  FETCH_NOVEL_COIN_BUY_THUNK,
  FETCH_NOVEL_DETAIL_THUNK,
  FETCH_NOVEL_FAVORITES_LIST_THUNK,
} from "../../actions/novelAction";
import AdComponent from "../../components/Ads/AdComponent";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import HeaderAds from "../../components/Common/HeaderAds";
import Loading from "../../components/Common/Loading";
import TopBtn from "../../components/Common/TopBtn";
import BottomNav from "../../components/Main/BottomNav";
import DialogModal from "../../components/Modal/DialogModal";
import FolderModal from "../../components/Modal/FolderModal";
import MemberModal from "../../components/Modal/MemberModal";
import NovelsRelated from "../../components/Novels/NovelsRelated";
import { useGlobalConfig } from "../../GlobalContext";
import { GoBack, useScrollToTop } from "../../Hooks";
import { CLEAR_FORUM_LIST, LOAD_FORUM_LIST } from "../../reducers/forumReducer";
import { CLEAR_NOVEL_LIST } from "../../reducers/novelReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { formatTimestampToDate } from "../../utils/Function";
import { defaultEditInitialState, defaultUserFormData } from "../../utils/InterFace";

const NovelDetail = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined, darkMode } = config;
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const scrollToTop = useScrollToTop();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const { novelDetail, novelFavoritesList, isLoading } = useAppSelector((state) => state.novel);
  const searchParams = new URLSearchParams(location.search);
  const nid = searchParams.get("nid") as string;
  const ncid = searchParams.get("ncid") as string;
  const readBack = searchParams.get("back") === "true";
  const filter = searchParams.get("filter") ?? "";
  const [more, setMore] = useState<boolean>(false);
  const [tab, setTab] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState("asc");
  const commentRef = useRef<HTMLInputElement | null>(null);
  const [editFolder, setEditFolder] = useState(defaultEditInitialState);
  const [markLoading, setMarkLoading] = useState<boolean>(false);
  const [favoriteSave, setFavoriteSave] = useState<{ like: string[]; mark: string[] }>(() => {
    const storedLikes = JSON.parse(localStorage.getItem("novelLikeItems") || "[]");
    const storedMarks = JSON.parse(localStorage.getItem("novelMarkItems") || "[]");
    return { like: storedLikes, mark: storedMarks };
  });
  const [formData, setFormData] = useState(defaultUserFormData);
  const [dialogOpen, setDialogOpen] = useState({
    login: false,
    signUp: false,
    forgot: false,
    folder: false,
    buyComic: false,
    alert: false,
    buyNovel: false,
  });
  const [readNCID, setReadNCID] = useState("");
  const [readHistory, setReadHistory] = useState<{ [comicId: string]: string[] }>(() => {
    const historyStored = localStorage.getItem("novelRead");
    return historyStored ? JSON.parse(historyStored) : {};
  });

  const loadForumList = (
    isLoadMore: boolean = false,
    isRefreshing: boolean = false,
    time: number = 0,
    page: number = 1
  ) => {
    dispatch(LOAD_FORUM_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    if (isRefreshing) {
      dispatch(CLEAR_FORUM_LIST("forumList"));
    }
    setTimeout(() => {
      dispatch(FETCH_FORUM_THUNK({ mode: "novel", nid, page }));
    }, time);
  };

  // console.log(forumList, "res");
  // console.log(novelDetail, "detail");

  useEffect(() => {
    scrollToTop();
    if ((nid && !readBack) || Object.keys(novelDetail)?.length === 0) {
      dispatch(CLEAR_NOVEL_LIST("novelDetail"));
      dispatch(FETCH_NOVEL_DETAIL_THUNK({ nid }));
      loadForumList();
    }
  }, [nid]);

  // save now NCID
  useEffect(() => {
    const historyForCurrentNid = readHistory[Number(nid)];
    const newReadEp = ncid || historyForCurrentNid?.[historyForCurrentNid.length - 1] || novelDetail?.series?.[0]?.NCID;

    if (newReadEp !== readNCID) {
      setReadNCID(newReadEp);
    }
  }, [nid, readHistory, novelDetail]);

  //read ncid storage
  const handlerReadStorage = (currentNcidId: string) => {
    setReadHistory((prev) => {
      const chapters = prev[nid] || [];
      if (!chapters.includes(currentNcidId)) {
        const newState = { ...prev, [nid]: [...chapters, currentNcidId] };
        localStorage.setItem("novelRead", JSON.stringify(newState));
        return newState;
      }
      return prev;
    });
  };

  // ncid click
  const handleClick = (currentNcidId: string) => {
    const seriesItem = novelDetail?.series?.find((d: any) => d.NCID === currentNcidId);
    setReadNCID(currentNcidId);

    if (!seriesItem) return;

    const purchased = seriesItem?.is_buy_ok ?? "0";

    if (seriesItem.is_need_buy_nc === "1" && purchased === "0") {
      setDialogOpen({ ...dialogOpen, buyNovel: true });
    } else {
      handlerReadStorage(currentNcidId);
      navigate(
        `/novels/detail/read?nid=${nid}&ncid=${currentNcidId}&title=${encodeURIComponent(
          novelDetail?.name
        )}&filter=${filter}`
      );
    }
  };

  // coin buy
  const handleDecensored = async () => {
    if (!logined) {
      showSnackbar(t("login.please_login"), "error");
      return;
    }
    const result = await dispatch(FETCH_NOVEL_COIN_BUY_THUNK({ id: readNCID })).unwrap();
    const { status, msg } = result;
    const type = status !== "ok" ? "error" : "success";
    showSnackbar(msg, type);
    if (status === "ok") {
      const res = await dispatch(FETCH_NOVEL_DETAIL_THUNK({ nid })).unwrap();
      if (res) {
        const purchased = res?.series?.find((d: any) => d.NCID === readNCID)?.is_buy_ok === "1";
        if (purchased) {
          navigate(
            `/novels/detail/read?nid=${nid}&ncid=${readNCID}&title=${encodeURIComponent(
              novelDetail?.name
            )}&filter=${filter}`
          );
        }
      }
    }
  };

  // GetFolderList
  const handleFindFolder = async () => {
    dispatch(CLEAR_NOVEL_LIST("novelFavoritesList"));
    await dispatch(FETCH_NOVEL_FAVORITES_LIST_THUNK({ page: 1, folder_id: "", o: "" })).unwrap();
  };

  // like && mark
  const toggleItem = (type: "like" | "mark", id: string) => {
    setFavoriteSave((prevState) => {
      let updatedList: string[];

      if (type === "mark") {
        updatedList = prevState[type].includes(id)
          ? prevState[type].filter((item) => item !== id)
          : [...prevState[type], id];
      } else {
        updatedList = prevState[type].includes(id) ? prevState[type] : [...prevState[type], id];
      }
      localStorage.setItem(`novel${type.charAt(0).toUpperCase() + type.slice(1)}Items`, JSON.stringify(updatedList));

      return { ...prevState, [type]: updatedList };
    });
  };

  const handleEngagementAction = async (type: string, id: string) => {
    if (type === "like") {
      if (favoriteSave.like.includes(id)) {
        showSnackbar(t("snack.already_rated"), "success");
        return;
      }
      toggleItem("like", id);
      const result = await dispatch(FETCH_ADD_NOVEL_LIKE_THUNK({ id })).unwrap();
      const { code, msg, status } = result;
      const msgType = status !== "success" ? "error" : "success";
      if (code === 200) {
        showSnackbar(msg, msgType);
      }
    }
    if (type === "mark") {
      if (!logined) {
        showSnackbar(t("login.please_login"), "error");
        setDialogOpen({ ...dialogOpen, login: true });
      } else {
        setMarkLoading(true);
        handleFindFolder();
        toggleItem("mark", id);
        const result = await dispatch(FETCH_ADD_NOVEL_FAVORITES_THUNK({ nid })).unwrap();
        const { status, msg, type } = result;
        const msgType = status !== "ok" ? "error" : "success";
        if (status === "ok") {
          switch (type) {
            case "add":
            case "edit":
            case "move":
              setEditFolder((prev: any) => ({ ...prev, aid: id, alert: false }));
              setDialogOpen({ ...dialogOpen, folder: true });
              break;
            case "remove":
              setEditFolder((prev: any) => ({ ...prev, ...defaultEditInitialState }));
              break;
          }
        }
        // setMarkLoading(false);
        showSnackbar(msg, msgType);
      }
    }
  };

  // EditFolder
  // type === add / edit / move / del
  const handleEditFolder = async (type: string) => {
    setMarkLoading(true);
    if (type === "del") {
      setDialogOpen({ ...dialogOpen, alert: true });
    }
    const { folder_id, folder_name, aid } = editFolder;

    if (folder_name !== "") {
      const result = await dispatch(
        FETCH_EDIT_NOVEL_FAVORITES_THUNK({ type, folder_id, folder_name, nid: aid })
      ).unwrap();
      const { status, msg } = result;
      const statusType = status !== "ok" ? "error" : "success";
      if (status && msg) {
        showSnackbar(msg, statusType);
      }
    } else {
      showSnackbar(t("comic.added_to_favorites_success"), "success");
    }
    // setMarkLoading(false);
    setEditFolder((prev: any) => ({ ...prev, ...defaultEditInitialState }));
  };

  console.log(novelDetail?.images);

  return (
    <>
      <div className="h-full text-gy pb-40 dark:text-tgy dark:bg-bbk pb-40">
        {isLoading && <Loading />}
        <div className="sticky top-safe z-50">
          <HeaderAds />
          <div className="h-14 bg-bbk text-white flex items-end p-2 py-3">
            <GoBack back={`/novels?filter=${filter}`} />
            <p className="w-[85%] ml-auto pr-1 text-og truncate mr-4">{novelDetail?.name}</p>
          </div>
        </div>
        <div className="flex flex-col-2 gap-4 p-4">
          <AdComponent adKey="app-novel_intro_top_1" />
          <AdComponent adKey="app-novel_intro_top_2" />
        </div>
        <div className="bg-white text-base p-5 mx-4 dark:bg-bbk">
          <div className="pb-4 border-b">
            <p className="text-xl mb-4">{novelDetail?.name}</p>
            {novelDetail?.tags?.map((d: any, index: number) => (
              <button
                key={index}
                className="border border-solid border-gy rounded-md p-1 mr-2 mb-2 dark:bg-nbk"
                onClick={() => navigate(`/novels?filter=${d}`)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-2 rounded mt-4">
            <div className="w-1/2">
              <img
                src={novelDetail?.images && setting?.img_host + novelDetail?.images}
                alt={novelDetail?.id}
                loading="lazy"
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.opacity = "1";
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/cover_default.jpg";
                }}
                className="object-contain rounded-md"
                style={{
                  opacity: "0",
                  transition: "opacity 0.5s ease-in-out",
                }}
              />
            </div>
            <div className="w-1/2">
              <p>
                {t("detail.forbidden_comics")}：NVL{novelDetail?.id}
              </p>
              <p>
                {t("detail.author")}：
                <Link to={`/novels?filter=${novelDetail?.author}`} className="text-og underline">
                  {novelDetail?.author}
                </Link>
              </p>
              <p>
                {t("novel.serialization_status")}：{novelDetail?.serial_status === "Ongoing" ? "連載中" : "完結"}
              </p>
              <p>
                {t("novel.chapter_count")}：{novelDetail?.series?.length}
              </p>
              <p>上架日期：{formatTimestampToDate(novelDetail?.addtime)}</p>
              <p>更新日期：{formatTimestampToDate(novelDetail?.update_time || novelDetail?.addtime)}</p>
              <div className="mt-6">
                <div>
                  <RemoveRedEyeIcon className="text-xl" />
                  <span>{novelDetail?.total_views}</span>
                </div>
                <div>
                  <FavoriteIcon className="text-xl" />
                  <span>{novelDetail?.likes}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            className="w-full bg-og rounded flex justify-center text-white my-2"
            onClick={() => handleClick(readNCID)}
          >
            <p className="py-3"> {nid in readHistory ? t("detail.continue_reading") : t("detail.start_reading")}</p>
          </button>
          <div className="grid grid-cols-3 text-center text-og mb-4">
            <div
              className="flex justify-center items-center border-r border-og"
              onClick={() => handleEngagementAction("mark", nid)}
            >
              {favoriteSave.mark.includes(nid) ? (
                <BookmarkIcon className="text-og" />
              ) : (
                <BookmarkBorderIcon className="text-og" />
              )}
              <span>收藏</span>
            </div>
            <div
              className="flex justify-center items-center border-r border-og"
              onClick={() => handleEngagementAction("like", nid)}
            >
              {favoriteSave.like.includes(nid) ? (
                <FavoriteIcon className="text-red-600" />
              ) : (
                <FavoriteBorderIcon className="text-og" />
              )}
              <span className="mx-1">{t("detail.like")}</span>
            </div>
            <div
              className="flex justify-center items-center"
              onClick={() => {
                if (commentRef.current) {
                  commentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  setTab(2);
                }
              }}
            >
              <TextsmsIcon className="text-og" />
              <span className="mx-1">{t("detail.comments")}</span>
            </div>
          </div>
          {/* <AdComponent adKey="app_detail_tab_bottom_jm3" /> */}
          <div className={`pt-2 ${more ? "" : "h-20 overflow-hidden relative"}`}>
            <div
              className="min-h-[200px]"
              dangerouslySetInnerHTML={{
                __html: novelDetail?.description,
              }}
              onClick={() => setMore(!more)}
            />
          </div>
          <div className="flex justify-end">
            <button className="bg-gy text-white rounded p-1 px-2" onClick={() => setMore(!more)}>
              {more ? t("detail.show_less") : t("detail.show_all")}
            </button>
          </div>
          <div
            className="flex justify-start items-center mt-2"
            ref={commentRef}
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
          >
            <span>{t("novel.sort_switch")}</span>
            <SortIcon className="text-2xl" />
          </div>
          <div className="h-48 overflow-y-auto py-1">
            {[...(novelDetail?.series || [])]
              .sort((a, b) => {
                if (sortOrder === "asc") {
                  return a.sort - b.sort;
                } else {
                  return b.sort - a.sort;
                }
              })
              .map((d: any, i: number, array: any[]) => (
                <div key={d.id} onClick={() => handleClick(d.NCID)}>
                  <p
                    className={`border border-solid border-gray-400 rounded-md px-2 my-1 
                       ${
                         readNCID === d.NCID
                           ? "bg-og text-white"
                           : readHistory[nid]?.includes(d.NCID)
                           ? "bg-white text-og"
                           : ""
                       }`}
                  >
                    {sortOrder === "asc" ? i + 1 : array.length - i}. {d.title}
                    {d.new && (
                      <span className={`text-orange-500 ml-3 ${readNCID === d.NCID ? "text-white" : ""}`}>
                        {t("cat_sort.latest")}
                      </span>
                    )}
                  </p>
                </div>
              ))}
          </div>
          <div className="max-h-[70px] overflow-hidden mt-4">
            <AdComponent adKey="app-novel_intro_mid" />
          </div>
        </div>
        <NovelsRelated
          t={t}
          nid={nid}
          filter={filter}
          config={config}
          showSnackbar={showSnackbar}
          tab={tab}
          setTab={setTab}
          relatedList={novelDetail?.related_list || []}
          loadForumList={loadForumList}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          favoriteSave={favoriteSave}
          handleEngagementAction={handleEngagementAction}
        />
        <div className="flex flex-col-2 gap-4 px-4 py-2">
          <AdComponent adKey="app-novel_intro_bottom_1" />
          <AdComponent adKey="app-novel_intro_bottom_2" />
        </div>
        <div className="flex flex-col-2 gap-4 px-4 py-2">
          <AdComponent adKey="app-novel_intro_bottom_3" />
          <AdComponent adKey="app-novel_intro_bottom_4" />
        </div>
      </div>
      <BottomNav />
      <TopBtn />
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
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
      {dialogOpen.buyNovel && (
        <DialogModal
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          showSnackbar={showSnackbar}
          handleDecensored={handleDecensored}
        />
      )}
      {dialogOpen.folder && (
        <FolderModal
          folderList={novelFavoritesList.folder_list}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          editFolder={editFolder}
          setEditFolder={setEditFolder}
          handleEditFolder={handleEditFolder}
          tagsList={[]}
        />
      )}
    </>
  );
};

export default NovelDetail;
