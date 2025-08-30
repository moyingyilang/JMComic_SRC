import { Link } from "react-router-dom";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import AdComponent from "../../components/Ads/AdComponent";
import AdContainer from "../../components/Ads/AdsTest";
import { useGlobalConfig } from "../../GlobalContext";

const BlogsList = (props: any) => {
  const { t, setting, list, tab, hasScrolled, isBlogLoading } = props;

  const { config } = useGlobalConfig();
  const { ads } = config;
  return (
    <>
      {Array.isArray(list) &&
        list.length > 0 &&
        list.map((d, i) => (
          <div key={i}>
            {i > 0 && i % 10 === 0 && (
              <div className="bg-white m-4 p-2 dark:bg-nbk">
                <div className="flex">
                  <img
                    src={`${setting?.img_host}/media/users/nopic-Male.gif`}
                    alt="avatar"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/ic_head.png";
                    }}
                    className="rounded-full object-cover w-10 h-10 bg-gy"
                  />
                  <div className="w-full ml-2">
                    <p className="text-og">{t("forum.sponsor_JM")}</p>
                    {t("forum.LV100_click_to_save_forbidden_comics")}
                  </div>
                </div>
                <div className="h-40 pt-2">
                  <AdComponent key={i + 1 * 10} adKey="app_blogs_ten" />
                </div>
              </div>
            )}
            <div className="bg-white m-4 p-2 rounded dark:bg-nbk">
              <div className="w-full flex items-center overflow-hidden px-2 mb-2">
                <img
                  src={
                    d.user_photo !== ""
                      ? `${setting?.img_host}/media/users/${d.user_photo}`
                      : `${setting?.img_host}/media/users/nopic-Male.gif`
                  }
                  alt={d.id}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/ic_head.png";
                  }}
                  className="rounded-full object-cover w-10 h-10 bg-gy"
                />
                <p className={`ml-4 ${tab === 2 ? "w-[60%]" : "w-[90%]"}`}>{d.title}</p>
                {tab === 2 && (
                  <p className="w-[30%] text-right">
                    <SportsEsportsIcon className="text-og" sx={{ fontSize: 26 }} />
                    {t("blogs.play_directly")}
                  </p>
                )}
              </div>
              <div className="w-full overflow-hidden">
                <Link to={`/blogs/detail?tab=${tab}&id=${d.id}`}>
                  <img
                    src={setting?.img_host + d.photo}
                    alt={d.title}
                    loading="lazy"
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.opacity = "1";
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/chapter_default.jpg";
                    }}
                    className="h-80 w-full object-cover bg-gy"
                    style={{
                      opacity: "0",
                      transition: "opacity 0.5s ease-in-out",
                    }}
                  />
                </Link>
              </div>
              <div className="flex justify-between p-2 text-gy">
                <div>
                  <span className="mr-2">
                    {d.total_likes}
                    {t("blogs.likes_count")}
                  </span>
                  <span>
                    {d.total_comments}
                    {t("blogs.comments_count")}
                  </span>
                </div>
                <div>{d.date}</div>
              </div>
            </div>
          </div>
        ))}
      <div className="mb-4">
        <AdComponent key={2} adKey="app_categories_more_bottom" />
      </div>
    </>
  );
};

export default BlogsList;
