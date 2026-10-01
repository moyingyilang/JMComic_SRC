import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FETCH_ADD_NOVEL_FAVORITES_THUNK,
  FETCH_ADD_NOVEL_LIKE_THUNK,
  FETCH_EDIT_NOVEL_FAVORITES_THUNK,
  FETCH_NOVEL_FAVORITES_LIST_THUNK,
  FETCH_NOVEL_LIST_THUNK,
  FETCH_NOVEL_SEARCH_THUNK,
} from "../../actions/novelAction";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import Header from "../../components/Common/Header";
import Loading from "../../components/Common/Loading";
import TopBtn from "../../components/Common/TopBtn";
import BottomNav from "../../components/Main/BottomNav";
import FolderModal from "../../components/Modal/FolderModal";
import MemberModal from "../../components/Modal/MemberModal";
import NovelList from "../../components/Novels/NovelList";
import { useGlobalConfig } from "../../GlobalContext";
import { useScrollToTop } from "../../Hooks";
import { CLEAR_NOVEL_LIST, LOAD_NOVEL_LIST } from "../../reducers/novelReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { defaultEditInitialState, defaultUserFormData } from "../../utils/InterFace";

const Novel = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined, darkMode, ads } = config;
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const scrollToTop = useScrollToTop();
  const dispatch = useAppDispatch();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const { novelList, novelSearchList, novelFavoritesList, isLoading } = useAppSelector((state) => state.novel);
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get("filter") ?? "";
  const searchInitialState = { start: false, query: "", o: "mr", t: "a" };
  const [searchConfig, setSearchConfig] = useState(searchInitialState);
  const [editFolder, setEditFolder] = useState(defaultEditInitialState);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [markLoading, setMarkLoading] = useState(false);
  const novelSearchQuery = sessionStorage.getItem("novelSearchQuery") || "";
  const [favoriteSave, setFavoriteSave] = useState<{ like: string[]; mark: string[] }>(() => {
    const storedLikes = JSON.parse(localStorage.getItem("novelLikeItems") || "[]");
    const storedMarks = JSON.parse(localStorage.getItem("novelMarkItems") || "[]");
    return { like: storedLikes, mark: storedMarks };
  });
  const [formData, setFormData] = useState(defaultUserFormData);
  const [dialogOpen, setDialogOpen] = useState({
    login: false,
    signUp: false,
    forgot: false,
    folder: false,
    textFields: false,
    alert: false,
  });

  const sortData = [
    { title: "全部", key: "", date: "a" },
    { title: "時間 今天", key: "", date: "t" },
    { title: "時間 這週", key: "", date: "w" },
    { title: "時間 本月", key: "", date: "m" },
    { title: "最新", key: "mr", date: "" },
    { title: "最多點閱", key: "mv", date: "" },
    { title: "最多章節", key: "mp", date: "" },
    { title: "最多愛心", key: "tf", date: "" },
  ];

  const fetchNovelList = async (load: boolean = true, o: string = searchConfig.o, t: string = searchConfig.t) => {
    if (load) {
      dispatch(FETCH_NOVEL_LIST_THUNK({ o, t }));
    }
    setSearchConfig((prev: any) => ({ ...prev, o, t, start: false, query: "" }));
    navigate(`/novels?filter=`);
    sessionStorage.setItem("novelSearchQuery", "");
  };

  useEffect(() => {
    if (novelList.list?.length === 0) {
      scrollToTop();
      fetchNovelList();
    }
  }, [novelList.list?.length]);

  useEffect(() => {
    if (filter !== novelSearchQuery) {
      handleSearchClick(filter);
    } else if (filter !== "") {
      setSearchConfig((prev: any) => ({ ...prev, query: filter, start: true }));
    }
  }, []);

  // search input
  const handleSearchClick = (search_query: string) => {
    setSearchConfig((prev: any) => ({ ...prev, query: search_query, start: true }));
    dispatch(LOAD_NOVEL_LIST({ isLoading: true }));
    dispatch(FETCH_NOVEL_SEARCH_THUNK({ search_query }));
    navigate(`/novels?filter=${search_query}`);
    sessionStorage.setItem("novelSearchQuery", search_query);
  };

  // GetFolderList
  const handleFindFolder = async () => {
    dispatch(CLEAR_NOVEL_LIST("novelFavoritesList"));
    await dispatch(FETCH_NOVEL_FAVORITES_LIST_THUNK({ page: 1, folder_id: "", o: "" })).unwrap();
  };

  // like && mark
  // like && mark
  const toggleItem = (id: string, type: "like" | "mark") => {
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
      toggleItem(id, "like");
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
        toggleItem(id, "mark");
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

  return (
    <div className="h-full dark:bg-bbk pb-40">
      {isLoading && <Loading />}
      <Header />
      <div className="flex justify-between items-center bg-defaultBg py-1 px-2 mt-4 dark:bg-bbk">
        <p className="text-2xl">{searchConfig.start ? "搜尋結果" : "小說"}</p>
        <Button
          className="w-2/6 flex justify-center items-center bg-[#ddd] text-base text-gy dark:bg-nbk"
          id="demo-customized-button"
          aria-controls={Boolean(anchorEl) ? "demo-customized-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={Boolean(anchorEl) ? "true" : undefined}
          variant="contained"
          disableElevation
          onClick={(event) => setAnchorEl(event.currentTarget)}
          endIcon={<ArrowDropDownIcon className="text-og text-3xl" />}
        >
          {/* {selected.episode} */}
          {t("cat_sort.sort_by")}
        </Button>
        <Menu
          id="demo-customized-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          sx={(theme) => ({
            "& .MuiPaper-root": {
              marginTop: theme.spacing(0),
              marginLeft: theme.spacing(1),
              width: "40%",
              color: darkMode ? "white" : "#757575",
              backgroundColor: darkMode ? "#323232" : "white",
            },
          })}
        >
          {/* 第一部分選項 */}
          {sortData.slice(0, 4).map((d: any) => (
            <MenuItem
              key={d.date}
              onClick={() => {
                setAnchorEl(null);
                fetchNovelList(true, searchConfig.o, d.date);
              }}
              className={`${searchConfig.t === d.date ? "bg-og text-white" : ""}`}
            >
              {d.title}
            </MenuItem>
          ))}
          {/* 第二部分選項 */}
          <hr />
          {sortData.slice(4, 8).map((d: any) => (
            <MenuItem
              key={d.key}
              onClick={() => {
                setAnchorEl(null);
                fetchNovelList(true, d.key, searchConfig.t);
              }}
              className={` ${searchConfig.o === d.key ? "bg-og text-white" : ""}`}
            >
              {d.title}
            </MenuItem>
          ))}
        </Menu>
      </div>
      <div className="h-10 bg-white rounded-md flex items-center border-2 m-2 px-2 dark:bg-nbk">
        <div className="relative w-full">
          <input
            type="text"
            className="w-full border-none outline-none text-base rounded-sm px-8 dark:bg-nbk"
            placeholder={t("search.search_keyword")}
            value={searchConfig.query}
            onChange={(e) => setSearchConfig((prev: any) => ({ ...prev, query: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchClick((e.target as HTMLInputElement).value);
              }
            }}
          />
          {searchConfig.query && (
            <CloseIcon
              sx={{ stroke: "#757575", strokeWidth: 2 }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#aaa] text-xl stroke-gray-400"
              onClick={() => fetchNovelList(false)}
            />
          )}
          <SearchIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 text-[#aaa] text-3xl cursor-pointer" />
        </div>
      </div>
      <div className="bg-white text-gy rounded-md m-2 dark:bg-nbk dark:text-white">
        <p className="p-3">
          {t("novel.show")}&nbsp;
          <span className="dark:text-og">
            {(searchConfig.start ? novelSearchList.total : novelList.total) >= 1 ? 1 : 0}
          </span>
          &nbsp;到&nbsp;
          <span className="dark:text-og">{searchConfig.start ? novelSearchList.total : novelList.total}</span>
          &nbsp;中的&nbsp;
          <span className="dark:text-og">{searchConfig.start ? novelSearchList.total : novelList.total}</span>
          &nbsp;{t("novel.novel")}
        </p>
      </div>
      <NovelList
        t={t}
        novelList={searchConfig.start ? novelSearchList : novelList}
        isLoading={isLoading}
        handleSearchClick={handleSearchClick}
        handleEngagementAction={handleEngagementAction}
        favoriteSave={favoriteSave}
        filter={filter}
      />
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
      <BottomNav />
      <TopBtn />
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
    </div>
  );
};

export default Novel;
