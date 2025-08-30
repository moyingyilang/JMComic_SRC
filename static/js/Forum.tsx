import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useTranslation } from "react-i18next";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { useInView } from "react-intersection-observer";
import SendIcon from "@mui/icons-material/Send";
import Header from "../../components/Common/Header";
import BottomNav from "../../components/Main/BottomNav";
import ForumList from "../../components/Forum/ForumList";
import Loading from "../../components/Common/Loading";
import DialogModal from "../../components/Modal/DialogModal";
import MemberModal from "../../components/Modal/MemberModal";
import { FETCH_FORUM_THUNK, FETCH_FORUM_SEND_THUNK } from "../../actions/forumAction";
import { CLEAR_FORUM_LIST, LOAD_FORUM_LIST } from "../../reducers/forumReducer";
import { defaultUserFormData } from "../../utils/InterFace";
import { CommonQData } from "../../assets/JsonData";
import { renderText } from "../../utils/Function";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import TopBtn from "../../components/Common/TopBtn";
import { useScrollToTop } from "../../Hooks";

const Forum = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined, memberInfo } = config;
  const { t } = useTranslation();
  const commonQ = CommonQData();
  const location = useLocation();
  const scrollToTop = useScrollToTop();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const rulesContent = commonQ[2].text_section[0].content.slice(0, 7);
  const [dialogOpen, setDialogOpen] = useState({ login: false, signUp: false, forgot: false, newTopic: false });
  const [responds, setResponds] = useState({ newTopic: "", spoilers: false, reply: "", activeIndex: null });
  const dispatch = useAppDispatch();
  const { forumList, isLoading, isRefreshing } = useAppSelector((state) => state.forum);
  const [formData, setFormData] = useState(defaultUserFormData);
  const searchParams = new URLSearchParams(location.search);
  const [mode, setMode] = useState(() => {
    const stored = sessionStorage.getItem("forumTab");
    return stored !== null ? stored : "all";
  });
  const [tabChange, setTabChange] = useState(false);
  const { ref, inView } = useInView();
  const [page, setPage] = useState(1);
  const pageLimit = forumList.list?.length ? Math.ceil(forumList.total / 10) : 0;
  const hasNextPage = page <= pageLimit && pageLimit > 1;
  const forumFrom = sessionStorage.getItem("forumFrom");

  const loadList = (
    isLoadMore: boolean = false,
    isRefreshing: boolean = false,
    mode: string = "all",
    time: number = 0,
    page: number = 1
  ) => {
    dispatch(LOAD_FORUM_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    if (isRefreshing) {
      setPage(1);
      dispatch(CLEAR_FORUM_LIST("forumList"));
    }
    setTimeout(() => {
      dispatch(FETCH_FORUM_THUNK({ mode, page }));
    }, time);
    setTabChange(false);
  };

  useEffect(() => {
    if (forumList.list?.length === 0 || tabChange || forumFrom !== "forum") {
      scrollToTop();
      loadList(false, false, mode);
      sessionStorage.setItem("forumTab", String(mode));
      sessionStorage.setItem("forumFrom", "forum");
    }

    sessionStorage.setItem("fromPage", `${location.pathname}?mode=${mode}`);
  }, [forumList.list?.length, tabChange, forumFrom]);

  const handleRefresh = () => {
    loadList(false, true, mode);
  };

  // load more
  const isFetchingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (!inView || !hasNextPage || isFetchingRef.current) return;
    isFetchingRef.current = true; // 防止重複觸發
    const nextPage = page + 1;
    setPage(nextPage);
    loadList(true, false, mode, 1000, nextPage);
    // 重置 fetching flag
    setTimeout(() => {
      isFetchingRef.current = false;
    }, 2500); // 2s 加載 + buffer
  }, [inView, hasNextPage]);

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView]);

  // newTopic && reply
  const handleSendRespond = async (comment: string, aid: string, comment_id?: string) => {
    let result: Record<string, any> = {};
    if (dialogOpen.newTopic && responds.newTopic !== "") {
      result = await dispatch(FETCH_FORUM_SEND_THUNK({ comment, aid })).unwrap();
    } else if (responds.reply !== "" && comment_id !== "") {
      result = await dispatch(FETCH_FORUM_SEND_THUNK({ comment, aid, comment_id })).unwrap();
    }
    if (result.code === 200) {
      const { msg, status } = result.data;
      const type = status !== "ok" ? "error" : "success";
      showSnackbar(msg, type);
      setResponds((prev: any) => ({ ...prev, reply: "", newTopic: "" }));
      setDialogOpen({ ...dialogOpen, newTopic: false });
    }
  };

  return (
    <div className="min-h-screen">
      {isLoading && <Loading />}
      <Header currentPage="forum" setTabChange={setTabChange} setMode={setMode} mode={mode} />
      {forumList.list?.length > 0 && (
        <PullToRefreshify
          completeDelay={1000}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderText={renderText}
          className="overflow-y-visible"
        >
          <div className="text-bbk mt-3 pb-10 dark:text-tgy">
            {mode === "chat" && (
              <div className="m-3">
                {rulesContent.map((d: any) => (
                  <p key={d}>{d}</p>
                ))}
              </div>
            )}
            <ForumList
              t={t}
              setting={setting}
              logined={logined}
              list={forumList.list}
              isLoading={isLoading}
              setDialogOpen={setDialogOpen}
              dialogOpen={dialogOpen}
              responds={responds}
              setResponds={setResponds}
              handleSendRespond={handleSendRespond}
              showReplySection={true}
            />
            {hasNextPage && <button ref={ref} onClick={loadMore} className="w-full flex justify-center pb-40"></button>}
          </div>
        </PullToRefreshify>
      )}
      {mode === "chat" && (
        <div className="w-full fixed bottom-16 bg-bbk h-20 flex items-center justify-center mb-4">
          <input
            type="text"
            maxLength={200}
            placeholder={t("forum.start_new_topic")}
            className="w-10/12 h-10 rounded outline-none p-2"
            value={responds.newTopic}
            onChange={() => setDialogOpen({ ...dialogOpen, [logined ? "newTopic" : "login"]: true })}
            onClick={() => setDialogOpen({ ...dialogOpen, [logined ? "newTopic" : "login"]: true })}
          />

          <button className="rounded-full bg-og p-2 ml-2">
            <SendIcon sx={{ color: "white", fontSize: 18, stroke: "white", strokeWidth: 1 }} />
          </button>
        </div>
      )}
      <BottomNav currentPage="forum" />
      {dialogOpen.newTopic && (
        <DialogModal
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
          isLoading={isLoading}
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          showSnackbar={showSnackbar}
        />
      )}
      <TopBtn />
      <PositionedSnackbar setSnackbars={setSnackbars} snackbars={snackbars} />
    </div>
  );
};

export default Forum;
