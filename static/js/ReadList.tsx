import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import ComicList from "../Common/ComicList";
import { FETCH_GET_WATCH_LIST_THUNK } from "../../actions/memberAction";
import { CLEAR_MEMBER_LIST, LOAD_MEMBER_LIST } from "../../reducers/memberReducer";

const ReadList = (props: any) => {
  const { t, logined, setting, showSnackbar } = props;
  const dispatch = useAppDispatch();
  const { watchList, isLoading } = useAppSelector((state) => state.member);
  const [dialogOpen, setDialogOpen] = useState({ folder: false });
  const [page, setPage] = useState(1);
  const pageLimit = watchList.list?.length ? Math.ceil(watchList.total / 20) : 0;
  const hasNextPage = page <= pageLimit && pageLimit > 1;
  const [editFolder, setEditFolder] = useState({
    edit: false,
    type: "",
    folder_id: "",
    folder_name: "",
    aid: "",
    o: "mr",
    select: "",
    alert: false,
    confirm: false,
    message: "",
    tags_select: "",
  });

  const loadList = (isLoadMore: boolean = false, isRefreshing: boolean = false, time?: number, page?: number) => {
    dispatch(LOAD_MEMBER_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    if (isRefreshing) {
      dispatch(CLEAR_MEMBER_LIST("watchList"));
    }
    setTimeout(() => {
      dispatch(FETCH_GET_WATCH_LIST_THUNK(page || 1));
    }, time || 0);
  };

  useEffect(() => {
    if (logined && watchList.list?.length === 0) loadList();
  }, [logined, watchList.list?.length]);

  const handleLoadMore = () => {
    if (!hasNextPage) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadList(true, false, 1000, nextPage);
  };

  return (
    <>
      <div className="w-full bg-white text-bbk dark:bg-bbk dark:text-tgy">
        <div className="text-lg px-2 pt-4">
          <p>
            {t("member.total_watched")} <span>{watchList.list?.length || 0}</span> {t("member.this_comic")}
          </p>
        </div>
        <div className="flex flex-col justify-center items-center pb-48 ">
          {isLoading ? (
            <img src="/images/loading.gif" alt="loading" width="80px" />
          ) : (
            <>
              <ComicList
                t={t}
                cols={3}
                link={true}
                setting={setting}
                listName={"watchList"}
                list={watchList.list}
                comicTags={true}
                comicCheck={true}
                logined={logined}
                editFolder={editFolder}
                setEditFolder={setEditFolder}
                setDialogOpen={setDialogOpen}
                dialogOpen={dialogOpen}
                showSnackbar={showSnackbar}
              />
              {hasNextPage ? (
                <button onClick={handleLoadMore} className="w-11/12 bg-og rounded-sm text-white p-2">
                  {t("comic.load_more")}
                </button>
              ) : (
                <p className="text-center mt-10">{t("comic.end_of_list")}</p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ReadList;
