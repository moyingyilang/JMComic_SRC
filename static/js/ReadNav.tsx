import { useState } from "react";
import { motion } from "framer-motion";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TextsmsIcon from "@mui/icons-material/Textsms";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import {
  FETCH_ADD_LIKE_THUNK,
  FETCH_ADD_FAVORITE_THUNK,
  FETCH_EDIT_FAVORITE_FOLDER_THUNK,
  FETCH_FAVORITE_LIST_THUNK,
} from "../../actions/memberAction";
import { CLEAR_MEMBER_LIST } from "../../reducers/memberReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FolderModal from "../../components/Modal/FolderModal";
import { Box, Slider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { defaultEditInitialState } from "../../utils/InterFace";

const ReadNav = (props: any) => {
  const {
    readId,
    logined,
    isLoading,
    setIsVertical,
    isVertical,
    changeCurrentPage,
    scrollProgress,
    imageCount,
    handleSliderChange,
    handlePageChange,
    setDialogOpen,
    dialogOpen,
    readList,
    detailList,
    showSnackbar,
    closeNav,
  } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { favoriteList } = useAppSelector((state) => state.member);
  const [editFolder, setEditFolder] = useState(defaultEditInitialState);
  const isLikedItem = JSON.parse(localStorage.getItem("likedItems") || "[]");
  const [favoriteSave, setFavoriteSave] = useState<{ like: string[]; mark: string[] }>(() => {
    const storedLikes = localStorage.getItem("likedItems");
    return {
      like: storedLikes ? JSON.parse(storedLikes) : [],
      mark: [],
    };
  });

  // GetFolderList
  const handleFindFolder = () => {
    dispatch(CLEAR_MEMBER_LIST("favoriteList"));
    const { folder_id, o } = editFolder;
    dispatch(FETCH_FAVORITE_LIST_THUNK({ page: 1, folder_id, o }));
  };

  // like && mark
  const toggleFavoriteState = (type: "like" | "mark", id: string) => {
    setFavoriteSave((prev: any) => {
      const currentList = prev[type] || [];
      const exists = currentList.includes(id);

      const updatedList = exists ? currentList.filter((item: string) => item !== id) : [...currentList, id];

      return {
        ...prev,
        [type]: updatedList,
      };
    });
  };

  const handleEngagementAction = async (type: string, id: string) => {
    if (type === "like") {
      if (isLikedItem.includes(id)) {
        showSnackbar(t("snack.already_rated"), "success");
        return;
      }
      localStorage.setItem("likedItems", JSON.stringify([...isLikedItem, id]));
      const result = await dispatch(FETCH_ADD_LIKE_THUNK({ id: id })).unwrap();
      const { code, msg, status } = result.data;
      if (code === 200) {
        const msgType = status !== "success" ? "error" : "success";
        showSnackbar(msg, msgType);
      }
    }
    if (type === "mark") {
      if (!logined) {
        showSnackbar(t("login.please_login"), "error");
        setDialogOpen({ ...dialogOpen, login: true });
      } else {
        handleFindFolder();
        toggleFavoriteState("mark", id);
        setEditFolder({ ...editFolder, aid: id });
        const result = await dispatch(FETCH_ADD_FAVORITE_THUNK(id)).unwrap();
        const { code, data } = result;
        if (code === 200) {
          const msgType = data.status !== "ok" ? "error" : "success";
          showSnackbar(data.msg, msgType);
        }
        if (data.status === "ok" && data.type === "add") {
          setDialogOpen({ ...dialogOpen, folder: true });
        }
      }
    }
  };

  // EditFolder
  const handleEditFolder = async (type: string) => {
    // type === add / edit / move / del
    type === "del" && setDialogOpen({ ...dialogOpen, alert: true });
    const { folder_id, folder_name, aid } = editFolder;

    if (folder_id !== "") {
      const res = await dispatch(FETCH_EDIT_FAVORITE_FOLDER_THUNK({ type, folder_id, folder_name, aid }));
      const result = res.payload as any;
      const { msg, status } = result.data;
      const statusType = status !== "ok" ? "error" : "success";
      if (status === "ok") {
        showSnackbar(msg, statusType);
      }
    } else {
      showSnackbar(t("comic.added_to_favorites_success"), "success");
    }

    setEditFolder((prev: any) => ({ ...prev, ...defaultEditInitialState }));
  };

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: closeNav ? 100 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed left-0 bottom-0 w-full bg-nbk bg-opacity-90 z-20`}
      >
        <div className="flex justify-around items-center">
          <KeyboardDoubleArrowLeftIcon
            className={`${!changeCurrentPage.prev ? "opacity-0" : ""}`}
            onClick={() => handlePageChange("prev")}
          />
          <span>{scrollProgress < 1 ? 1 : scrollProgress}</span>
          <Box sx={{ width: 250 }}>
            <Slider
              value={scrollProgress}
              min={1}
              valueLabelFormat={(value) => `${value}`}
              max={imageCount}
              valueLabelDisplay="auto"
              onChange={handleSliderChange}
              sx={{
                "& .MuiSlider-thumb": {
                  backgroundColor: "#ff6f00",
                },
                "& .MuiSlider-rail": {
                  backgroundColor: "#bbb",
                  opacity: "1",
                },
                "& .MuiSlider-track": {
                  backgroundColor: "#ff6f00",
                  border: "none",
                },
              }}
            />
          </Box>
          <span>{imageCount}</span>
          <div>
            <KeyboardDoubleArrowRightIcon
              className={`${!changeCurrentPage.next ? "opacity-0" : ""}`}
              onClick={() => handlePageChange("next")}
            />
          </div>
        </div>
        <div className="flex justify-around items-center text-center pt-2 pb-4">
          <div className={`${isLoading ? "text-[#aaa]" : ""}`} onClick={() => !isLoading && setIsVertical(!isVertical)}>
            <LibraryBooksIcon className="text-2xl" />
            <p>{isVertical ? t("detail.read_horizontally") : t("detail.read_vertically")}</p>
          </div>
          <div onClick={() => setDialogOpen({ ...dialogOpen, series: true })}>
            <FormatListNumberedIcon className="text-2xl" />
            <p>{t("detail.chapter")}</p>
          </div>
          <div onClick={() => setDialogOpen({ ...dialogOpen, comment: true })}>
            <TextsmsIcon className="text-2xl" />
            <p>{t("detail.comments")}</p>
          </div>
          <div onClick={() => handleEngagementAction("mark", readId)}>
            {readList.is_favorite ? (
              <BookmarkIcon className="text-og" />
            ) : (
              <BookmarkBorderIcon className="text-2xl text-white" />
            )}
            <p>{t("detail.favorites")}</p>
          </div>
          <div onClick={() => handleEngagementAction("like", readId)}>
            <FavoriteIcon className={`text-2xl ${readList.liked || isLikedItem.includes(readId) ? "text-og" : ""}`} />
            <p>{t("detail.like")}</p>
          </div>
        </div>
      </motion.nav>
      {dialogOpen.folder && (
        <FolderModal
          folderList={favoriteList.folder_list}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          editFolder={editFolder}
          setEditFolder={setEditFolder}
          handleEditFolder={handleEditFolder}
          tagsList={detailList.tags}
        />
      )}
    </>
  );
};

export default ReadNav;
