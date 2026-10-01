import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ReplayIcon from "@mui/icons-material/Replay";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import {
  FETCH_ADD_NOVEL_FAVORITES_THUNK,
  FETCH_ADD_NOVEL_LIKE_THUNK,
  FETCH_EDIT_NOVEL_FAVORITES_THUNK,
  FETCH_NOVEL_FAVORITES_LIST_THUNK,
} from "../../actions/novelAction";
import { useGlobalConfig } from "../../GlobalContext";
import { useScrollToTop } from "../../Hooks";
import { CLEAR_NOVEL_LIST, LOAD_NOVEL_LIST } from "../../reducers/novelReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { defaultEditInitialState } from "../../utils/InterFace";
import { Alert } from "../Alert/Alert";
import ClickPagination from "../Common/ClickPagination";
import FolderModal from "../Modal/FolderModal";
import NovelMemberList from "../Novels/NovelMemberList";

const NovelMarkList = (props: any) => {
  const { t, setting, logined, showSnackbar } = props;
  const dispatch = useAppDispatch();
  const scrollToTop = useScrollToTop();
  const { config } = useGlobalConfig();
  const { paginationMode } = config;
  const { novelFavoritesList, isLoading, isRefreshing } = useAppSelector((state) => state.novel);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState({ login: false, alert: false, folder: false });
  const [markLoading, setMarkLoading] = useState(false);
  const [favoriteSave, setFavoriteSave] = useState<{ like: string[]; mark: string[] }>(() => {
    const storedLikes = JSON.parse(localStorage.getItem("novelLikeItems") || "[]");
    const storedMarks = JSON.parse(localStorage.getItem("novelMarkItems") || "[]");
    return { like: storedLikes, mark: storedMarks };
  });
  const [editFolder, setEditFolder] = useState(defaultEditInitialState);
  const [page, setPage] = useState(() => Number(sessionStorage.getItem("novelFavoriteLoadMore")) || 1);
  const pageLimit = novelFavoritesList.total ? Math.ceil(novelFavoritesList.total / 20) : 1;
  const hasNextPage = page < pageLimit && pageLimit > 1;

  // GetList
  const loadList = (
    isLoadMore: boolean = false,
    isRefreshing: boolean = false,
    time: number = 0,
    page: number = 1,
    folder_id: string = "",
    o: string = "mr"
  ) => {
    if (isRefreshing) {
      setPage(1);
      dispatch(CLEAR_NOVEL_LIST("novelFavoritesList"));
    }
    if (!isLoadMore) {
      scrollToTop();
    }
    dispatch(LOAD_NOVEL_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    setTimeout(() => {
      dispatch(FETCH_NOVEL_FAVORITES_LIST_THUNK({ page, folder_id, o }));
    }, time);
  };

  useEffect(() => {
    if (logined && !novelFavoritesList.list?.length) loadList();
  }, [logined, novelFavoritesList.list?.length]);

  // Refresh
  const handleRefresh = () => {
    loadList(false, true, 1000, 1);
  };

  // 漫畫長按刪除
  // const handleOpenDelWatchComicAlert = (aid: string) => {
  //   if (window.location.pathname.includes("member")) {
  //     movedRef.current = false;
  //     timerRef.current = setTimeout(() => {
  //       setEditFolder({
  //         ...editFolder,
  //         edit: true,
  //         type: "del_watch_history",
  //         alert: true,
  //         message: t("snack.confirm_delete"),
  //         aid,
  //       });
  //     }, 500);
  //   }
  // };

  const handleDelWatchComic = async () => {
    if (editFolder.type === "del_watch_history" && editFolder.aid !== "") {
      // const result = await dispatch(FETCH_WATCH_LIST_THUNK(editFolder.aid)).unwrap();
      // const { status, msg } = result;
      // const statusType = status !== 1 ? "error" : "success";
      // showSnackbar(msg, statusType);
      // setEditFolder((prev: any) => ({ ...prev, ...defaultEditInitialState }));
      // dispatch(FETCH_GET_WATCH_LIST_THUNK(1));
    }
  };

  const handleLoadMore = (nextPage: number) => {
    if (!hasNextPage) return;
    setPage(nextPage);
    sessionStorage.setItem("novelFavoriteLoadMore", String(nextPage));
    const { folder_id, o } = editFolder;
    loadList(true, false, 1000, nextPage, folder_id, o);
  };

  // click pagination
  const goToPage = (value: number) => {
    const targetPage = Math.min(Math.max(value, 1), pageLimit);
    setPage(targetPage);
    sessionStorage.setItem("novelFavoriteLoadMore", String(targetPage));
    const { folder_id, o } = editFolder;
    loadList(false, false, 0, targetPage, folder_id, o);
  };

  // like && mark
  const toggleItem = (type: "like" | "mark", id: string) => {
    setFavoriteSave((prevState) => {
      let updatedList: string[];

      if (type === "mark") {
        updatedList = prevState[type].includes(id)
          ? prevState[type].filter((item) => item !== id)
          : [...prevState[type], id];
      } else {
        updatedList = prevState[type].includes(id) ? prevState[type] : [...prevState[type], id];
      }
      localStorage.setItem(`novel${type.charAt(0).toUpperCase() + type.slice(1)}Items`, JSON.stringify(updatedList));

      return { ...prevState, [type]: updatedList };
    });
  };

  const handleEngagementAction = async (type: string, id: string) => {
    if (type === "like") {
      if (favoriteSave.like.includes(id)) {
        showSnackbar(t("snack.already_rated"), "success");
        return;
      }
      toggleItem("like", id);
      const result = await dispatch(FETCH_ADD_NOVEL_LIKE_THUNK({ id })).unwrap();
      const { code, msg, status } = result;
      const msgType = status !== "success" ? "error" : "success";
      if (code === 200) {
        showSnackbar(msg, msgType);
      }
    }
    if (type === "mark") {
      if (!logined) {
        showSnackbar(t("login.please_login"), "error");
        setDialogOpen({ ...dialogOpen, login: true });
      } else {
        setMarkLoading(true);
        handleFindFolder();
        toggleItem("mark", id);
        const result = await dispatch(FETCH_ADD_NOVEL_FAVORITES_THUNK({ nid: id })).unwrap();
        const { status, msg, type } = result;
        const msgType = status !== "ok" ? "error" : "success";
        if (status === "ok") {
          switch (type) {
            case "add":
            case "edit":
            case "move":
              setEditFolder((prev: any) => ({ ...prev, aid: id, alert: false }));
              setDialogOpen({ ...dialogOpen, folder: true });
              break;
            case "remove":
              setEditFolder((prev: any) => ({ ...prev, ...defaultEditInitialState }));
              break;
          }
        }
        // setMarkLoading(false);
        showSnackbar(msg, msgType);
      }
    }
  };

  // GetFolderList
  const handleFindFolder = async () => {
    dispatch(CLEAR_NOVEL_LIST("novelFavoritesList"));
    await dispatch(FETCH_NOVEL_FAVORITES_LIST_THUNK({ page: 1, folder_id: "", o: "" })).unwrap();
  };

  // EditFolder
  // type === add / edit / move / del
  const handleEditFolder = async (type: string) => {
    setMarkLoading(true);
    if (type === "del") {
      setDialogOpen({ ...dialogOpen, alert: true });
    }
    const { folder_id, folder_name, aid } = editFolder;
    if (folder_name !== "") {
      const result = await dispatch(
        FETCH_EDIT_NOVEL_FAVORITES_THUNK({ type, folder_id, folder_name, nid: aid })
      ).unwrap();
      const { status, msg } = result;
      const statusType = status !== "ok" ? "error" : "success";
      if (status && msg) {
        showSnackbar(msg, statusType);
      }
    } else {
      showSnackbar(t("comic.added_to_favorites_success"), "success");
    }
    // setMarkLoading(false);
    setEditFolder((prev: any) => ({ ...prev, ...defaultEditInitialState }));
  };

  // console.log(editFolder, "editFolder");

  return (
    <>
      <div className="w-full bg-white text-bbk dark:bg-bbk dark:text-tgy">
        <div className="flex justify-between items-center px-6 h-20">
          {editFolder.edit ? (
            <div className="w-4/10"></div>
          ) : (
            <div className="w-4/10">
              <Button
                id="fade-button"
                aria-controls={Boolean(anchorEl) ? "fade-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? "true" : undefined}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ color: "#aaa", fontSize: 15, paddingLeft: 0 }}
              >
                <span className="pr-10">{editFolder.folder_name || "全部"}</span>
                <ArrowDropDownIcon sx={{ color: "#ff6f00", fontSize: 24 }} />
              </Button>
              <Menu
                id="fade-menu"
                MenuListProps={{
                  "aria-labelledby": "fade-button",
                }}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                TransitionComponent={Fade}
                sx={(theme) => ({
                  "& .MuiPaper-root": {
                    marginTop: theme.spacing(0),
                    marginLeft: theme.spacing(-2),
                    width: "30%",
                    color: "#757575",
                  },
                })}
              >
                <MenuItem
                  onClick={() => {
                    setEditFolder({ ...editFolder, folder_name: "" });
                    loadList(false, false, 100, page, "", editFolder.o);
                    setAnchorEl(null);
                  }}
                >
                  全部
                </MenuItem>
                {novelFavoritesList.folder_list?.length > 0 &&
                  novelFavoritesList.folder_list.map((d: any, i: number) => (
                    <MenuItem
                      key={d.FID}
                      onClick={() => {
                        loadList(false, false, 100, page, d.FID, editFolder.o);
                        setEditFolder({ ...editFolder, folder_id: d.FID, folder_name: d.name });
                        setAnchorEl(null);
                      }}
                    >
                      {d.name}
                    </MenuItem>
                  ))}
              </Menu>
            </div>
          )}
          {editFolder.edit ? (
            editFolder.folder_name ? (
              <div className="w-8/12 flex justify-between items-center">
                <span
                  onClick={() => {
                    setDialogOpen({ ...dialogOpen, folder: true });
                    setEditFolder({ ...editFolder, type: "edit" });
                  }}
                >
                  {t("member.rename")}
                </span>
                <span
                  onClick={() =>
                    setEditFolder({ ...editFolder, type: "del", alert: true, message: t("snack.confirm_delete") })
                  }
                >
                  {t("member.delete_folder")}
                </span>
                <span
                  onClick={() => {
                    setDialogOpen({ ...dialogOpen, folder: true });
                    setEditFolder({ ...editFolder, type: "move" });
                  }}
                >
                  {t("member.move")}
                </span>
                <DeleteIcon
                  onClick={() => {
                    setEditFolder({
                      ...editFolder,
                      type: "del_comic",
                      alert: true,
                      message: t("snack.confirm_delete"),
                    });
                  }}
                />
                <span onClick={() => setEditFolder({ ...editFolder, edit: false, aid: "" })}>{t("member.cancel")}</span>
              </div>
            ) : (
              <div className="w-7/12 flex justify-between items-center">
                <span
                  onClick={() => {
                    setDialogOpen({ ...dialogOpen, folder: true });
                    setEditFolder({ ...editFolder, type: "add" });
                  }}
                >
                  {t("member.add_folder")}
                </span>
                <span
                  onClick={() => {
                    setDialogOpen({ ...dialogOpen, folder: true });
                    setEditFolder({ ...editFolder, type: "move" });
                  }}
                >
                  {t("member.add_to_folder")}
                </span>
                <span onClick={() => setEditFolder({ ...editFolder, edit: false })}>{t("member.cancel")}</span>
              </div>
            )
          ) : (
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
                onClick={() => setEditFolder({ ...editFolder, edit: true })}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end items-center text-lg px-2">
          {t("cat_sort.sort_by")}：
          <span
            className={`${editFolder.o === "mr" ? "text-og" : ""}`}
            onClick={() => {
              loadList(false, false, 100, page, editFolder.folder_id, "mr");
              setEditFolder({ ...editFolder, o: "mr" });
            }}
          >
            {t("member.favorite_time")}
          </span>
          ｜
          <span
            className={`${editFolder.o === "mp" ? "text-og" : ""}`}
            onClick={() => {
              loadList(false, false, 100, page, editFolder.folder_id, "mp");
              setEditFolder({ ...editFolder, o: "mp" });
            }}
          >
            {t("member.update_time")}
          </span>
        </div>
        <NovelMemberList
          t={t}
          cols={2}
          link={true}
          setting={setting}
          listName={"favoriteList"}
          list={novelFavoritesList.list}
          comicTags={true}
          comicCheck={true}
          logined={logined}
          editFolder={editFolder}
          setEditFolder={setEditFolder}
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          showSnackbar={showSnackbar}
          handleEngagementAction={handleEngagementAction}
          favoriteList={novelFavoritesList}
          handleEditFolder={handleEditFolder}
          favoriteSave={favoriteSave}
        />
        <div className="flex flex-col justify-center items-center pb-48">
          {isLoading && <img src="/images/loading.gif" alt="loading" width="80px" />}
          {novelFavoritesList.list?.length > 0 &&
            (paginationMode === "click" ? (
              <ClickPagination pageLimit={pageLimit} page={page} onChange={goToPage} loading={isLoading} />
            ) : hasNextPage ? (
              <button
                onClick={() => handleLoadMore(page + 1)}
                className="w-11/12 rounded-sm text-white p-2 bg-og shadow-lg shadow-stone-700/50"
              >
                {t("comic.load_more")}
              </button>
            ) : (
              <p className="text-center mt-10">{t("comic.end_of_list")}</p>
            ))}
        </div>
      </div>
      {dialogOpen.folder && (
        <FolderModal
          folderList={novelFavoritesList.folder_list}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          editFolder={editFolder}
          setEditFolder={setEditFolder}
          handleEditFolder={handleEditFolder}
          tagsList={[]}
        />
      )}
      {editFolder.alert && (
        <Alert
          setEdit={setEditFolder}
          edit={editFolder}
          handleEdit={handleEditFolder}
          handleAction={handleEngagementAction}
          handleDelWatchComic={handleDelWatchComic}
          showSnackbar={showSnackbar}
        />
      )}
    </>
  );
};

export default NovelMarkList;
