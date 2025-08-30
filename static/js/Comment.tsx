import { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useInView } from "react-intersection-observer";
import SendIcon from "@mui/icons-material/Send";
import ForumList from "../Forum/ForumList";
import DialogModal from "../../components/Modal/DialogModal";
import { FETCH_FORUM_THUNK, FETCH_FORUM_SEND_THUNK } from "../../actions/forumAction";
import { CLEAR_FORUM_LIST, LOAD_FORUM_LIST } from "../../reducers/forumReducer";
import { CommonQData } from "../../assets/JsonData";

const NewTopic = (props: any) => {
  const { t, logined, setDialogOpen, dialogOpen, responds } = props;
  return (
    <div className="sticky bottom-0 bg-bbk h-20 flex items-center justify-center mt-10">
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
  const { t, logined, queryId, setting, dialogOpen, setDialogOpen, showSnackbar, bottomTopicInput, centerTopicInput } =
    props;
  const commonQ = CommonQData();
  const rulesContent = commonQ[2].text_section[0].content.slice(0, 7);
  const { forumList, isLoading } = useAppSelector((state) => state.forum);
  const dispatch = useAppDispatch();
  const [responds, setResponds] = useState({ newTopic: "", spoilers: false, reply: "", activeIndex: null });
  const { ref, inView } = useInView();
  const [page, setPage] = useState<number>(0);
  const pageLimit = forumList.list?.length ? Math.ceil(forumList.total / 10) : 0;
  const hasNextPage = page <= pageLimit;

  const loadList = (
    isLoadMore: boolean = false,
    isRefreshing: boolean = false,
    time: number = 0,
    mode: string = "all",
    page: number = 1,
    aid: string = queryId
  ) => {
    dispatch(LOAD_FORUM_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    if (!isLoadMore) {
      dispatch(CLEAR_FORUM_LIST("forumList"));
      setPage(1);
    }
    setTimeout(() => {
      dispatch(FETCH_FORUM_THUNK({ mode, page, aid }));
    }, time);
  };

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

  useEffect(() => {
    if (queryId) {
      loadList();
      sessionStorage.setItem("forumFrom", "detail");
    }
  }, [queryId]);

  // load more
  const loadMore = useCallback(() => {
    if (!inView || !hasNextPage) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadList(true, false, 1000, "all", nextPage);
  }, [inView, hasNextPage]);

  useEffect(() => {
    loadMore();
  }, [inView]);

  return (
    <>
      <div className="text-gy dark:text-tgy">
        <div className="p-3 text-bbk dark:text-tgy">
          {rulesContent.map((d: any) => (
            <p key={d}>{d}</p>
          ))}
        </div>
        {centerTopicInput && (
          <NewTopic t={t} logined={logined} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} responds={responds} />
        )}
        <>
          <ForumList
            t={t}
            logined={logined}
            setting={setting}
            list={forumList?.list}
            isLoading={isLoading}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            responds={responds}
            setResponds={setResponds}
            handleSendRespond={handleSendRespond}
            showReplySection={true}
            hasNextPage={hasNextPage}
          />
          {forumList?.list?.length > 0 && (
            <button ref={ref} onClick={loadMore} className="w-full flex justify-center pb-40"></button>
          )}
        </>
      </div>
      {bottomTopicInput && (
        <NewTopic t={t} logined={logined} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} responds={responds} />
      )}
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
    </>
  );
};

export default Comment;
