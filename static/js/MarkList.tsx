import { useEffect, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ReplayIcon from "@mui/icons-material/Replay";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Fade from "@mui/material/Fade";
import CircularProgress from "@mui/material/CircularProgress";
import ComicList from "../Common/ComicList";
import { FETCH_FAVORITE_LIST_THUNK } from "../../actions/memberAction";
import { CLEAR_MEMBER_LIST, LOAD_MEMBER_LIST } from "../../reducers/memberReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const MarkList = (props: any) => {
  const { t, setting, logined, showSnackbar } = props;
  const dispatch = useAppDispatch();
  const { editResult, favoriteList, isLoading, isRefreshing } = useAppSelector((state) => state.member);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState({ folder: false });
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
  const [page, setPage] = useState(1);
  const pageLimit = favoriteList.list?.length ? Math.ceil(favoriteList.total / 20) : 0;
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
      dispatch(CLEAR_MEMBER_LIST("favoriteList"));
    }
    dispatch(LOAD_MEMBER_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    setTimeout(() => {
      dispatch(FETCH_FAVORITE_LIST_THUNK({ page, folder_id, o }));
    }, time);
  };

  useEffect(() => {
    if (logined && favoriteList.list?.length === 0) loadList();
  }, [logined, favoriteList.list?.length]);

  // Refresh
  const handleRefresh = () => {
    loadList(false, true, 1000, 1);
  };

  const handleLoadMore = (nextPage: number) => {
    if (!hasNextPage) return;
    setPage(nextPage);
    const { folder_id, o } = editFolder;
    loadList(true, false, 1000, nextPage, folder_id, o);
  };

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
                {favoriteList.folder_list?.length > 0 &&
                  favoriteList.folder_list.map((d: any, i: number) => (
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
              <div className="w-6/12 flex justify-between items-center">
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
        <div className="flex flex-col justify-center items-center pb-48">
          <ComicList
            t={t}
            cols={3}
            link={true}
            setting={setting}
            listName={"favoriteList"}
            list={favoriteList.list}
            comicTags={true}
            comicCheck={true}
            logined={logined}
            editFolder={editFolder}
            setEditFolder={setEditFolder}
            setDialogOpen={setDialogOpen}
            dialogOpen={dialogOpen}
            showSnackbar={showSnackbar}
          />
          {isLoading && <img src="/images/loading.gif" alt="loading" width="80px" />}
          {favoriteList.list?.length > 0 &&
            (hasNextPage ? (
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
    </>
  );
};

export default MarkList;
