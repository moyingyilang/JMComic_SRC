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
}

const MoviesContent: React.FC<ContentProps> = ({ movie }) => {
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
            {(index + 1) % 10 === 1 && index !== 0 && (
              <div className="col-span-2 flex justify-center">
                <div className="min-h-[70px] w-full bg-white">
                  <AdComponent key={index + 1 * 10} adKey="app_movies_ten" />
                </div>
              </div>
            )}
            <div
              onClick={() => handleGoToPlayer(item.id)}
              className="bg-white dark:bg-nbk rounded overflow-hidden shadow cursor-pointer"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <LazyLoadImage
                  className="w-full h-full object-cover"
                  placeholderSrc="/images/title-circle.webp"
                  src={item.photo.startsWith("http") ? item.photo : `${BASE_URL}${item.photo}`}
                  alt={item.title}
                />
              </div>
              <div className="p-2">
                <p className="line-clamp-1 text-sm font-medium dark:text-white">{item.title}</p>
                <div className="text-xs text-og whitespace-nowrap overflow-auto scrollbar-hidden">
                  {item.tags?.map((tag, idx) => (
                    <span key={idx} className="mr-1">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="mb-4 flex justify-center w-full">
        <AdComponent key={1} adKey="app_movies_bottom" />
      </div>
    </>
  );
};

export default MoviesContent;
