import SendIcon from "@mui/icons-material/Send";
import { Popover } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { FETCH_FORUM_SEND_THUNK, FETCH_FORUM_THUNK } from "../../actions/forumAction";
import { CommonQData } from "../../assets/JsonData";
import NewTopicModal from "../../components/Modal/NewTopicModal";
import { useScrollToTop } from "../../Hooks";
import { CLEAR_FORUM_LIST, LOAD_FORUM_LIST } from "../../reducers/forumReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import ForumList from "../Forum/ForumList";

const NewTopic = (props: any) => {
  const { t, logined, setDialogOpen, dialogOpen, responds } = props;
  return (
    <div className="sticky bottom-0 bg-bbk h-20 flex items-center justify-center">
      <input
        type="text"
        maxLength={200}
        placeholder={t("forum.start_new_topic")}
        className="w-10/12 h-10 rounded p-2 outline-none dark:bg-bk"
        value={responds.newTopic}
        onChange={() => setDialogOpen({ ...dialogOpen, [logined ? "newTopic" : "login"]: true })}
        onClick={() => setDialogOpen({ ...dialogOpen, [logined ? "newTopic" : "login"]: true })}
      />
      <button className="rounded-full bg-og p-2 ml-2">
        <SendIcon sx={{ color: "white", fontSize: 18, stroke: "white", strokeWidth: 1 }} />
      </button>
    </div>
  );
};

const Comment = (props: any) => {
  const {
    t,
    logined,
    queryId,
    setting,
    memberInfo,
    dialogOpen,
    setDialogOpen,
    showSnackbar,
    bottomTopicInput,
    centerTopicInput,
  } = props;
  const commonQ = CommonQData();
  const rulesContent = commonQ[2].text_section[0].content.slice(0, 7);
  const { forumList, isLoading } = useAppSelector((state) => state.forum);
  const dispatch = useAppDispatch();
  const scrollToTop = useScrollToTop();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [page, setPage] = useState<number>(0);
  const [responds, setResponds] = useState({
    newTopic: "",
    spoilers: false,
    activeIndex: null,
    comment: "",
    comment_id: "",
    aid: queryId,
    recommendBN_input: "",
    recommendBN: [],
    recommendBN_empty: false,
    recommendBN_exceed: false,
  });

  const loadList = useCallback(
    (
      isLoadMore: boolean = false,
      isRefreshing: boolean = false,
      mode: string = "all",
      time: number = 0,
      page: number = 1,
      aid: string = queryId
    ) => {
      dispatch(LOAD_FORUM_LIST({ isLoading: true, isLoadMore, isRefreshing }));
      if (isRefreshing) {
        setPage(1);
        dispatch(CLEAR_FORUM_LIST("forumList"));
        sessionStorage.setItem("comicCommentsLoadMore", "1");
      }
      if (!isLoadMore) {
        scrollToTop();
      }
      setTimeout(() => {
        dispatch(FETCH_FORUM_THUNK({ mode, page, aid }));
      }, time);
    },
    [dispatch, queryId]
  );

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
        loadList(false, true);
      }
    }
  };

  useEffect(() => {
    if (queryId) {
      loadList(false, true);
      sessionStorage.setItem("forumFrom", "detail");
    }
  }, [queryId]);

  return (
    <>
      <div className="text-gy dark:bg-bk dark:text-tgy">
        <div className="bg-white flex justify-center text-bbk py-4 dark:text-tgy dark:bg-bbk">
          {commonQ[2].text_section[0].content[0].slice(0, 3)}
          <span>
            <button onClick={(e) => setAnchorEl(e.currentTarget as HTMLElement)} className="text-og font-bold p-0 ml-1">
              {commonQ[2].text_section[0].content[0].slice(3, 9)}
            </button>
          </span>
          {commonQ[2].text_section[0].content[0].slice(9, 30)}
        </div>
        {centerTopicInput && (
          <NewTopic t={t} logined={logined} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} responds={responds} />
        )}
        <>
          <ForumList
            t={t}
            logined={logined}
            setting={setting}
            memberInfo={memberInfo}
            list={forumList?.list}
            isLoading={isLoading}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            responds={responds}
            setResponds={setResponds}
            page={page}
            setPage={setPage}
            loadList={loadList}
            showSnackbar={showSnackbar}
            section="comic_comments"
            pageStorageKey="comicCommentsLoadMore"
          />
        </>
      </div>
      {bottomTopicInput && (
        <NewTopic t={t} logined={logined} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} responds={responds} />
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
      <NewTopicModal
        open={dialogOpen.newTopic}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        responds={responds}
        setResponds={setResponds}
        handleSendNewTopic={handleSendNewTopic}
        showSnackbar={showSnackbar}
        queryId={queryId}
      />
    </>
  );
};

export default Comment;
