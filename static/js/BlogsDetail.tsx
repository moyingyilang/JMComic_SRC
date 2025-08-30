import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SendIcon from "@mui/icons-material/Send";
import Loading from "../../components/Common/Loading";
import RelatedListCarousel from "../../components/Blogs/RelatedListCarousel";
import RelatedComicCarousel from "../../components/Blogs/RelatedComicCarousel";
import ForumList from "../../components/Forum/ForumList";
import Share from "../../components/Comic/Share";
import DialogModal from "../../components/Modal/DialogModal";
import MemberModal from "../../components/Modal/MemberModal";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import { FETCH_FORUM_THUNK, FETCH_FORUM_SEND_THUNK } from "../../actions/forumAction";
import { FETCH_ADD_LIKE_THUNK } from "../../actions/memberAction";
import { FETCH_BLOGS_INFO_THUNK } from "../../actions/blogsAction";
import { CLEAR_FORUM_LIST, LOAD_FORUM_LIST } from "../../reducers/forumReducer";
import { defaultUserFormData } from "../../utils/InterFace";
import { GoBack } from "../../Hooks";
import AdComponent from "../../components/Ads/AdComponent";
import { CLEAR_BLOG_STATE } from "../../reducers/blogsReducer";

const BlogsDetail = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined } = config;
  const { t } = useTranslation();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const dispatch = useAppDispatch();
  const { blogsInfo, isBlogLoading } = useAppSelector((state) => state.blogs);
  const { forumList, isLoading } = useAppSelector((state) => state.forum);
  const [dialogOpen, setDialogOpen] = useState({ login: false, signUp: false, forgot: false, newTopic: false });
  const [page, setPage] = useState(1);
  const [share, setShare] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryId = searchParams.get("id") as string;
  const queryTab = searchParams.get("tab") as string;
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [responds, setResponds] = useState({ newTopic: "", spoilers: false, reply: "", activeIndex: null });
  const [formData, setFormData] = useState(defaultUserFormData);
  const pageLimit = forumList.list?.length ? Math.ceil(forumList.total / 5) : 0;
  const hasNextPage = page < pageLimit && pageLimit > 1;
  const isBlogsLikedItem = JSON.parse(localStorage.getItem("blogLikedItems") || "[]");

  const loadList = (
    isLoadMore: boolean = false,
    isRefreshing: boolean = false,
    time: number = 0,
    page: number = 1,
    bid: string = queryId,
    mode: string = "blog"
  ) => {
    dispatch(LOAD_FORUM_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    if (!isLoadMore) {
      setPage(1);
      dispatch(CLEAR_FORUM_LIST("forumList"));
    }
    setTimeout(() => {
      dispatch(FETCH_FORUM_THUNK({ mode, page, bid }));
    }, time);
  };

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
      loadList();
      if (queryTab) {
        dispatch(CLEAR_BLOG_STATE("blogsInfo"));
        dispatch(FETCH_BLOGS_INFO_THUNK(queryId));
      }
    }
  }, [dispatch, queryId, queryTab]);

  const handleLoadMore = (nextPage: number) => {
    if (!hasNextPage) return;
    setPage(nextPage);
    loadList(true, false, 1000, nextPage);
  };

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
        <div className="fixed top-0 left-0 right-0 bg-defaultBg z-50 dark:bg-nbk">
          <div className=" w-full h-16 bg-bbk text-tgy flex justify-between items-center px-3">
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
                  <span className="bg-og text-tgy rounded p-2">
                    {queryTab === "1" ? t("blogs.night_bistro") : t("blogs.game_library")}
                  </span>
                  {blogsInfo.info.tags[0].split(",").map((d: any) => (
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
              <div ref={targetRef} className="bg-white mt-2 p-2 dark:bg-nbk">
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
            <div className="mt-4">
              <ForumList
                t={t}
                logined={logined}
                setting={setting}
                list={forumList.list}
                isLoading={isLoading}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                responds={responds}
                setResponds={setResponds}
                handleSendRespond={handleSendRespond}
                showReplySection={true}
                hasNextPage={hasNextPage}
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
              <div className="flex justify-center mt-2">
                {hasNextPage && (
                  <button
                    onClick={() => handleLoadMore(page + 1)}
                    className="w-4/12 rounded-sm text-white p-2 my-4 bg-og shadow-lg shadow-stone-700/50"
                  >
                    {t("comic.click_to_load")}
                  </button>
                )}
              </div>
              <div className="mt-2">
                <div className="grid grid-cols-2 h-full">
                  <AdComponent adKey="app_blog_bottom_left_1" />
                  <AdComponent adKey="app_blog_bottom_right_1" />
                </div>
                <div className="max-h-[70px] overflow-hidden">
                  <AdComponent adKey="app_blog_bottom_center" />
                </div>
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
      <div className="max-h-[70px] fixed bottom-0 left-0 right-0 z-20 bg-white">
        <AdComponent adKey="app_blogs_fixed_bottom" closeBtn={true} />
      </div>
      <PositionedSnackbar setSnackbars={setSnackbars} snackbars={snackbars} />
      {share && <Share share={share} setShare={setShare} setting={setting} queryId={queryId} type={"blog"} />}
      {dialogOpen.newTopic && (
        <DialogModal
          queryId={queryId}
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          responds={responds}
          setResponds={setResponds}
          handleSendRespond={handleSendRespond}
        />
      )}
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
    </div>
  );
};

export default BlogsDetail;
