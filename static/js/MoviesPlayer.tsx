import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import WestIcon from "@mui/icons-material/West";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Button } from "@mui/material";

import { LazyLoadImage } from "react-lazy-load-image-component";
import { useParams, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Scrollbar } from "swiper/modules";
import HlsPlayer from "../../components/Movies/HlsPlayer";
import { FETCH_MOVIE_PLAYER_THUNK } from "../../actions/moviesPlayerAction";
import { RESET_MOVIES_PLAYER } from "../../reducers/moviesPlayerReducer";
import AdComponent from "../../components/Ads/AdComponent";
import { useTranslation } from "react-i18next";
import GlobalStore from "../../config/GlobalStore";
const BASE_URL = GlobalStore.apiUrl || "";

const MoviesPlayer = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // 取得 URL search 參數
  const { id } = useParams(); // 取得網址上的初始 id

  const { moviesDetail, isLoading } = useAppSelector((state) => state.MoviesPlayer);
  const searchParams = new URLSearchParams(location.search);
  const videoType = searchParams.get("videoType") || "movie";
  const searchQuery = searchParams.get("searchQuery") || "";
  const video = moviesDetail?.video;
  const related = moviesDetail?.related_videos;
  const series = moviesDetail?.videoSeries;
  const { t } = useTranslation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  useEffect(() => {
    dispatch(RESET_MOVIES_PLAYER());
    if (id && videoType) {
      dispatch(FETCH_MOVIE_PLAYER_THUNK({ id, video_type: videoType }));
    }
  }, [id, videoType]);

  return (
    <div className="pb-40">
      <div className="sticky top-0 h-20 bg-[#242424] text-white flex items-end p-2 py-3  z-50">
        <Link to={`/movies?videoType=${videoType}&searchQuery=${encodeURIComponent(searchQuery)}`}>
          <WestIcon className="text-3xl p-r-5" />
        </Link>

        <span className="pl-2 line-clamp-1">{video?.title}</span>
      </div>
      {/* 預覽圖與播放按鈕 */}
      {!isPlaying && (
        <div className="relative w-full">
          {/* 預覽圖 */}

          <div className="aspect-[16/9] overflow-hidden w-full">
            {!imgLoaded && <div className="absolute inset-0 bg-black z-10" />}
            <img
              src={video?.photo}
              alt="影片預覽圖"
              className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>

          {/* 圓形播放按鈕 */}
          <button
            onClick={handlePlay}
            className="absolute m-auto w-16 h-16 bg-og rounded-full flex items-center justify-center shadow-lg"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <PlayArrowIcon className="text-5xl text-white" />
          </button>
        </div>
      )}

      {/* 影片播放器 */}
      {isPlaying && <HlsPlayer src={video?.video_src ?? ""} />}

      <div className="p-3">
        <a href={video?.full_url} target="_blank" rel="noopener noreferrer external">
          <Button className="w-full bg-og text-white mb-4">{t("movies.watch_full_video")}</Button>
        </a>
        <div className="flex flex-col gap-2 mb-4">
          <p className="text-lg text-gray-500">
            {video?.date && <span>{video?.date}．</span>}
            {t("movies.views")}:{video?.view}
          </p>

          {videoType !== "cos" && (
            <div className="flex flex-wrap gap-2 ">
              <p className="text-lg self-center">{t("movies.studio")}：</p>
              {video?.factory === "無資料" ? (
                <div>{video?.factory}</div>
              ) : (
                <div className="text-black px-3 py-1 rounded border border-gray-800">
                  <Link to={`/movies?videoType=${videoType}&searchQuery=${encodeURIComponent(video?.factory)}`}>
                    {video?.factory}
                  </Link>
                </div>
              )}
            </div>
          )}

          {videoType === "cos" && (
            <div className="">
              <div className="flex flex-wrap gap-2 mb-4">
                <p className="text-lg self-center">{t("movies.work")}：</p>
                {video?.works === "無資料" ? (
                  <div>{video?.works}</div>
                ) : (
                  <div className="text-black px-3 py-1 rounded border border-gray-800">
                    <Link to={`/movies?videoType=${videoType}&searchQuery=${encodeURIComponent(video?.works)}`}>
                      {video?.works}
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 ">
                <p className="text-lg self-center">{t("movies.character")}：</p>
                {video?.characters === "無資料" ? (
                  <div>{video?.characters}</div>
                ) : (
                  <div className="text-black px-3 py-1 rounded border border-gray-800">
                    <Link to={`/movies?videoType=${videoType}&searchQuery=${encodeURIComponent(video?.characters)}`}>
                      {video?.characters}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {videoType === "movie" && (
            <div className="flex flex-wrap gap-2 ">
              <p className="text-lg">{t("movies.actress")}：</p>
              {Array.isArray(video?.girls) &&
                video?.girls.map((item: string, index: number) =>
                  item === "無資料" ? (
                    <span key={index} className="text-black">
                      {item}
                    </span>
                  ) : (
                    <Link
                      key={index}
                      className="px-3 py-1 border-gray-800 border rounded text-sm"
                      to={`/movies?videoType=${videoType}&searchQuery=${encodeURIComponent(item)}`}
                    >
                      {item}
                    </Link>
                  )
                )}
            </div>
          )}

          {videoType === "movie" && (
            <div className="text-lg">
              <p>
                {t("movies.description")}：
                <span className="text-gray-500">
                  {video?.description?.trim() ? video.description : t("movies.no_data")}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* 各類標籤 */}
        {video?.tags && video?.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <p className="text-lg">{t("movies.tag")}：</p>
            {video?.tags.map((item: string, index: number) => (
              <Link
                key={index}
                className="px-3 py-1 border-gray-800 border rounded text-sm"
                to={`/movies?videoType=${videoType}&searchQuery=${encodeURIComponent(item)}`}
              >
                #{item}
              </Link>
            ))}
          </div>
        )}

        {/* 系列影片區域 */}
        {series && series.length > 0 && (
          <div className="border border-gray-700 rounded ">
            <div className="bg-gray-700 text-white p-3 text-lg">
              <p>{t("movies.series_movies")}</p>
              <small>
                {series.length}
                {t("movies.movies")}
              </small>
            </div>
            <div className="p-3 h-60 ">
              <ul className="overflow-scroll scrollbar-hidden h-full">
                {series?.map((item: any, idx: number) => (
                  <li
                    key={idx}
                    onClick={() => {
                      navigate(
                        `/movies/${item.vid}?videoType=${videoType}&searchQuery=${encodeURIComponent(searchQuery)}`,
                        {
                          replace: true,
                        }
                      );
                    }}
                    className="flex items-center space-x-2 mb-5"
                  >
                    <div className="aspect-[16/9] overflow-hidden w-1/2">
                      <LazyLoadImage className="object-cover w-full h-full" src={item.photo} alt={item.title} />
                    </div>
                    <p className="line-clamp-3 text-og w-1/2">
                      <p>{item.title}</p>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      {/* 相關影片 */}
      {related && related.length > 0 && (
        <div className="bg-white mb-4 ">
          <p className="p-2">{t("movies.related_movies")}</p>
          <Swiper
            spaceBetween={8}
            slidesPerView={2.5}
            centeredSlides={false}
            slidesPerGroupSkip={3}
            grabCursor={true}
            keyboard={{
              enabled: true,
            }}
            scrollbar={true}
            modules={[Keyboard, Scrollbar]}
            className="p-2"
          >
            {related?.map((item: any, idx: number) => (
              <SwiperSlide key={idx}>
                <div
                  className="cursor-pointer "
                  onClick={() => {
                    navigate(
                      `/movies/${item.id}?videoType=${videoType}&searchQuery=${encodeURIComponent(searchQuery)}`,
                      {
                        replace: true,
                      }
                    );
                  }}
                >
                  <p className="aspect-[16/9] overflow-hidden">
                    <LazyLoadImage
                      className="w-full h-full object-cover rounded"
                      placeholderSrc="/images/title-circle.webp"
                      src={item.photo}
                      alt={item.title}
                    />
                  </p>
                  <p className="line-clamp-2">{item.title}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
      {/* 廣告區塊 */}
      <div className="mt-2">
        <div className="grid grid-cols-2">
          <AdComponent adKey="app_movie_bottom_left_1" />
          <AdComponent adKey="app_movie_bottom_right_1" />
        </div>
        <AdComponent adKey="app_movie_bottom_center" />
        <div className="grid grid-cols-2">
          <AdComponent adKey="app_movie_bottom_left_2" />
          <AdComponent adKey="app_movie_bottom_right_2" />
        </div>
        <AdComponent adKey="app_movie_bottom" />
      </div>

      <div className="fixed bottom-0 w-full z-10">
        <AdComponent adKey="app_movie_fixed_bottom" closeBtn={true} />
      </div>
    </div>
  );
};

export default MoviesPlayer;
