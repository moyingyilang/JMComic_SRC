import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard, Scrollbar } from "swiper/modules";

const RelatedListCarousel = (props: any) => {
  const { t, queryTab, related_list, setting } = props;
  return (
    <Swiper
      slidesPerView={1.5}
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
      {Array.isArray(related_list) &&
        related_list.map((related) => (
          <SwiperSlide key={related.id} className="p-1">
            <div className="relative">
              <div className="w-full flex items-center overflow-hidden mb-2 ml-2">
                <img
                  src={
                    related.user_photo !== ""
                      ? `${setting?.img_host}/media/users/${related.user_photo}`
                      : `${setting?.img_host}/media/users/nopic-Male.gif`
                  }
                  alt={related.id}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/ic_head.png";
                  }}
                  className="rounded-full object-cover w-10 h-10 m-0"
                />
                <p className="ml-4">{related.title}</p>
              </div>
              <Link to={`/blogs/detail?tab=${queryTab}&id=${related.id}`}>
                <img
                  src={setting?.img_host + decodeURIComponent(related.photo)}
                  alt={related.id}
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
                  className="object-cover rounded-md h-48"
                  style={{
                    opacity: "0",
                    transition: "opacity 0.5s ease-in-out",
                  }}
                />
              </Link>
            </div>
            <div className="flex justify-between text-gy text-sm p-2">
              <div className="flex">
                <p className="">
                  {related.total_likes}
                  {t("detail.like")}
                </p>
                <p className="ml-2">
                  {related.total_comments}
                  {t("detail.message")}
                </p>
              </div>
              <p className="">{related.date}</p>
            </div>
          </SwiperSlide>
        ))}
    </Swiper>
  );
};

export default RelatedListCarousel;
