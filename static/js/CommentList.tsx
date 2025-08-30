import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import ForumList from "../Forum/ForumList";
import { FETCH_FORUM_THUNK, FETCH_FORUM_SEND_THUNK } from "../../actions/forumAction";
import { CLEAR_FORUM_LIST, LOAD_FORUM_LIST, RESET_FORUM_STATE } from "../../reducers/forumReducer";

const CommentList = (props: any) => {
  const { t, memberInfo, logined, setting, showSnackbar } = props;
  const dispatch = useAppDispatch();
  const { forumList, isLoading } = useAppSelector((state) => state.forum);
  const [page, setPage] = useState(1);
  const pageLimit = forumList.list?.length > 0 ? Math.ceil(forumList.total / 10) : 10;
  const hasNextPage = page <= pageLimit && pageLimit > 1;
  const [dialogOpen, setDialogOpen] = useState({ newTopic: false, folder: false });
  const [responds, setResponds] = useState({ newTopic: "", spoilers: false, reply: "", activeIndex: null });
  const forumFrom = sessionStorage.getItem("forumFrom");

  useEffect(() => {
    if (!logined) return;

    if ((logined && forumList.list?.length === 0) || (page !== 1 && hasNextPage) || forumFrom !== "member") {
      dispatch(CLEAR_FORUM_LIST("forumList"));
      dispatch(FETCH_FORUM_THUNK({ uid: memberInfo.uid, page: page }));
      sessionStorage.setItem("forumFrom", "member");
    }
  }, [dispatch, logined, forumList.list?.length, page, forumFrom]);

  const handleSendRespond = async (comment: string, aid: string, comment_id?: string) => {
    let result: Record<string, any> = {};
    if (dialogOpen.newTopic && responds.newTopic !== "") {
      result = await dispatch(FETCH_FORUM_SEND_THUNK({ comment, aid })).unwrap();
    } else if (responds.reply !== "" && comment_id !== "") {
      result = await dispatch(FETCH_FORUM_SEND_THUNK({ comment, aid, comment_id })).unwrap();
    }
    setResponds((prev: any) => ({ ...prev, reply: "", newTopic: "" }));
    if (result.code === 200) {
      const { msg, status } = result.data;
      const type = status !== "ok" ? "error" : "success";
      showSnackbar(msg, type);
    }
  };

  return (
    <>
      <div className="w-full text-bbk pb-48 pt-4 dark:text-tgy">
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
          showReplySection={false}
          hasNextPage={hasNextPage}
        />
        <div className="flex justify-center mt-10">
          {forumList.list?.length > 0 ? (
            hasNextPage ? (
              <button onClick={() => setPage(page + 1)} className="w-11/12 bg-og rounded-sm text-white p-2">
                {t("comic.load_more")}
              </button>
            ) : (
              <p>{t("comic.end_of_list")}</p>
            )
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default CommentList;
