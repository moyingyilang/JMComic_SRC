import { useRef } from "react";
import { Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CheckIcon from "@mui/icons-material/Check";
import { getDateDiffFromNow } from "../../utils/Function";

const NovelMemberList = (props: any) => {
  const {
    t,
    logined,
    list,
    title,
    link,
    setting,
    cols,
    comicTags,
    comicMark,
    comicCheck,
    cardPadding,
    editFolder,
    setEditFolder,
    isWeekly,
    handleEngagementAction,
    favoriteSave,
  } = props;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const movedRef = useRef(false);

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMove = () => {
    movedRef.current = true;
    clearTimeout(timerRef.current!);
  };

  return (
    <div className="mx-auto grid grid-cols-2 gap-0 pt-8 dark:bg-nbk dark:text-white">
      {Array.isArray(list) &&
        list.length > 0 &&
        list.map((item, index) => (
          <div key={item.id + index} className="flex flex-col justify-center items-center overflow-hidden">
            <div className="relative mt-6 w-11/12 h-auto">
              <Link to={link ? `/novels/detail?nid=${item.id}` : "#"}>
                <img
                  src={item.image}
                  alt={item.id}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/cover_default.jpg";
                  }}
                  className={`animation-click-item object-cover rounded-md w-full min-h-64
                         ${
                           editFolder.edit && editFolder.aid?.split(",").includes(item.id.toString())
                             ? "opacity-75"
                             : ""
                         }
                         `}
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
                  {item.category?.title}
                </div>
              )}
            </div>
            <Link to={link ? `/novels/detail?nid=${item.id}` : "#"} className="w-10/12 mx-auto">
              <p className="truncate py-2 text-og">{item.name}</p>
              <p className="truncate text-gy text-t08 dark:text-lgy">{item.author}</p>
            </Link>
          </div>
        ))}
    </div>
  );
};
export default NovelMemberList;
