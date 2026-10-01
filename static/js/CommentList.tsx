import { useCallback, useEffect, useState } from "react";
import { FETCH_FORUM_THUNK } from "../../actions/forumAction";
import { useScrollToTop } from "../../Hooks";
import { CLEAR_FORUM_LIST, LOAD_FORUM_LIST } from "../../reducers/forumReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import ForumList from "../Forum/ForumList";

const CommentList = (props: any) => {
  const { t, memberInfo, logined, setting, showSnackbar } = props;
  const dispatch = useAppDispatch();
  const scrollToTop = useScrollToTop();
  const { forumList, isLoading } = useAppSelector((state) => state.forum);
  const [page, setPage] = useState(() => Number(sessionStorage.getItem("memberCommentsLoadMore")) || 1);
  const [dialogOpen, setDialogOpen] = useState({ newTopic: false, folder: false });
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
  const forumFrom = sessionStorage.getItem("forumFrom");

  const loadList = useCallback(
    (
      isLoadMore: boolean = false,
      isRefreshing: boolean = false,
      _mode: string = "all",
      time: number = 0,
      page: number = 1
    ) => {
      dispatch(LOAD_FORUM_LIST({ isLoading: true, isLoadMore, isRefreshing }));
      if (isRefreshing) {
        setPage(1);
        dispatch(CLEAR_FORUM_LIST("forumList"));
        sessionStorage.setItem("memberCommentsLoadMore", "1");
      }
      if (!isLoadMore) {
        scrollToTop();
      }
      setTimeout(() => {
        dispatch(FETCH_FORUM_THUNK({ uid: memberInfo.uid, page }));
      }, time);
      sessionStorage.setItem("forumFrom", "member");
    },
    [dispatch, memberInfo.uid]
  );

  useEffect(() => {
    if (!logined) return;

    if ((logined && !forumList.list?.length) || forumFrom !== "member") {
      loadList(false, true);
    }
  }, [logined]);

  return (
    <>
      <div className="w-full text-bbk pb-48 pt-4 dark:text-tgy">
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
          showReplySection={false}
          section="member_comments"
          page={page}
          setPage={setPage}
          pageStorageKey="memberCommentsLoadMore"
          loadList={loadList}
          showSnackbar={showSnackbar}
        />
      </div>
    </>
  );
};

export default CommentList;
