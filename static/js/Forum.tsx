import SendIcon from "@mui/icons-material/Send";
import { Popover } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { useLocation } from "react-router-dom";
import { FETCH_FORUM_SEND_THUNK, FETCH_FORUM_THUNK } from "../../actions/forumAction";
import { CommonQData } from "../../assets/JsonData";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import Header from "../../components/Common/Header";
import Loading from "../../components/Common/Loading";
import TopBtn from "../../components/Common/TopBtn";
import ForumList from "../../components/Forum/ForumList";
import BottomNav from "../../components/Main/BottomNav";
import MemberModal from "../../components/Modal/MemberModal";
import NewTopicModal from "../../components/Modal/NewTopicModal";
import { useGlobalConfig } from "../../GlobalContext";
import { useScrollToTop } from "../../Hooks";
import { CLEAR_FORUM_LIST, LOAD_FORUM_LIST } from "../../reducers/forumReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { renderText } from "../../utils/Function";
import { defaultUserFormData } from "../../utils/InterFace";

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
  const [responds, setResponds] = useState({
    newTopic: "",
    spoilers: false,
    activeIndex: null,
    comment: "",
    comment_id: "",
    aid: "",
    recommendBN_input: "",
    recommendBN: [],
    recommendBN_empty: false,
    recommendBN_exceed: false,
  });
  const dispatch = useAppDispatch();
  const { forumList, isLoading, isRefreshing } = useAppSelector((state) => state.forum);
  const [formData, setFormData] = useState(defaultUserFormData);
  const searchParams = new URLSearchParams(location.search);
  const [mode, setMode] = useState(() => {
    const stored = sessionStorage.getItem("forumTab");
    return stored !== null ? stored : "all";
  });
  const [tabChange, setTabChange] = useState(false);
  const [page, setPage] = useState(() => Number(sessionStorage.getItem("forumLoadMore")) || 1);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const forumFrom = sessionStorage.getItem("forumFrom");

  const loadList = useCallback(
    (
      isLoadMore: boolean = false,
      isRefreshing: boolean = false,
      mode: string = "all",
      time: number = 0,
      page: number = 1
    ) => {
      dispatch(LOAD_FORUM_LIST({ isLoading: true, isLoadMore, isRefreshing }));
      if (isRefreshing) {
        setPage(1);
        sessionStorage.setItem("forumLoadMore", "1");
        dispatch(CLEAR_FORUM_LIST("forumList"));
      }
      if (!isLoadMore) {
        scrollToTop();
      }
      setTimeout(() => {
        dispatch(FETCH_FORUM_THUNK({ mode, page }));
      }, time);
      setTabChange(false);
    },
    [dispatch, mode]
  );

  useEffect(() => {
    if (!forumList.list?.length || tabChange || forumFrom !== "forum") {
      loadList(false, false, mode);
      setPage(1);
      sessionStorage.setItem("forumLoadMore", "1");
      sessionStorage.setItem("forumTab", String(mode));
      sessionStorage.setItem("forumFrom", "forum");
    }

    sessionStorage.setItem("fromPage", `${location.pathname}?mode=${mode}`);
  }, [forumList.list?.length, tabChange, forumFrom]);

  const handleRefresh = () => {
    loadList(false, true, mode);
  };

  // newTopic
  const handleSendNewTopic = async () => {
    const { newTopic, aid } = responds;
    if (dialogOpen.newTopic && newTopic !== "") {
      const result = await dispatch(FETCH_FORUM_SEND_THUNK({ comment: newTopic, aid })).unwrap();
      if (result.code === 200) {
        const { msg, status } = result.data;
        const type = status !== "ok" ? "error" : "success";
        showSnackbar(msg, type);
        setResponds((prev: any) => ({ ...prev, newTopic: "", aid: "" }));
        setDialogOpen({ ...dialogOpen, newTopic: false });
        handleRefresh();
      }
    }
  };

  return (
    <div className="h-full dark:bg-bk">
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
          <div className="text-bbk mt-3 pb-40 dark:text-tgy">
            {mode === "chat" && (
              <div className="bg-white flex justify-center text-bbk mx-3 py-4 dark:text-tgy dark:bg-bbk">
                {commonQ[2].text_section[0].content[0].slice(0, 3)}
                <span>
                  <button
                    onClick={(e) => setAnchorEl(e.currentTarget as HTMLElement)}
                    className="text-og font-bold p-0 ml-1"
                  >
                    {commonQ[2].text_section[0].content[0].slice(3, 9)}
                  </button>
                </span>
                {commonQ[2].text_section[0].content[0].slice(9, 30)}
              </div>
            )}
            <ForumList
              t={t}
              setting={setting}
              logined={logined}
              memberInfo={memberInfo}
              list={forumList.list}
              isLoading={isLoading}
              setDialogOpen={setDialogOpen}
              dialogOpen={dialogOpen}
              responds={responds}
              setResponds={setResponds}
              page={page}
              setPage={setPage}
              loadList={loadList}
              showSnackbar={showSnackbar}
              section="forum"
              pageStorageKey="forumLoadMore"
              mode={mode}
            />
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
      {/*rules modal  */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div className="p-3 text-gy dark:text-[#bbb] dark:bg-nbk">
          <p className="border-b py-2"> {commonQ[3].text_section[0].content[0].slice(3, 9)}</p>
          <div className="py-2">
            {rulesContent.slice(1, 10).map((d: any) => (
              <p key={d}>{d}</p>
            ))}
          </div>
        </div>
      </Popover>
      <BottomNav currentPage="forum" />
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
      <NewTopicModal
        open={dialogOpen.newTopic}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        responds={responds}
        setResponds={setResponds}
        handleSendNewTopic={handleSendNewTopic}
        showSnackbar={showSnackbar}
        queryId=""
      />
      <TopBtn />
      <PositionedSnackbar setSnackbars={setSnackbars} snackbars={snackbars} />
    </div>
  );
};

export default Forum;
