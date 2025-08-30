import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard, Scrollbar } from "swiper/modules";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

const RelatedComicCarousel = (props: any) => {
  const { related_comics, setting } = props;
  return (
    <>
      <div className="">
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
          {Array.isArray(related_comics) &&
            related_comics.map((d: any) => (
              <SwiperSlide key={d.id} className="p-2">
                <div className="relative">
                  <Link to={`/comic/detail?id=${d.id}`}>
                    <img
                      src={setting?.img_host + "/media/albums/" + d.id + "_3x4.jpg?v=" + d.update_at}
                      alt={d.id}
                      loading="lazy"
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.opacity = "1";
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/cover_default.jpg";
                      }}
                      width="100%"
                      height="auto"
                      className="object-cover rounded-md"
                      style={{
                        opacity: "0",
                        transition: "opacity 0.5s ease-in-out",
                      }}
                    />
                  </Link>
                  <div className="absolute right-2 top-2 rounded bg-og text-white px-[0.1rem]">
                    {d?.category?.title}
                  </div>
                  <div className="bg-[rgb(117,117,117,0.6)] absolute left-2 bottom-2 rounded p-[0.1rem]">
                    <FavoriteIcon className="mr-0 text-og" />
                  </div>
                  <div className="bg-[rgb(117,117,117,0.6)] absolute right-2 bottom-2 rounded p-[0.1rem]">
                    <BookmarkBorderIcon className="mr-0 text-white" />
                  </div>
                </div>
                <p className="truncate py-2">{d.name}</p>
                <p className="truncate text-gy text-t08">{d.author}</p>
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </>
  );
};

export default RelatedComicCarousel;
