import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard, Scrollbar } from "swiper/modules";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import {
  FETCH_ADD_LIKE_THUNK,
  FETCH_ADD_FAVORITE_THUNK,
  FETCH_EDIT_FAVORITE_FOLDER_THUNK,
  FETCH_FAVORITE_LIST_THUNK,
} from "../../actions/memberAction";
import { CLEAR_MEMBER_LIST } from "../../reducers/memberReducer";
import FolderModal from "../../components/Modal/FolderModal";
import { getDateDiffFromNow, getWeekInfo } from "../../utils/Function";
import { defaultEditInitialState } from "../../utils/InterFace";

const ComicCarousel = (props: any) => {
  const { t, listName, list, setting, logined, editFolder, setEditFolder, showSnackbar, setDialogOpen, dialogOpen } =
    props;
  const location = useLocation();
  const weekDayItems = t("comic.weekDays", { returnObjects: true });
  const { today } = getWeekInfo(weekDayItems);
  const searchParams = new URLSearchParams(location.search);
  const creatorId = searchParams.get("creatorId") as string;
  const dispatch = useAppDispatch();
  const { favoriteList } = useAppSelector((state) => state.member);
  const isLikedItem = JSON.parse(localStorage.getItem("likedItems") || "[]");
  const [favoriteSave, setFavoriteSave] = useState<{ like: string[]; mark: string[] }>({ like: [], mark: [] });

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
        const type = status !== "success" ? "error" : "success";
        showSnackbar(msg, type);
      }
    }
    if (type === "mark") {
      if (!logined) {
        showSnackbar(t("login.please_login"), "error");
      } else {
        handleFindFolder();
        toggleFavoriteState("mark", id);
        setEditFolder({ ...editFolder, aid: id });
        const result = await dispatch(FETCH_ADD_FAVORITE_THUNK(id)).unwrap();

        const { code, data } = result;
        if (result.code === 200) {
          const type = data.status !== "ok" ? "error" : "success";
          showSnackbar(data.msg, type);
        }
        if (data.status === "ok" && data.type === "add") {
          setDialogOpen({ ...dialogOpen, folder: true });
        }
      }
    }
  };

  // GetFolderList
  const handleFindFolder = (folder_id?: string, o?: string) => {
    dispatch(CLEAR_MEMBER_LIST("favoriteList"));
    dispatch(FETCH_FAVORITE_LIST_THUNK({ page: 1, folder_id: folder_id || "", o: o || "mr" }));
  };

  // EditFolder
  const handleEditFolder = async (type: string) => {
    console.log(editFolder, "editFolder");
    const { folder_id, folder_name, aid } = editFolder;

    if (folder_id !== "") {
      const result = await dispatch(FETCH_EDIT_FAVORITE_FOLDER_THUNK({ type, folder_id, folder_name, aid })).unwrap();
      const { msg, status } = result.data;
      if (status === "ok") {
        const statusType = status !== "ok" ? "error" : "success";
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
        list?.map((d) => (
          <div key={d.id} className="bg-white dark:bg-nbk dark:text-white">
            <div className="flex justify-between mt-3 p-2">
              <p>{d.id === "26" ? today + t("comic.seriesUpdate") : d.title}</p>
              <p className="text-og">
                {d.type === "library" && <Link to="/library">{t("comic.see_more")}</Link>}
                {d.type === "promote" && (
                  <Link to={`/comic?id=${d.id}&title=${encodeURIComponent(d.title)}`}>{t("comic.see_more")}</Link>
                )}
                {d.type?.includes("category_id") && (
                  <Link to={`/categories?slug=${d.slug}`}>{t("comic.see_more")}</Link>
                )}
              </p>
            </div>
            <Swiper
              slidesPerView={3}
              centeredSlides={false}
              slidesPerGroupSkip={3}
              grabCursor={true}
              keyboard={{
                enabled: true,
              }}
              scrollbar={true}
              modules={[Keyboard, Scrollbar, Pagination]}
              className="mySwiper2"
            >
              {d.content.map((item: any) => (
                <SwiperSlide key={item.id} className="p-2">
                  <div className="relative">
                    {d.type !== "library" ? (
                      <>
                        <Link to={`/comic/detail?id=${item.id}`}>
                          <img
                            src={setting?.img_host + "/media/albums/" + item.id + "_3x4.jpg?v=" + item.update_at}
                            alt={item.id}
                            onLoad={(e) => {
                              // const target = e.target as HTMLImageElement;
                              // target.style.opacity = "1";
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/cover_default.jpg";
                            }}
                            width="100%"
                            height="auto"
                            className="animation-click-item object-cover rounded-md w-[128px] h-[171px]"
                            // style={{
                            //   opacity: "0",
                            //   transition: "opacity 0.5s ease-in-out",
                            // }}
                          />
                        </Link>
                        {d.id === "26" && getDateDiffFromNow(Number(item.update_at)) <= 3 && (
                          <span className="absolute left-2 top-2 rounded bg-red-600 text-white px-[0.1rem]">
                            {t("library.update")}
                          </span>
                        )}
                        <div className="absolute right-2 top-2 rounded bg-og text-white px-[0.1rem]">
                          {item?.category?.title}
                        </div>
                        <div
                          className="bg-[rgb(117,117,117,0.6)] absolute left-2 bottom-2 rounded p-[0.1rem]"
                          onClick={() => handleEngagementAction("like", item.id)}
                        >
                          <FavoriteIcon
                            className={`${item.liked || isLikedItem.includes(item.id) ? "text-red-600" : "text-og"}`}
                          />
                        </div>
                        <div
                          className="bg-[rgb(117,117,117,0.6)] absolute right-2 bottom-2 rounded p-[0.1rem]"
                          onClick={() => handleEngagementAction("mark", item.id)}
                        >
                          {item.is_favorite || favoriteSave.mark.includes(item.id) ? (
                            <BookmarkIcon className="text-og" />
                          ) : (
                            <BookmarkBorderIcon className="text-2xl text-white" />
                          )}
                        </div>
                      </>
                    ) : (
                      <Link to={`/library/list/detail?creatorId=${creatorId}&id=${item.id}`}>
                        <img
                          src={setting?.img_host + "/media/albums/" + item.id + "_3x4.jpg?v=" + item.update_at}
                          alt={item.id}
                          loading="lazy"
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.opacity = "1";
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/cover_default.jpg";
                          }}
                          className="animation-click-item object-cover rounded-md w-[130px] h-[130px]"
                          style={{
                            opacity: "0",
                            transition: "opacity 0.5s ease-in-out",
                          }}
                        />
                      </Link>
                    )}
                  </div>
                  <p className="truncate py-2">{item.name}</p>
                  <p className="truncate text-gy text-t08">{item.author}</p>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ))}
      {listName === "mainList" && dialogOpen.folder && (
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
    </>
  );
};

export default ComicCarousel;
