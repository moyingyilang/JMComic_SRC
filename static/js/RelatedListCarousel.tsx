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
              <div className="w-full h-16 flex items-center overflow-hidden mb-2 ml-2">
                <img
                  src={
                    setting?.img_host
                      ? related?.user_photo
                        ? `${setting.img_host}/media/users/${related.user_photo}`
                        : `${setting.img_host}/media/users/nopic-Male.gif`
                      : "/images/ic_head.png"
                  }
                  alt={related?.id || "user"}
                  onError={(e) => {
                    const img = e.currentTarget;
                    // 防止 fallback 無限觸發
                    if (!img.src.includes("ic_head.png")) {
                      img.src = "/images/ic_head.png";
                    }
                  }}
                  loading="lazy"
                  decoding="async"
                  className="rounded-full object-cover w-10 h-10 m-0 bg-gy"
                />
                <p className="line-clamp-2 ml-4">{related.title}</p>
              </div>
              <Link to={`/blogs/detail?tab=${queryTab}&id=${related.id}`}>
                <img
                  src={
                    setting?.img_host && related?.photo
                      ? `${setting.img_host}${decodeURIComponent(related.photo)}`
                      : "/images/cover_default.jpg"
                  }
                  alt={related?.id || "image"}
                  loading="lazy"
                  decoding="async"
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onError={(e) => {
                    const img = e.currentTarget;
                    // 防止 fallback 無限觸發
                    if (!img.src.includes("cover_default.jpg")) {
                      img.src = "/images/cover_default.jpg";
                    }
                  }}
                  width={300}
                  height={192}
                  className="object-cover rounded-md h-48 w-full bg-gy"
                  style={{
                    opacity: 0,
                    transition: "opacity 0.4s ease",
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
