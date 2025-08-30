import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import ReplayIcon from "@mui/icons-material/Replay";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CheckIcon from "@mui/icons-material/Check";
import CircularProgress from "@mui/material/CircularProgress";
import { FETCH_TAGS_FAVORITE_LIST_THUNK, FETCH_TAGS_FAVORITE_UPDATE_THUNK } from "../../actions/memberAction";
import { CLEAR_MEMBER_LIST, LOAD_MEMBER_LIST } from "../../reducers/memberReducer";

const TagMarkList = (props: any) => {
  const { t, logined, showSnackbar } = props;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tagsList, isLoading, isRefreshing } = useAppSelector((state) => state.member);
  const [edit, setEdit] = useState<{ edit: boolean; select: any[] }>({ edit: false, select: [] });

  const loadList = (isLoadMore: boolean = false, isRefreshing: boolean = false) => {
    dispatch(LOAD_MEMBER_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    if (isRefreshing) {
      dispatch(CLEAR_MEMBER_LIST("tagsList"));
    }
    dispatch(FETCH_TAGS_FAVORITE_LIST_THUNK());
  };

  useEffect(() => {
    if (logined && tagsList.list?.length === 0) loadList();
  }, [logined, tagsList.list?.length]);

  // Refresh
  const handleRefresh = () => {
    loadList(false, true);
  };

  // delete tag
  const handleDelete = async () => {
    const result = await dispatch(
      FETCH_TAGS_FAVORITE_UPDATE_THUNK({ type: "remove", tags: edit.select.toString() })
    ).unwrap();
    if (result.code === 200) {
      const { status, msg } = result.data;
      const type = status !== "ok" ? "error" : "success";
      showSnackbar(msg, type);
      setEdit({ ...edit, edit: false, select: [] });
      loadList();
    }
  };

  return (
    <>
      <div className="w-full bg-white text-bbk dark:bg-bbk dark:text-tgy">
        <div className="flex justify-between items-end px-4 py-4 text-lg">
          {edit.edit ? (
            <>
              <p className="my-2">
                {t("member.selected")}&nbsp;<span className="font-black text-og text-2xl">{edit.select.length}</span>
                &nbsp;
                {t("member.items")}
              </p>
              <div className="my-2">
                <span onClick={handleDelete}>{t("member.delete")}</span>
                <span
                  className="text-og ml-4"
                  onClick={() => setEdit((prev) => ({ ...prev, edit: false, select: [] }))}
                >
                  {t("member.cancel")}
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl my-2">
                共&nbsp;<span className="font-black">{tagsList.list?.length || 0}／50</span>&nbsp;
                {t("member.tags")}
              </p>
              <div>
                <span className="w-8 mr-4">
                  {isRefreshing || isLoading ? (
                    <CircularProgress size={18} className="text-gy" />
                  ) : (
                    <ReplayIcon
                      sx={{ color: "#ff6f00", fontSize: 24, stroke: "#ff6f00", strokeWidth: 1 }}
                      onClick={handleRefresh}
                    />
                  )}
                </span>
                <EditNoteIcon
                  sx={{ color: "#ff6f00", fontSize: 28, stroke: "#ff6f00", strokeWidth: 1 }}
                  onClick={() => setEdit((prev) => ({ ...prev, edit: true }))}
                />
              </div>
            </>
          )}
        </div>
        {isLoading ? (
          <div className="w-full flex justify-center pb-40">
            <img src="/images/loading.gif" alt="loading" width="80px" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-11/12 mx-auto pb-48">
            {tagsList.list?.length > 0 &&
              tagsList.list.map((item: any, i: number) => (
                <div
                  key={item.tag + i}
                  className="flex items-center"
                  onClick={() => {
                    if (edit.edit) {
                      if (edit.select.includes(item.tag)) {
                        const filterItem = edit.select.filter((s: any) => s !== item.tag);
                        setEdit((prev) => ({ ...prev, select: filterItem }));
                      } else {
                        setEdit((prev) => ({ ...prev, select: [...prev.select, item.tag] }));
                      }
                    } else {
                      navigate(`/search?filter=${item.tag}`);
                    }
                  }}
                >
                  {edit.edit && (
                    <div className="pr-2">
                      <p className="border-2 border-solid border-og w-5 h-5 flex justify-center items-center overflow-hidden">
                        {edit.select.map(
                          (s: any) =>
                            s === item.tag && (
                              <CheckIcon
                                key={s}
                                sx={{ fontSize: 14, color: "#ff6f00", stroke: "#ff6f00", strokeWidth: 2 }}
                              />
                            )
                        )}
                      </p>
                    </div>
                  )}
                  <p
                    className={`text-center w-28 text-wrap border border-solid border-bk rounded-md p-1 mr-2 dark:border-white
                     ${
                       edit.edit && edit.select.find((d: any) => d === item.tag)
                         ? "bg-og text-white border-og dark:border-og"
                         : ""
                     }`}
                  >
                    #{item.tag}
                  </p>
                  <span className="text-sm">{item.updated_at}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TagMarkList;
