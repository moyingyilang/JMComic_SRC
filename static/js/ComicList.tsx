import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CheckIcon from "@mui/icons-material/Check";
import {
  FETCH_ADD_LIKE_THUNK,
  FETCH_ADD_FAVORITE_THUNK,
  FETCH_EDIT_FAVORITE_FOLDER_THUNK,
  FETCH_FAVORITE_LIST_THUNK,
} from "../../actions/memberAction";
import { CLEAR_MEMBER_LIST } from "../../reducers/memberReducer";
import { Alert } from "../Alert/Alert";
import FolderModal from "../../components/Modal/FolderModal";
import { defaultEditInitialState } from "../../utils/InterFace";
import { getDateDiffFromNow } from "../../utils/Function";
import { useEngagementActions } from "../../Hooks/useEngagementActions";

const ComicList = (props: any) => {
  const {
    t,
    listName,
    logined,
    list,
    title,
    link,
    smImgSize,
    setting,
    cols,
    comicTags,
    comicMark,
    comicCheck,
    cardPadding,
    editFolder,
    setEditFolder,
    showSnackbar,
    setDialogOpen,
    dialogOpen,
    isWeekly,
  } = props;

  const dispatch = useAppDispatch();
  const { favoriteList } = useAppSelector((state) => state.member);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const movedRef = useRef(false);
  const isLikedItem = JSON.parse(localStorage.getItem("likedItems") || "[]");
  const [favoriteSave, setFavoriteSave] = useState<{ like: string[]; mark: string[] }>(() => {
    const storedLikes = localStorage.getItem("likedItems");
    return {
      like: storedLikes ? JSON.parse(storedLikes) : [],
      mark: [],
    };
  });

  // 漫畫長按刪除
  const handleStart = (aid: string) => {
    if (window.location.pathname.includes("member")) {
      movedRef.current = false;
      timerRef.current = setTimeout(() => {
        setEditFolder({
          ...editFolder,
          edit: true,
          type: "del_comic",
          alert: true,
          message: t("snack.confirm_delete"),
          aid,
        });
      }, 800);
    }
  };

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMove = () => {
    movedRef.current = true;
    clearTimeout(timerRef.current!);
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
        handleFindFolder();
        toggleFavoriteState("mark", id);
        const result = await dispatch(FETCH_ADD_FAVORITE_THUNK(id)).unwrap();
        const { code, data } = result;
        const msgType = data.status !== "ok" ? "error" : "success";
        if (data.status === "ok") {
          switch (data.type) {
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
        showSnackbar(data.msg, msgType);
      }
    }
  };
  // console.log(editFolder, "editFolder");

  // GetFolderList
  const handleFindFolder = () => {
    dispatch(CLEAR_MEMBER_LIST("favoriteList"));
    const { folder_id, o } = editFolder;
    dispatch(FETCH_FAVORITE_LIST_THUNK({ page: 1, folder_id, o }));
  };

  // EditFolder
  // type === add / edit / move / del
  const handleEditFolder = async (type: string) => {
    if (type === "del") {
      setDialogOpen({ ...dialogOpen, alert: true });
    }
    const { folder_id, folder_name, aid } = editFolder;
    if (folder_name !== "") {
      const result = await dispatch(FETCH_EDIT_FAVORITE_FOLDER_THUNK({ type, folder_id, folder_name, aid })).unwrap();
      const { status, msg } = result.data;
      const statusType = status !== "ok" ? "error" : "success";
      if (status && msg) {
        showSnackbar(msg, statusType);
      }
    } else {
      showSnackbar(t("comic.added_to_favorites_success"), "success");
    }
    setEditFolder((prev: any) => ({ ...prev, ...defaultEditInitialState }));
  };

  return (
    <>
      {Array.isArray(list) &&
        list.length > 0 &&
        list
          ?.reduce((rows: any[][], d, i) => {
            if (i % (cols || 3) === 0) {
              rows.push([]);
            }
            rows[rows.length - 1].push(d);
            return rows;
          }, [])
          .map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-3 bg-white gap-2 my-3 p-2 relative dark:bg-nbk dark:text-tgy"
              style={{ paddingTop: cardPadding || "" }}
            >
              {row.map((item, index) => (
                <div key={item.id}>
                  {title === "new" && rowIndex === 0 && (
                    <div className="left-1 top-1 w-full h-6 rounded-sm mb-3">
                      {index === 0 ? t("comic.latest_uploads") : ""}
                    </div>
                  )}
                  <div
                    className="relative mt-3"
                    onMouseDown={() => handleStart(item.id)}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={() => handleStart(item.id)}
                    onTouchEnd={handleEnd}
                    onTouchMove={handleMove}
                  >
                    <Link to={link ? `/comic/detail?id=${item.id}` : "#"}>
                      <img
                        src={
                          setting?.img_host &&
                          setting.img_host + "/media/albums/" + item.id + "_3x4.jpg?v=" + item.update_at
                        }
                        alt={item.id}
                        loading="lazy"
                        onLoad={(e) => {
                          // const target = e.target as HTMLImageElement;
                          // target.style.opacity = "1";
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/cover_default.jpg";
                        }}
                        className={`animation-click-item object-cover rounded-md
                          ${smImgSize ? "h-[150px] w-[130px]" : "w-[128px] h-[171px]"} 
                         ${
                           editFolder.edit && editFolder.aid?.split(",").includes(item.id.toString())
                             ? "opacity-75"
                             : ""
                         }
                         `}
                        style={
                          {
                            // opacity: "0",
                            // transition: "opacity 0.5s ease-in-out",
                          }
                        }
                      />
                    </Link>
                    {editFolder.edit && comicCheck && (
                      <div
                        className="absolute left-2 top-2 rounded text-white px-[0.2rem]"
                        onClick={() => {
                          const selectArray = editFolder.aid?.split(",") || [];
                          const isSelected = selectArray.includes(item.id);

                          const newSelect = isSelected
                            ? selectArray.filter((s: any) => s !== item.id)
                            : [...selectArray, item.id];

                          setEditFolder((prev: any) => ({
                            ...prev,
                            aid: newSelect.join(",").replace(/^,/, ""),
                          }));
                        }}
                      >
                        <p className="border-2 border-solid border-og w-6 h-6 flex">
                          {editFolder.aid?.split(",").includes(item.id) && (
                            <CheckIcon
                              key={item.id}
                              sx={{ fontSize: 14, color: "#ff6f00", stroke: "#ff6f00", strokeWidth: 2 }}
                            />
                          )}
                        </p>
                      </div>
                    )}
                    {isWeekly && getDateDiffFromNow(Number(item.update_at)) <= 3 && (
                      <span className="absolute left-2 top-2 rounded bg-red-600 text-white px-[0.1rem]">
                        {t("library.update")}
                      </span>
                    )}
                    {comicTags && (
                      <div className="absolute right-2 top-2 rounded bg-og text-white px-[0.2rem]">
                        {item.category.title}
                      </div>
                    )}
                    {comicMark && (
                      <>
                        <div
                          className="bg-[rgb(117,117,117,0.6)] absolute left-2 bottom-3 rounded p-[0.1rem]"
                          onClick={() => handleEngagementAction("like", item.id)}
                        >
                          <FavoriteIcon
                            className={`${item.liked || isLikedItem.includes(item.id) ? "text-red-600" : "text-og"}`}
                          />
                        </div>
                        <div
                          className="bg-[rgb(117,117,117,0.6)] absolute right-2 bottom-3 rounded p-[0.1rem]"
                          onClick={() => handleEngagementAction("mark", item.id)}
                        >
                          {item.is_favorite || favoriteSave.mark.includes(item.id) ? (
                            <BookmarkIcon className="text-og" />
                          ) : (
                            <BookmarkBorderIcon className="text-2xl text-white" />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <Link to={link ? `/comic/detail?id=${item.id}` : "#"}>
                    <p className="truncate py-2">{item.name}</p>
                    <p className="truncate text-gy text-t08">{item.author}</p>
                  </Link>
                </div>
              ))}
            </div>
          ))}
      {listName !== "mainList" && dialogOpen.folder && (
        <FolderModal
          folderList={favoriteList.folder_list}
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
          showSnackbar={showSnackbar}
        />
      )}
    </>
  );
};
export default ComicList;
