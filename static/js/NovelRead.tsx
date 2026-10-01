import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { GoBack, useScrollToTop } from "../../Hooks";
import { FETCH_FORUM_THUNK } from "../../actions/forumAction";
import {
  FETCH_ADD_NOVEL_FAVORITES_THUNK,
  FETCH_ADD_NOVEL_LIKE_THUNK,
  FETCH_EDIT_NOVEL_FAVORITES_THUNK,
  FETCH_NOVEL_CHAPTERS_THUNK,
  FETCH_NOVEL_COIN_BUY_THUNK,
  FETCH_NOVEL_DETAIL_THUNK,
  FETCH_NOVEL_FAVORITES_LIST_THUNK,
} from "../../actions/novelAction";
import AdComponent from "../../components/Ads/AdComponent";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import HeaderAds from "../../components/Common/HeaderAds";
import Loading from "../../components/Common/Loading";
import TopBtn from "../../components/Common/TopBtn";
import DialogModal from "../../components/Modal/DialogModal";
import FolderModal from "../../components/Modal/FolderModal";
import MemberModal from "../../components/Modal/MemberModal";
import NovelReadBottom from "../../components/Novels/NovelReadBottom";
import NovelsRelated from "../../components/Novels/NovelsRelated";
import { CLEAR_FORUM_LIST, LOAD_FORUM_LIST } from "../../reducers/forumReducer";
import { CLEAR_NOVEL_LIST } from "../../reducers/novelReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { defaultEditInitialState, defaultUserFormData } from "../../utils/InterFace";

const NovelRead = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined, darkMode } = config;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const scrollToTop = useScrollToTop();
  const { novelDetail, novelReadDetail, novelFavoritesList, isLoading } = useAppSelector((state) => state.novel);
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const searchParams = new URLSearchParams(location.search);
  const nid = searchParams.get("nid") as string;
  const ncid = searchParams.get("ncid") as string;
  const title = searchParams.get("title") as string;
  const filter = searchParams.get("filter") ?? "";
  const [tab, setTab] = useState(1);
  const [responds, setResponds] = useState<string>("");
  const [formData, setFormData] = useState(defaultUserFormData);
  const commentRef = useRef<HTMLInputElement | null>(null);
  const [dialogOpen, setDialogOpen] = useState({
    login: false,
    signUp: false,
    forgot: false,
    folder: false,
    textFields: false,
    moreElse: false,
    alert: false,
    buyNovel: false,
  });
  const novelFontSizeClass = localStorage.getItem("novelFontSizeClass");
  const [textFieldsSettings, setTextFieldsSettings] = useState({
    wordValue: novelFontSizeClass ? JSON.parse(novelFontSizeClass)?.newWordValue : 50,
    fontSizeClass: novelFontSizeClass ? JSON.parse(novelFontSizeClass)?.newFontSizeClass : "text-xl",
    lang: localStorage.getItem("novelLang") || "tw",
    confirm: false,
  });
  const [editFolder, setEditFolder] = useState(defaultEditInitialState);
  const [markLoading, setMarkLoading] = useState<boolean>(false);
  const [readNCID, setReadNCID] = useState("");
  const [favoriteSave, setFavoriteSave] = useState<{ like: string[]; mark: string[] }>(() => {
    const storedLikes = JSON.parse(localStorage.getItem("novelLikeItems") || "[]");
    const storedMarks = JSON.parse(localStorage.getItem("novelMarkItems") || "[]");
    return { like: storedLikes, mark: storedMarks };
  });
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
  useEffect(() => {
    scrollToTop();
    if (ncid) {
      dispatch(FETCH_NOVEL_CHAPTERS_THUNK({ ncid, lang: textFieldsSettings.lang }));
      loadForumList();
    }
  }, [ncid]);

  useEffect(() => {
    if (Object.keys(novelDetail)?.length === 0) {
      dispatch(FETCH_NOVEL_DETAIL_THUNK({ nid }));
    }
  }, [novelDetail]);

  const switchLanguage = () => {
    const { lang } = textFieldsSettings;
    localStorage.setItem("novelLang", lang);
    dispatch(FETCH_NOVEL_CHAPTERS_THUNK({ ncid, lang }));
  };

  function wordValueToFontSize(value: number) {
    switch (value) {
      case 0:
        return "text-base";
      case 25:
        return "text-lg";
      case 50:
        return "text-xl";
      case 75:
        return "text-2xl";
      case 100:
        return "text-3xl";
      default:
        return "text-base";
    }
  }

  const handleChangeTextSettings = () => {
    switchLanguage();
    setTextFieldsSettings((prev) => {
      const newFontSizeClass = wordValueToFontSize(prev.wordValue);
      localStorage.setItem(
        "novelFontSizeClass",
        JSON.stringify({ newWordValue: textFieldsSettings.wordValue, newFontSizeClass: newFontSizeClass })
      );
      return {
        ...prev,
        confirm: true,
        fontSizeClass: newFontSizeClass,
      };
    });

    setTimeout(() => {
      setTextFieldsSettings((prev) => ({
        ...prev,
        confirm: false,
      }));
    }, 1000);
  };

  // GetFolderList
  const handleFindFolder = async () => {
    dispatch(CLEAR_NOVEL_LIST("novelFavoritesList"));
    await dispatch(FETCH_NOVEL_FAVORITES_LIST_THUNK({ page: 1, folder_id: "", o: "" })).unwrap();
  };

  // like && mark
  const toggleItem = (id: string, type: "like" | "mark") => {
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
      toggleItem(id, "like");
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
        toggleItem(id, "mark");
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

  const handleNextChapter = () => {
    const currentIndex = novelDetail.series?.findIndex((chapter: any) => chapter.id === ncid);
    const nextChapter = currentIndex < novelDetail.series.length - 1 ? novelDetail.series[currentIndex + 1] : null;
    setReadNCID(nextChapter?.NCID);

    const purchased = nextChapter?.is_buy_ok ?? "0";

    if (nextChapter?.is_need_buy_nc === "1" && purchased === "0") {
      setDialogOpen({ ...dialogOpen, buyNovel: true });
      return;
    }
    if (nextChapter) {
      handlerReadStorage(nextChapter.NCID);
      navigate(
        `/novels/detail/read?nid=${nid}&ncid=${nextChapter.NCID}&title=${encodeURIComponent(
          novelDetail?.name
        )}&filter=${filter}`
      );
    } else {
      showSnackbar(t("novel.is_last_chapter"), "success");
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

  // content ads
  const contentWithAd = novelReadDetail?.content?.split(/(<\/p>)/g).map((item: any, index: number, arr: any[]) => {
    const isLastParagraph = index === arr.length - 2;

    if (item === "</p>") {
      return (
        <React.Fragment key={`frag-${index}`}>
          {/* 渲染段落 */}
          <p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: item }} />
          {/* 每三段插入廣告 */}
          {!isLastParagraph && index % 3 === 2 && (
            <div key={`ad-${index}`} className="flex justify-center">
              <AdComponent adKey="app-novelchap_cmid" />
            </div>
          )}
        </React.Fragment>
      );
    } else {
      return <p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: item }} />;
    }
  });

  return (
    <>
      <div className="text-gy h-full pb-40 dark:text-tgy dark:bg-bbk">
        {isLoading && <Loading />}
        <div className="sticky top-safe z-50">
          <HeaderAds />
          <div className="h-14 bg-bbk text-white flex items-center p-2 py-3">
            <GoBack back={`/novels/detail?nid=${nid}&ncid=${ncid}&title=${title}&filter=${filter}&back=true`} />
            <p className="w-[85%] ml-auto pr-1 text-og truncate mr-4">{title}</p>
          </div>
        </div>
        <p className="bg-white text-2xl mt-4 p-4 dark:bg-gy">{title}</p>
        <div className="max-h-[140px] overflow-hidden flex flex-col-2 gap-4 p-4">
          <AdComponent adKey="app-novelchap_cstart_1" />
          <AdComponent adKey="app-novelchap_cstart_2" />
        </div>
        <div className="bg-white p-4 text-2xl dark:bg-bbk">
          <p className={`font-blod text-nbk  ${textFieldsSettings.fontSizeClass} py-5 dark:text-tgy`}>
            {novelReadDetail?.name}
          </p>
          <div className={`min-h-[200px] ${textFieldsSettings.fontSizeClass}`}>{contentWithAd}</div>
          {/* <div
            className={`min-h-[200px] ${textFieldsSettings.fontSizeClass}`}
            dangerouslySetInnerHTML={{
              __html: novelReadDetail?.content,
            }}
          /> */}
          <div className="max-h-[140px]">
            <AdComponent adKey="app_thewayhome" />
          </div>
          <div className="max-h-[140px] overflow-hidden flex flex-col-2 gap-1">
            <AdComponent adKey="app-novelchap_clast_1" />
            <AdComponent adKey="app-novelchap_clast_2" />
          </div>
          <p className="text-center text-sm" ref={commentRef}>
            {t("novel.advertisement_prompt")} {">"}w&lt;
          </p>
        </div>
        <NovelsRelated
          t={t}
          nid={nid}
          ncid={ncid}
          filter={filter}
          config={config}
          showSnackbar={showSnackbar}
          tab={tab}
          setTab={setTab}
          responds={responds}
          setResponds={setResponds}
          relatedList={novelReadDetail?.related_list || []}
          loadForumList={loadForumList}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          favoriteSave={favoriteSave}
          handleEngagementAction={handleEngagementAction}
        />
        <div className="flex flex-col-2 gap-1 p-2">
          <AdComponent adKey="app-novelchap_bottom_1" />
          <AdComponent adKey="app-novelchap_bottom_2" />
        </div>
        <div className="flex flex-col-2 gap-1 p-2">
          <AdComponent adKey="app-novelchap_bottom_3" />
          <AdComponent adKey="app-novelchap_bottom_4" />
        </div>
      </div>
      {/* <div className={`fixed left-0 right-0 transition-all duration-300 ease-in-out`}>
        <AdComponent adKey="app_detail_tab_bottom_jm3" closeBtn={true} />
      </div> */}
      <NovelReadBottom
        t={t}
        nid={nid}
        ncid={ncid}
        setTab={setTab}
        commentRef={commentRef}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        favoriteSave={favoriteSave}
        handleEngagementAction={handleEngagementAction}
        handleNextChapter={handleNextChapter}
      />
      {(dialogOpen.textFields || dialogOpen.moreElse || dialogOpen.buyNovel) && (
        <DialogModal
          nid={nid}
          favoriteSave={favoriteSave}
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          textFieldsSettings={textFieldsSettings}
          setTextFieldsSettings={setTextFieldsSettings}
          handleChangeTextSettings={handleChangeTextSettings}
          handleEngagementAction={handleEngagementAction}
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
      <TopBtn />
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
    </>
  );
};

export default NovelRead;
