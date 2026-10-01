import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DownloadIcon from "@mui/icons-material/Download";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import TextsmsIcon from "@mui/icons-material/Textsms";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Keyboard, Pagination, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  FETCH_ADD_FAVORITE_THUNK,
  FETCH_ADD_LIKE_THUNK,
  FETCH_EDIT_FAVORITE_FOLDER_THUNK,
  FETCH_FAVORITE_LIST_THUNK,
  FETCH_NOTIFICATIONS_SERTRACK_THUNK,
  FETCH_POST_NOTIFICATIONS_SERTRACK_THUNK,
  FETCH_TAGS_FAVORITE_UPDATE_THUNK,
} from "../../actions/memberAction";
import { DetailHelpData } from "../../assets/JsonData";
import FolderModal from "../../components/Modal/FolderModal";
import { useImageInterval } from "../../Hooks";
import { CLEAR_MEMBER_LIST } from "../../reducers/memberReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { trackAdEvent, useAdImpression } from "../../utils/analytics";
import CommonUtil, { getRandomItems } from "../../utils/Function";
import { defaultEditInitialState } from "../../utils/InterFace";
import Loading from "../Common/Loading";
import MsgModal from "../Modal/MsgModal";

const Desc = (props: any) => {
  const {
    t,
    darkMode,
    queryId,
    setting,
    logined,
    memberInfo,
    adsContent,
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
  const isTrackItem = trackList.includes(queryId);
  const storedLikes = JSON.parse(localStorage.getItem("likedItems") as string) || [];
  const [addedMarks, setAddedMarks] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem("addedMarks") || "[]"))
  );
  const [removedMarks, setRemovedMarks] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem("removedMarks") || "[]"))
  );
  const [markLoading, setMarkLoading] = useState(false);
  const [isTrack, setIsTrack] = useState(false);
  const adFreeStatus = (memberInfo && memberInfo?.ad_free) || false;
  const middleAds = adsContent?.stype?.app_detail_between_author_and_related;
  const currentImage = useImageInterval(5000);
  const containerRef = useRef<HTMLDivElement>(null);

  const middleAdsItems = useMemo(() => {
    if (!middleAds?.length) return [];

    const indexes = middleAds.length > 1 ? getRandomItems(middleAds, middleAds.length).indexes : [0];

    return indexes.map((index) => middleAds[index]?.advs?.[0]).filter(Boolean);
  }, [middleAds]);

  const middle_adv_key = middleAdsItems[currentImage]?.adv_id;
  const middle_adv_desc = middleAdsItems[currentImage]?.adv_name;
  const middle_adv_name = middleAdsItems[currentImage]?.adv_title;

  useAdImpression(
    containerRef,
    true,
    () =>
      trackAdEvent("jm3_ad_impression", { adKey: middle_adv_key, ad_desc: middle_adv_desc, adName: middle_adv_name }),
    adsContent?.length
  );

  const updateMarkState = (id: string, action: "add" | "remove") => {
    if (action === "add") {
      setAddedMarks((prev) => {
        const s = new Set(prev);
        s.add(id);
        localStorage.setItem("addedMarks", JSON.stringify([...s]));
        return s;
      });
      setRemovedMarks((prev) => {
        const s = new Set(prev);
        s.delete(id);
        localStorage.setItem("removedMarks", JSON.stringify([...s]));
        return s;
      });
    } else {
      setRemovedMarks((prev) => {
        const s = new Set(prev);
        s.add(id);
        localStorage.setItem("removedMarks", JSON.stringify([...s]));
        return s;
      });
      setAddedMarks((prev) => {
        const s = new Set(prev);
        s.delete(id);
        localStorage.setItem("addedMarks", JSON.stringify([...s]));
        return s;
      });
    }
  };

  const handleEngagementAction = async (type: string, id: string) => {
    if (type === "like") {
      if (storedLikes.includes(id)) {
        showSnackbar(t("snack.already_rated"), "success");
        return;
      }
      localStorage.setItem("likedItems", JSON.stringify([...storedLikes, id]));
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
        setMarkLoading(true);
        handleFindFolder();
        setEditFolder({ ...editFolder, aid: id });
        const result = await dispatch(FETCH_ADD_FAVORITE_THUNK(id)).unwrap();
        const { code, data } = result;
        if (code === 200) {
          const msgType = data.status !== "ok" ? "error" : "success";
          showSnackbar(data.msg, msgType);
        }
        if (data.status === "ok") {
          if (data.type === "add" || data.type === "edit" || data.type === "move") {
            updateMarkState(id, "add");
            setDialogOpen({ ...dialogOpen, folder: true });
          } else if (data.type === "remove") {
            updateMarkState(id, "remove");
          }
        }
        setMarkLoading(false);
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
    setMarkLoading(true);
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
    setMarkLoading(false);
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

  const splicingLink = (link: string) => {
    const query = link.split("?")[1];
    return query ? `/pay?${query}` : "/pay";
  };

  return (
    <>
      {markLoading && <Loading />}
      <div className="p-3 w-full dark:text-tgy  dark:bg-bk">
        <div className="w-full h-20 flex justify-around items-center text-gy py-1">
          <button
            className="flex flex-col items-center dark:text-tgy"
            onClick={() => {
              handleEngagementAction("like", queryId);
            }}
          >
            {detailList.liked || storedLikes.includes(queryId) ? (
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
            {(detailList.is_favorite && !removedMarks.has(queryId)) || addedMarks.has(queryId) ? (
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
        <span
          className="text-gy cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(queryId);
            showSnackbar(t("snack.copy_success"), "success");
          }}
        >
          JM{queryId}
        </span>
        <p className="text-gy my-4">
          {t("detail.page_count")}：{detailList.total_photos || 0}
        </p>
        <p className="my-4 text-lg">{t("detail.description")}</p>
        {detailList.description?.split(/(\r\n\r\n\r\n)/).map((desc: any, i: any) => (
          <p key={i} className="text-gy whitespace-pre-wrap">
            {desc}
          </p>
        ))}
        {/* ads  */}
        {!adFreeStatus &&
          middleAdsItems.length > 0 &&
          middleAdsItems.map((item, index) => {
            const imageUrl = item.adv_img.startsWith("http") ? item.adv_img : setting?.img_host + item.adv_img;
            const isPayment = item.adv_link.includes("payment?");
            const className = `relative bg-white justify-between my-2 ${index === currentImage ? "flex" : "hidden"}`;
            const onClick = () =>
              trackAdEvent("jm3_ad_click", {
                adKey: middle_adv_key,
                ad_desc: middle_adv_desc,
                adName: item.adv_title ?? String(item.adv_id),
              });
            const content = (
              <>
                <div className="p-5">
                  <span>{item.adv_name}</span>

                  <div
                    className="mt-1"
                    dangerouslySetInnerHTML={{
                      __html: item.adv_text,
                    }}
                  />
                </div>

                <div className="w-16 h-16 bg-og border border-solid rounded-full border-white absolute left-[40%] top-[30%] transform -translate-y-2 -translate-x-1/2 text-white overflow-hidden flex items-center justify-center">
                  <span className="text-center break-words p-2">{item.adv_recommend}</span>
                </div>

                <img src={imageUrl} alt={item.adv_title} width="60%" />
              </>
            );

            return isPayment ? (
              <Link key={imageUrl} to={splicingLink(item.adv_link)} onClick={onClick} className={className}>
                {content}
              </Link>
            ) : (
              <a
                key={imageUrl}
                href={item.adv_link.startsWith("http") ? item.adv_link : setting.main_web_host}
                target="_blank"
                rel="noreferrer"
                onClick={onClick}
                className={className}
              >
                {content}
              </a>
            );
          })}
        <div className="flex flex-wrap items-center text-gy mt-4 dark:text-tgy">
          {detailList.tags?.slice(0, showTagMore ? detailList.tags?.length : 8).map((tag: string, i: number) => (
            <div
              key={`${tag}-${i}`}
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
              {detailList.author?.map((auther: string, i: number) => (
                <div
                  key={`${auther}-${i}`}
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
              {detailList.actors?.map((actor: string, i: number) => (
                <div
                  key={`${actor}-${i}`}
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
              {detailList.works?.map((work: string, i: number) => (
                <div
                  key={`${work}-${i}`}
                  onClick={() => navigate(`/search?filter=${work}`, { state: { from: location.pathname } })}
                >
                  <p className="border-[1px] border-solid border-gy rounded-md p-1 m-1 dark:bg-nbk">{"#" + work}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {detailList.real_link && (
          <button
            className="w-full px-4 py-2 rounded-md bg-og py-3 mt-4 text-white"
            onClick={() => window.open(detailList.real_link, "_blank")}
          >
            {t("detail.real_link")}
          </button>
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
                        sessionStorage.setItem("relatedQuery", queryId);
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
                        className={`${related.liked || storedLikes.includes(related.id) ? "text-red-600" : "text-og"}`}
                      />
                    </div>
                    <div
                      className="bg-[rgb(117,117,117,0.6)] absolute right-1 bottom-1 rounded p-[0.1rem]"
                      onClick={() => {
                        handleEngagementAction("mark", related.id);
                      }}
                    >
                      {(related.is_favorite && !removedMarks.has(related.id)) || addedMarks.has(related.id) ? (
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
          markLoading={markLoading}
          folderList={favoriteList.folder_list}
          tagsList={[...(detailList.tags || []), ...(detailList.author ? detailList.author : [])]}
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
