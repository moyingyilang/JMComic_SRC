import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import React from "react";
import { Link } from "react-router-dom";
import AdComponent from "../Ads/AdComponent";

const NovelList = (props: any) => {
  const { novelList, isLoading, handleSearchClick, handleEngagementAction, favoriteSave, t, filter } = props;
  return (
    <div className="grid grid-cols-2 gap-2 p-2 justify-items-center pb-40">
      {novelList.list?.length > 0
        ? novelList.list.map((d: any, i: number) => {
            const isAdPosition = (i + 1) % 10 === 0;
            return (
              <React.Fragment key={d.id}>
                <div key={`novel-card-${d.id}`} className="relative w-[95%] bg-white rounded p-2 my-1.5 dark:bg-bbk">
                  <Link to={`/novels/detail?nid=${d.id}&filter=${filter}`}>
                    <div className="w-full h-auto overflow-hidden">
                      <img
                        src={d.image}
                        alt={d.id}
                        loading="lazy"
                        onLoad={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "1";
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/cover_default.jpg";
                        }}
                        className="animation-click-item object-cover rounded-md w-[170px] h-[230px]"
                        style={{ opacity: "0", transition: "opacity 0.5s ease-in-out" }}
                      />
                    </div>
                  </Link>
                  <p className="text-gy truncate mt-1 dark:text-white">{d.name}</p>
                  <p className="text-gy truncate dark:text-lgy">{d.last_chapter_title}</p>

                  <button className="text-og text-t08" onClick={() => handleSearchClick(d.author)}>
                    {d.author}
                  </button>
                  <div
                    className="bg-[rgba(117,117,117,0.6)] absolute left-3 bottom-24 rounded p-[0.1rem]"
                    onClick={() => handleEngagementAction("like", d.id)}
                  >
                    <FavoriteIcon className={`${favoriteSave.like.includes(d.id) ? "text-red-600" : "text-og"}`} />
                  </div>
                  <div
                    className="bg-[rgba(117,117,117,0.6)] absolute right-3 bottom-24 rounded p-[0.1rem]"
                    onClick={() => handleEngagementAction("mark", d.id)}
                  >
                    {favoriteSave.mark.includes(d.id) ? (
                      <BookmarkIcon className="text-og" />
                    ) : (
                      <BookmarkBorderIcon className="text-2xl text-white" />
                    )}
                  </div>
                </div>
                {isAdPosition && (
                  <div className="col-span-2 grid grid-cols-2 gap-2">
                    <div className="max-h-[140px] overflow-hidden">
                      <AdComponent adKey="app-novels_list_mid_1" />
                    </div>
                    <div className="max-h-[140px] overflow-hidden">
                      <AdComponent adKey="app-novels_list_mid_2" />
                    </div>
                    <div className="max-h-[140px] overflow-hidden">
                      <AdComponent adKey="app-novels_list_mid_3" />
                    </div>
                    <div className="max-h-[140px] overflow-hidden">
                      <AdComponent adKey="app-novels_list_mid_4" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        : !isLoading &&
          novelList.list?.length === 0 && (
            <p className="col-span-2 text-center text-gy mt-10">{t("search.no_data_found")}</p>
          )}
      <AdComponent adKey="app-novels_list_bottom_1" />
      <AdComponent adKey="app-novels_list_bottom_2" />
      <AdComponent adKey="app-novels_list_bottom_3" />
      <AdComponent adKey="app-novels_list_bottom_4" />
    </div>
  );
};

export default NovelList;
