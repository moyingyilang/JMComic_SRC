import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SendIcon from "@mui/icons-material/Send";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { GoBack } from "../../Hooks";
import { FETCH_BLOGS_INFO_THUNK } from "../../actions/blogsAction";
import { FETCH_FORUM_SEND_THUNK, FETCH_FORUM_THUNK } from "../../actions/forumAction";
import { FETCH_ADD_LIKE_THUNK } from "../../actions/memberAction";
import AdComponent from "../../components/Ads/AdComponent";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import RelatedComicCarousel from "../../components/Blogs/RelatedComicCarousel";
import RelatedListCarousel from "../../components/Blogs/RelatedListCarousel";
import Share from "../../components/Comic/Share";
import HeaderAds from "../../components/Common/HeaderAds";
import Loading from "../../components/Common/Loading";
import ForumList from "../../components/Forum/ForumList";
import MemberModal from "../../components/Modal/MemberModal";
import NewTopicModal from "../../components/Modal/NewTopicModal";
import { CLEAR_BLOG_STATE } from "../../reducers/blogsReducer";
import { CLEAR_FORUM_LIST, LOAD_FORUM_LIST } from "../../reducers/forumReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { defaultUserFormData } from "../../utils/InterFace";

const BlogsDetail = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined, memberInfo } = config;
  const { t } = useTranslation();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const dispatch = useAppDispatch();
  const { blogsInfo, isBlogLoading } = useAppSelector((state) => state.blogs);
  const { forumList, isLoading } = useAppSelector((state) => state.forum);
  const [dialogOpen, setDialogOpen] = useState({ login: false, signUp: false, forgot: false, newTopic: false });
  const [page, setPage] = useState(() => Number(sessionStorage.getItem("blogsCommentsLoadMore")) || 1);
  const [share, setShare] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryId = searchParams.get("id") as string;
  const queryTab = searchParams.get("tab") as string;
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [responds, setResponds] = useState({
    newTopic: "",
    spoilers: false,
    reply: "",
    activeIndex: null,
    recommendBN_input: "",
    recommendBN: [],
    recommendBN_empty: false,
    recommendBN_exceed: false,
  });
  const [formData, setFormData] = useState(defaultUserFormData);
  const isBlogsLikedItem = JSON.parse(localStorage.getItem("blogLikedItems") || "[]");

  const loadList = useCallback(
    (
      isLoadMore: boolean = false,
      isRefreshing: boolean = false,
      mode: string = "blog",
      time: number = 0,
      page: number = 1,
      bid: string = queryId
    ) => {
      dispatch(LOAD_FORUM_LIST({ isLoading: true, isLoadMore, isRefreshing }));
      if (isRefreshing) {
        setPage(1);
        dispatch(CLEAR_FORUM_LIST("forumList"));
        sessionStorage.setItem("blogsCommentsLoadMore", "1");
      }

      setTimeout(() => {
        dispatch(FETCH_FORUM_THUNK({ mode, page, bid }));
      }, time);
    },
    [dispatch, queryId]
  );

  const handleClick = () => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useEffect(() => {
    if (queryId) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setPage(1);
      sessionStorage.setItem("blogsCommentsLoadMore", "1");
      loadList();
      if (queryTab) {
        dispatch(CLEAR_BLOG_STATE("blogsInfo"));
        dispatch(FETCH_BLOGS_INFO_THUNK(queryId));
      }
    }
  }, [dispatch, queryId, queryTab]);

  useEffect(() => {
    if (!blogsInfo?.info?.content) return;

    const container = document.querySelector(".blog-content");
    if (!container) return;

    const images = container.querySelectorAll("img");
    images.forEach((img: HTMLImageElement) => {
      if (img.src.includes("blogs") || img.src.includes("cdn-msp")) {
        img.removeAttribute("style");
        img.style.width = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "0 auto";
      }
    });
  }, [blogsInfo]);

  // newTopic && reply
  const handleSendRespond = async (comment: string, aid: string, comment_id?: string) => {
    let result: Record<string, any> = {};
    if (dialogOpen.newTopic && responds.newTopic !== "") {
      result = await dispatch(FETCH_FORUM_SEND_THUNK({ comment, aid }));
    } else if (responds.reply !== "" && comment_id !== "") {
      result = await dispatch(FETCH_FORUM_SEND_THUNK({ comment, aid, comment_id }));
    }
    setResponds((prev: any) => ({ ...prev, reply: "", newTopic: "" }));
    if (result.code === 200) {
      const { msg, status } = result.data;
      const type = status !== "ok" ? "error" : "success";
      showSnackbar(msg, type);
      loadList(false, true);
    }
  };

  const handleEngagementAction = async (id: string) => {
    if (isBlogsLikedItem.includes(id)) {
      showSnackbar(t("snack.already_rated"), "success");
      return;
    }
    localStorage.setItem("blogLikedItems", JSON.stringify([...isBlogsLikedItem, id]));
    const result = await dispatch(FETCH_ADD_LIKE_THUNK({ id, like_type: "blog" })).unwrap();
    const { code, msg, status } = result.data;
    const type = status !== "success" ? "error" : "success";
    if (code === 200) showSnackbar(msg, type);
  };

  return (
    <div>
      {isBlogLoading && <Loading />}
      <div className="pb-40">
        <div className="sticky top-safe left-0 right-0 bg-defaultBg z-50 dark:bg-nbk">
          <HeaderAds />
          <div className=" w-full h-14 bg-bbk text-tgy flex justify-between items-center px-3">
            <div className="flex items-center">
              <GoBack back="/blogs" />
              <p className="ml-4 w-80 truncate">{blogsInfo?.info?.title}</p>
            </div>
            <MoreHorizIcon
              sx={{ fontSize: 28, stroke: "white", strokeWidth: 1, color: "white" }}
              onClick={() => setShare(true)}
            />
          </div>
          {Object.keys(blogsInfo).length > 0 && (
            <div className="bg-white mt-2 dark:bg-nbk">
              <div className="p-3">
                <p>{blogsInfo.info?.title}</p>
                <div className="mt-4 mb-2">
                  <span className="bg-og text-white rounded p-2">
                    {queryTab === "1" ? t("blogs.night_bistro") : t("blogs.game_library")}
                  </span>
                  {blogsInfo.info.tags[0] !== "" &&
                    blogsInfo.info.tags[0].split(",").map((d: any) => (
                      <span key={d} className="bg-tgy text-gy rounded p-2 ml-2">
                        {d}
                      </span>
                    ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-0 text-gy text-center">
                <button className="p-2 border border-solid border-tgy">
                  {blogsInfo.info.total_likes}
                  {t("blogs.likes_count")}
                </button>
                <button className="p-2 border border-solid border-tgy" onClick={handleClick}>
                  {forumList.total}
                  {t("blogs.reply_count")}
                </button>
                <button
                  className={`p-2 border border-solid border-tgy
                   ${blogsInfo.info.is_liked ? " text-og" : ""}`}
                  onClick={() => handleEngagementAction(queryId)}
                >
                  {blogsInfo.info.is_liked || isBlogsLikedItem.includes(queryId)
                    ? t("blogs.liked")
                    : t("blogs.give_like")}
                </button>
              </div>
            </div>
          )}
        </div>
        {Object.keys(blogsInfo).length > 0 && (
          <>
            <div className="min-h-[100vh] bg-white my-6 pt-60 dark:bg-nbk">
              <div className="p-8">
                <div
                  className="blog-content text-bbk dark:text-tgy"
                  dangerouslySetInnerHTML={{ __html: blogsInfo.info?.content }}
                />
              </div>
            </div>
            {blogsInfo.related_blogs?.length > 0 && (
              <div className="bg-white mt-2 p-2 dark:bg-nbk">
                <p className="m-2">{t("blogs.related_articles")}</p>
                <RelatedListCarousel
                  t={t}
                  queryTab={queryTab}
                  related_list={blogsInfo.related_blogs}
                  setting={setting}
                />
              </div>
            )}
            {blogsInfo.related_comics?.length > 0 && (
              <div className="bg-white mt-4 p-2 dark:bg-nbk">
                <p className="m-2">{t("blogs.recommended_comics")}</p>
                <RelatedComicCarousel related_comics={blogsInfo.related_comics} setting={setting} />
              </div>
            )}
            <div ref={targetRef} className="mt-4">
              <ForumList
                t={t}
                logined={logined}
                setting={setting}
                memberInfo={memberInfo}
                list={forumList.list}
                isLoading={isLoading}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                responds={responds}
                setResponds={setResponds}
                showReplySection={true}
                section="blogs_comments"
                page={page}
                setPage={setPage}
                pageStorageKey="blogsCommentsLoadMore"
                pageSize={5}
                mode="blog"
                scrollTarget={targetRef}
                loadList={loadList}
                showSnackbar={showSnackbar}
              />
              <div className="bg-bbk h-20 flex items-center justify-center mt-2">
                <input
                  type="text"
                  placeholder={t("forum.start_new_topic")}
                  className="w-10/12 h-10 rounded p-2 outline-none dark:bg-bk"
                  onClick={() =>
                    !logined
                      ? setDialogOpen({ ...dialogOpen, login: true })
                      : setDialogOpen({ ...dialogOpen, newTopic: true })
                  }
                />
                <button className="rounded-full bg-og p-2 ml-2">
                  <SendIcon sx={{ color: "white", fontSize: 16, stroke: "white", strokeWidth: 1 }} />
                </button>
              </div>
              <div className="mt-2">
                <div className="grid grid-cols-2 h-full">
                  <AdComponent adKey="app_blog_bottom_left_1" />
                  <AdComponent adKey="app_blog_bottom_right_1" />
                </div>
                <AdComponent adKey="app_blog_bottom_center_jm3" />
                <div className="grid grid-cols-2 h-full">
                  <AdComponent adKey="app_blog_bottom_left_2" />
                  <AdComponent adKey="app_blog_bottom_right_2" />
                </div>
                <div className="flex justify-center">
                  <AdComponent adKey="app_blog_bottom" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <AdComponent adKey="app_blog_fixed_bottom_jm3" closeBtn={true} />
      </div>
      <PositionedSnackbar setSnackbars={setSnackbars} snackbars={snackbars} />
      {share && <Share share={share} setShare={setShare} setting={setting} queryId={queryId} type={"blog"} />}
      {(dialogOpen.login || dialogOpen.signUp || dialogOpen.forgot) && !logined && (
        <MemberModal
          setFormData={setFormData}
          formData={formData}
          setConfig={setConfig}
          logined={logined}
          isLoading={isBlogLoading}
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          showSnackbar={showSnackbar}
        />
      )}
      <NewTopicModal
        open={dialogOpen.newTopic}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        responds={responds}
        setResponds={setResponds}
        handleSendNewTopic={() => handleSendRespond(responds.newTopic, queryId)}
        showSnackbar={showSnackbar}
        queryId={queryId}
      />
    </div>
  );
};

export default BlogsDetail;
