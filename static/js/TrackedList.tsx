import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import ReplayIcon from "@mui/icons-material/Replay";
import CircularProgress from "@mui/material/CircularProgress";
import {
  FETCH_NOTIFICATIONS_TRACK_LIST_THUNK,
  FETCH_POST_NOTIFICATIONS_SERTRACK_THUNK,
} from "../../actions/memberAction";
import { CLEAR_MEMBER_LIST, LOAD_MEMBER_LIST } from "../../reducers/memberReducer";
import { Link } from "react-router-dom";
import { getDateDiffFromNow } from "../../utils/Function";

const TrackedList = (props: any) => {
  const { t, logined, showSnackbar } = props;
  const dispatch = useAppDispatch();
  const { trackedList, isLoading, isRefreshing } = useAppSelector((state) => state.member);
  const [page, setPage] = useState(1);
  const pageLimit = trackedList.list?.length > 0 ? Math.ceil(trackedList.total / 20) : 0;
  const hasNextPage = page <= pageLimit && pageLimit > 1;

  const loadList = (isLoadMore: boolean = false, isRefreshing: boolean = false, time: number = 0, page: number = 1) => {
    dispatch(LOAD_MEMBER_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    if (isRefreshing) {
      setPage(1);
      dispatch(CLEAR_MEMBER_LIST("trackedList"));
    }
    setTimeout(() => {
      dispatch(FETCH_NOTIFICATIONS_TRACK_LIST_THUNK(page));
    }, time);
  };

  useEffect(() => {
    if (logined && trackedList.list?.length === 0) loadList();
  }, [logined, trackedList.list?.length]);

  //   loadMore
  const handleLoadMore = (nextPage: number) => {
    setPage(nextPage);
    loadList(true, false, 1000, nextPage);
  };

  // Refresh
  const handleRefresh = () => {
    loadList(false, true, 1000);
  };

  const handleTracking = async (id: string) => {
    const result = await dispatch(FETCH_POST_NOTIFICATIONS_SERTRACK_THUNK(id)).unwrap();
    const { code, data } = result;
    if (code === 200) {
      showSnackbar(data, "success");
      handleRefresh();
    }
  };

  return (
    <>
      <div className="w-full bg-white text-bbk dark:bg-bbk dark:text-tgy">
        <div className="flex justify-between items-center px-6 h-20">
          <span className="font-bold text-gy">
            {t("member.track_total")}：{trackedList.list?.length || 0}&nbsp;/&nbsp;500
          </span>
          <span className="w-8">
            {isRefreshing || isLoading ? (
              <CircularProgress size={18} className="text-gy" />
            ) : (
              <ReplayIcon
                sx={{ color: "#ff6f00", fontSize: 24, stroke: "#ff6f00", strokeWidth: 1 }}
                onClick={handleRefresh}
              />
            )}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-6 p-3">
          {trackedList.list?.length > 0 &&
            trackedList.list.map((d: any) => (
              <div key={d.id} className="relative">
                {getDateDiffFromNow(Number(d.update_at)) <= 3 && (
                  <span className="absolute left-2 top-2 rounded-md bg-red-600 text-white py-1 px-2">
                    {t("library.update")}
                  </span>
                )}
                <span
                  className="absolute right-2 top-2 rounded-full bg-og text-white py-1 px-2"
                  onClick={() => handleTracking(d.id)}
                >
                  {t("member.unfollow")}
                </span>
                <Link to={`/comic/detail?id=${d.id}`}>
                  <img
                    src={d.image}
                    alt={d.id}
                    loading="lazy"
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.opacity = "1";
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/cover_default.jpg";
                    }}
                    className="object-cover rounded-md min-h-64"
                    style={{
                      opacity: "0",
                      transition: "opacity 0.5s ease-in-out",
                    }}
                  />
                  <p className="text-og truncate m-1">{d.name}</p>
                </Link>
              </div>
            ))}
        </div>

        <div className="flex flex-col justify-center items-center pb-48">
          {isLoading && <img src="/images/loading.gif" alt="loading" width="80px" />}
          {trackedList.list?.length > 0 &&
            (hasNextPage ? (
              <button
                onClick={() => handleLoadMore(page + 1)}
                className="w-11/12 rounded-sm text-white p-2 bg-og shadow-lg shadow-stone-700/50"
              >
                {t("comic.load_more")}
              </button>
            ) : (
              <p className="text-center mt-4">{t("comic.end_of_list")}</p>
            ))}
        </div>
      </div>
    </>
  );
};

export default TrackedList;
