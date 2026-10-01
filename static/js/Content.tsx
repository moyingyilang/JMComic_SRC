import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { List } from "../../reducers/moviesReducer";
import { LazyLoadImage } from "react-lazy-load-image-component";
import AdComponent from "../../components/Ads/AdComponent";
import GlobalStore from "../../config/GlobalStore";
const BASE_URL = GlobalStore.apiUrl || "";

interface ContentProps {
  movie: List[];
  videoType: string;
  memberInfo: Record<string, any>;
}

const MoviesContent: React.FC<ContentProps> = ({ movie, memberInfo }) => {
  const navigate = useNavigate();

  const { selectedVideoType, selectedSearchQuery } = useAppSelector((state) => state.movies);

  if (!movie || !Array.isArray(movie)) return null;

  const handleGoToPlayer = (id: string) => {
    navigate(`/movies/${id}?videoType=${selectedVideoType}&searchQuery=${encodeURIComponent(selectedSearchQuery)}`);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-2 p-2 ">
        {movie.map((item, index) => (
          <React.Fragment key={item.id + index}>
            {!memberInfo.ad_free && (index + 1) % 10 === 1 && index !== 0 && (
              <div className="col-span-2 flex justify-center">
                <div className="min-h-[70px] w-full bg-white">
                  <AdComponent adKey="app_movies_ten_jm3" />
                </div>
              </div>
            )}
            <div
              onClick={() => handleGoToPlayer(item.id)}
              className="bg-white dark:bg-nbk rounded overflow-hidden shadow cursor-pointer"
            >
              {selectedVideoType === "movie" ? (
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                  <LazyLoadImage
                    className="absolute inset-0 w-full h-full object-cover"
                    placeholderSrc="/images/cover_default.jpg"
                    src={item.photo_str?.startsWith("http") ? item.photo_str : `${BASE_URL}${item.photo_str}`}
                    alt={item.title}
                  />
                </div>
              ) : (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <LazyLoadImage
                    className="absolute inset-0 w-full h-full object-cover"
                    placeholderSrc="/images/title-circle.webp"
                    src={item.photo?.startsWith("http") ? item.photo : `${BASE_URL}${item.photo}`}
                    alt={item.title}
                  />
                </div>
              )}
              <div className="p-2">
                <p className="line-clamp-2 text-base font-medium dark:text-white leading-6 min-h-[3rem]">
                  {item.title}
                </p>
                <div className="text-sm text-og whitespace-nowrap overflow-auto scrollbar-hidden truncate">
                  {/* {item.tags?.map((tag, idx) => (
                    <span key={idx} className="mr-1">
                      #{tag}
                    </span>
                  ))} */}
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="mb-4 flex justify-center w-full">
        <AdComponent adKey="app_movies_bottom" />
      </div>
    </>
  );
};

export default MoviesContent;
