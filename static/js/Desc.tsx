import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard, Scrollbar } from "swiper/modules";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import TextsmsIcon from "@mui/icons-material/Textsms";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import DownloadIcon from "@mui/icons-material/Download";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FolderModal from "../../components/Modal/FolderModal";
import MsgModal from "../Modal/MsgModal";
import {
  FETCH_ADD_LIKE_THUNK,
  FETCH_ADD_FAVORITE_THUNK,
  FETCH_EDIT_FAVORITE_FOLDER_THUNK,
  FETCH_FAVORITE_LIST_THUNK,
  FETCH_TAGS_FAVORITE_UPDATE_THUNK,
  FETCH_NOTIFICATIONS_SERTRACK_THUNK,
  FETCH_POST_NOTIFICATIONS_SERTRACK_THUNK,
} from "../../actions/memberAction";
import { CLEAR_MEMBER_LIST } from "../../reducers/memberReducer";
import { DetailHelpData } from "../../assets/JsonData";
import CommonUtil from "../../utils/Function";
import { defaultEditInitialState } from "../../utils/InterFace";
import { useImageInterval } from "../../Hooks";

const Desc = (props: any) => {
  const {
    t,
    darkMode,
    queryId,
    setting,
    logined,
    detailList,
    setTab,
    msgOpen,
    setMsgOpen,
    setShowTagMore,
    showTagMore,
    seriesGroups,
    setSeriesGroups,
    showSnackbar,
    editFolder,
    setEditFolder,
    dialogOpen,
    setDialogOpen,
  } = props;

  const detailHelp = DetailHelpData();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { favoriteList } = useAppSelector((state) => state.member);
  const trackList = JSON.parse(localStorage.getItem("trackList") as string) || [];
  const adsContent = JSON.parse(localStorage.getItem("adsContent") as string) || [];
  const middleAds = adsContent.stype.app_detail_between_author_and_related;
  const isTrackItem = trackList.includes(queryId);
  const isLikedItem = JSON.parse(localStorage.getItem("likedItems") as string) || [];
  const [favoriteSave, setFavoriteSave] = useState<{ like: string[]; mark: string[] }>({ like: [], mark: [] });
  const [isTrack, setIsTrack] = useState(false);
  const currentImage = useImageInterval(10000);
  const middleAdsItem = middleAds[currentImage]?.advs[0];

  // like && mark
  const toggleFavoriteState = (type: "like" | "mark", id: string) => {
    setFavoriteSave((prev: any) => {
      const currentList = prev[type] || [];
      const exists = currentList.includes(id);

      const updatedList = exists ? currentList.filter((item: string) => item !== id) : [...currentList, id];

      return {
        ...prev,
        [type]: updatedList,
      };
    });
  };

  const handleEngagementAction = async (type: string, id: string) => {
    if (type === "like") {
      if (isLikedItem.includes(id)) {
        showSnackbar(t("snack.already_rated"), "success");
        return;
      }
      localStorage.setItem("likedItems", JSON.stringify([...isLikedItem, id]));
      const result = await dispatch(FETCH_ADD_LIKE_THUNK({ id: id })).unwrap();
      const { code, msg, status } = result.data;
      if (code === 200) {
        const msgType = status !== "success" ? "error" : "success";
        showSnackbar(msg, msgType);
      }
    }
    if (type === "mark") {
      if (!logined) {
        showSnackbar(t("login.please_login"), "error");
        setDialogOpen({ ...dialogOpen, login: true });
      } else {
        handleFindFolder();
        toggleFavoriteState("mark", id);
        setEditFolder({ ...editFolder, aid: id });
        const result = await dispatch(FETCH_ADD_FAVORITE_THUNK(id)).unwrap();
        const { code, data } = result;
        if (code === 200) {
          const msgType = data.status !== "ok" ? "error" : "success";
          showSnackbar(data.msg, msgType);
        }
        if (data.status === "ok" && data.type === "add") {
          setDialogOpen({ ...dialogOpen, folder: true });
        }
      }
    }
  };

  // GetFolderList
  const handleFindFolder = (folder_id?: string, o?: string) => {
    dispatch(CLEAR_MEMBER_LIST("favoriteList"));
    dispatch(FETCH_FAVORITE_LIST_THUNK({ page: 1, folder_id: folder_id || "", o: o || "mr" }));
  };

  // EditFolder
  const handleEditFolder = async (type: string) => {
    const { folder_id, folder_name, aid, tags_select } = editFolder;
    if (tags_select !== "") {
      const tagsResult = await dispatch(FETCH_TAGS_FAVORITE_UPDATE_THUNK({ type: "add", tags: tags_select })).unwrap();
      const { code, data } = tagsResult;
      if (code === 200) {
        const msgType = data.status !== "ok" ? "error" : "success";
        showSnackbar(data.msg, msgType);
      }
    }
    if (folder_id !== "") {
      const folderResult = await dispatch(
        FETCH_EDIT_FAVORITE_FOLDER_THUNK({ type, folder_id, folder_name, aid })
      ).unwrap();
      const { code, data } = folderResult;
      if (code === 200) {
        const msgType = data.status !== "ok" ? "error" : "success";
        showSnackbar(data.msg, msgType);
      }
    } else {
      showSnackbar(t("comic.added_to_favorites_success"), "success");
    }
    setEditFolder((prev: any) => ({ ...prev, ...defaultEditInitialState }));
  };

  // track
  useEffect(() => {
    if (logined) handleTrackStatus();
  }, [logined]);

  const handleTrackStatus = async () => {
    const result = await dispatch(FETCH_NOTIFICATIONS_SERTRACK_THUNK(queryId)).unwrap();
    setIsTrack(result.data);
  };

  const handleTracking = async (id: string) => {
    if (!logined) {
      showSnackbar(t("login.please_login"), "error");
      setDialogOpen({ ...dialogOpen, login: true });
    } else {
      const result = await dispatch(FETCH_POST_NOTIFICATIONS_SERTRACK_THUNK(id)).unwrap();
      const { code, data } = result;
      if (code === 200) {
        handleTrackStatus();
        showSnackbar(data, "success");
      }
    }
  };

  return (
    <>
      <div className="p-3 w-full dark:text-tgy">
        <div className="w-full h-20 flex justify-around items-center text-gy py-1">
          <button
            className="flex flex-col items-center dark:text-tgy"
            onClick={() => {
              handleEngagementAction("like", queryId);
            }}
          >
            {detailList.liked || isLikedItem.includes(queryId) ? (
              <FavoriteIcon className="text-2xl text-og" />
            ) : (
              <FavoriteBorderIcon className="text-2xl" />
            )}
            <span className="text-center">
              {CommonUtil.fomatFloat(detailList.likes || 0, 1)}
              {t("detail.like")}
            </span>
          </button>
          <button className="flex flex-col items-center dark:text-tgy" onClick={() => setTab(3)}>
            <TextsmsIcon className="text-2xl" />
            <span className="text-center">
              {CommonUtil.fomatFloat(detailList.comment_total || 0, 1)}
              {t("detail.comments")}
            </span>
          </button>
          <button className="flex flex-col items-center dark:text-tgy">
            <RemoveRedEyeIcon className="text-2xl" />
            <span className="text-center">
              {CommonUtil.fomatFloat(detailList.total_views || 0, 1)}
              {t("detail.watch")}
            </span>
          </button>
          <button
            className="flex flex-col items-center dark:text-tgy"
            onClick={() => {
              handleEngagementAction("mark", queryId);
            }}
          >
            {detailList.is_favorite || favoriteSave.mark.includes(queryId) ? (
              <BookmarkIcon className="text-og" />
            ) : (
              <BookmarkBorderIcon className="text-2xl" />
            )}
            <span className="text-center">{t("detail.favorites")}</span>
          </button>
          <button className="flex flex-col items-center dark:text-tgy">
            <DownloadIcon className="text-2xl" />
            <span
              className="text-center"
              onClick={() => {
                detailList.series?.length > 0
                  ? setMsgOpen({ ...msgOpen, detailDownload: true })
                  : navigate(`/comic/detail/download?id=${queryId}`);
              }}
            >
              {t("detail.download")}
            </span>
          </button>
          {isTrackItem && (
            <button className="flex flex-col items-center dark:text-tgy" onClick={() => handleTracking(queryId)}>
              {isTrack ? (
                <NotificationsIcon className="text-2xl text-og" />
              ) : (
                <NotificationsNoneIcon className="text-2xl" />
              )}
              <span className="text-center">{t("detail.notification")}</span>
            </button>
          )}
        </div>
        <p className="mb-4 text-lg">{t("detail.forbidden_comics")}</p>
        <span className="text-gy">JM{queryId}</span>
        <p className="my-4 text-lg">{t("detail.description")}</p>
        {detailList.description?.split(/(\r\n\r\n\r\n)/).map((desc: any, i: any) => (
          <p key={i} className="text-gy whitespace-pre-wrap">
            {desc}
          </p>
        ))}
        {/* ads  */}
        {middleAds.length > 0 && (
          <a
            href={middleAdsItem.adv_link}
            target="_blank"
            className="relative bg-white flex justify-between my-2"
            rel="noreferrer"
          >
            <div className="p-5">
              <span>{middleAdsItem.adv_name}</span>
              <div className="mt-1" dangerouslySetInnerHTML={{ __html: middleAdsItem.adv_text }} />
            </div>
            <div className="w-16 h-16 bg-og border border-solid rounded-full border-white absolute left-[40%] top-[30%] transform -translate-y-2 -translate-x-1/2 text-white overflow-hidden flex items-center justify-center">
              <span className="text-center break-words p-2">{middleAdsItem.adv_recommend}</span>
            </div>

            <img src={middleAdsItem.adv_img} alt={middleAdsItem.adv_title} width="60%" />
          </a>
        )}
        <div className="flex flex-wrap items-center text-gy mt-4 dark:text-tgy">
          {detailList.tags?.slice(0, showTagMore ? detailList.tags?.length : 8).map((tag: string) => (
            <div
              key={tag}
              onClick={() => navigate(`/search?filter=${tag}`, { state: { from: location.pathname } })}
              className="border-[1px] border-solid border-gy rounded-md p-1 m-1 dark:bg-nbk"
            >
              {"#" + tag}
            </div>
          ))}
          {detailList.tags?.length > 8 && (
            <button
              className="border-[1px] border-solid border-og text-og rounded-md p-1 m-1 dark:bg-nbk"
              onClick={() => setShowTagMore(!showTagMore)}
            >
              {showTagMore ? t("detail.show_less") : t("detail.show_all")}
            </button>
          )}
          <HelpOutlineIcon className="text-og text-3xl mx-3" onClick={() => setMsgOpen({ ...msgOpen, detail: true })} />
        </div>
        {detailList.author?.length > 0 && (
          <div className="mt-4">
            <p className="text-lg">{t("detail.author")}</p>
            <div className="flex flex-wrap items-center text-gy dark:text-tgy">
              {detailList.author?.map((auther: string) => (
                <div
                  key={auther}
                  onClick={() => navigate(`/search?filter=${auther}`, { state: { from: location.pathname } })}
                >
                  <p className="border-[1px] border-solid border-gy rounded-md p-1 m-1 dark:bg-nbk">{"#" + auther}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {detailList.actors?.length > 0 && (
          <div className="mt-4">
            <p className="text-lg">{t("detail.actors")}</p>
            <div className="flex flex-wrap items-center text-gy dark:text-tgy">
              {detailList.actors?.map((actor: string) => (
                <div
                  key={actor}
                  onClick={() => navigate(`/search?filter=${actor}`, { state: { from: location.pathname } })}
                >
                  <p className="border-[1px] border-solid border-gy rounded-md p-1 m-1 dark:bg-nbk">{"#" + actor}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {detailList.works?.length > 0 && (
          <div className="mt-4">
            <p className="text-lg">{t("detail.works")}</p>
            <div className="flex flex-wrap items-center text-gy dark:text-tgy">
              {detailList.works?.map((work: string) => (
                <div
                  key={work}
                  onClick={() => navigate(`/search?filter=${work}`, { state: { from: location.pathname } })}
                >
                  <p className="border-[1px] border-solid border-gy rounded-md p-1 m-1 dark:bg-nbk">{"#" + work}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white p-3 mt-4 dark:bg-nbk dark:text-tgy">
          <div className="flex justify-between">
            <p>{t("detail.more_related")}</p>
          </div>
          <Swiper
            slidesPerView={3}
            centeredSlides={false}
            slidesPerGroupSkip={3}
            grabCursor={true}
            keyboard={{
              enabled: true,
            }}
            breakpoints={{
              769: {
                slidesPerView: 4,
                slidesPerGroup: 4,
              },
            }}
            scrollbar={true}
            modules={[Keyboard, Scrollbar, Pagination]}
            className="mySwiper2"
          >
            {detailList.related_list?.length > 0 &&
              detailList.related_list?.map((related: any) => (
                <SwiperSlide key={related.id} className="p-1">
                  <div className="relative">
                    <div
                      onClick={() => {
                        navigate(`/comic/detail?id=${related.id}`);
                        sessionStorage.setItem("relatedQuery", `/comic/detail?id=${queryId}`);
                      }}
                    >
                      <img
                        src={setting?.img_host + "/media/albums/" + related.id + "_3x4.jpg?v=" + detailList.addtime}
                        alt={related.id}
                        loading="lazy"
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = "1";
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/cover_default.jpg";
                        }}
                        className="object-cover rounded-md w-[128px] h-[171px]"
                        style={{
                          opacity: "0",
                          transition: "opacity 0.5s ease-in-out",
                        }}
                      />
                    </div>
                    <div
                      className="bg-[rgb(117,117,117,0.6)] absolute left-1 bottom-1 rounded p-[0.1rem]"
                      onClick={() => {
                        handleEngagementAction("like", related.id);
                      }}
                    >
                      <FavoriteIcon
                        className={`${related.liked || isLikedItem.includes(related.id) ? "text-red-600" : "text-og"}`}
                      />
                    </div>
                    <div
                      className="bg-[rgb(117,117,117,0.6)] absolute right-1 bottom-1 rounded p-[0.1rem]"
                      onClick={() => {
                        handleEngagementAction("mark", related.id);
                      }}
                    >
                      {related.is_favorite || favoriteSave.mark.includes(related.id) ? (
                        <BookmarkIcon className="text-og" />
                      ) : (
                        <BookmarkBorderIcon className="text-2xl text-white" />
                      )}
                    </div>
                  </div>
                  <p className="truncate">{related.name}</p>
                  <p className="truncate text-gy text-t08">{related.author}</p>
                </SwiperSlide>
              ))}
          </Swiper>
        </div>
      </div>
      {msgOpen.detail && (
        <MsgModal darkMode={darkMode} content={detailHelp} msgOpen={msgOpen} setMsgOpen={setMsgOpen} />
      )}
      {msgOpen.detailDownload && (
        <MsgModal
          t={t}
          queryId={queryId}
          detailList={detailList}
          setSeriesGroups={setSeriesGroups}
          seriesGroups={seriesGroups}
          msgOpen={msgOpen}
          setMsgOpen={setMsgOpen}
        />
      )}
      {dialogOpen.folder && (
        <FolderModal
          folderList={favoriteList.folder_list}
          tagsList={detailList.tags}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          editFolder={editFolder}
          setEditFolder={setEditFolder}
          handleEditFolder={handleEditFolder}
        />
      )}
    </>
  );
};

export default Desc;
