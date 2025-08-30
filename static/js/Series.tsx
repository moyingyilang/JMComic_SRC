import { Link } from "react-router-dom";

const Series = (props: any) => {
  const { t, queryId, seriesGroups, setSeriesGroups, msgOpen, handlerReadStorage, readHistory, setDialogOpen } = props;

  return (
    <>
      <div className="p-3 text-gy">
        {seriesGroups.menus.length > 0 ? (
          seriesGroups.menus.map((d: any, i: number) => (
            <div key={i}>
              <p
                className={`flex border-[1px] border-solid border-[#ccc] rounded-md p-3 mb-4 ${
                  seriesGroups.episode === i ? "bg-og text-white" : msgOpen?.detailDownload ? "bg-defaultBg" : ""
                }`}
                onClick={() => {
                  setSeriesGroups((prev: any) => ({
                    ...prev,
                    episode: i,
                  }));
                }}
              >
                {t("detail.episode_prefix")}
                {d[0].sort}
                {t("detail.episode_suffix")}~{t("detail.episode_prefix")}
                {Math.ceil(d[0].sort / 10) * 10}
                {t("detail.episode_suffix")}
              </p>
              {seriesGroups.episode === i && (
                <div className="grid grid-cols-2 gap-2 my-2 mb-10">
                  {d.map((item: any, index: number) =>
                    !msgOpen?.detailDownload ? (
                      <Link
                        key={index}
                        to={`/comic/detail/read?id=${queryId}&readId=${item.id}&episode=${i}&subEpisode=${item.sort}`}
                        onClick={() => {
                          handlerReadStorage(String(item.id));
                          setSeriesGroups((prev: any) => ({
                            ...prev,
                            subEpisode: item.sort,
                            currentChapterId: item.id,
                          }));
                          setDialogOpen((prev: any) => ({ ...prev, series: false }));
                        }}
                      >
                        <p
                          className={`flex border-[1px] border-solid border-[#bbb] rounded-md p-3 
                            ${
                              seriesGroups.subEpisode === item.sort
                                ? "bg-og text-white"
                                : readHistory.includes(item.id)
                                ? "bg-white text-og"
                                : ""
                            }
                                `}
                        >
                          {t("detail.episode_prefix")}
                          {item.sort}
                          {t("detail.episode_suffix")}&nbsp;{item.name}
                        </p>
                      </Link>
                    ) : (
                      <Link
                        key={index}
                        to={`/comic/detail/download?id=${item.id}`}
                        onClick={() => {
                          setSeriesGroups((prev: any) => ({
                            ...prev,
                            subEpisode: item.sort,
                            currentChapterId: item.id,
                          }));
                        }}
                      >
                        <p
                          className={`flex border-[1px] border-solid border-[#bbb] rounded-md p-3 ${
                            seriesGroups.subEpisode === item.sort ? "bg-og text-white" : ""
                          }`}
                        >
                          {t("detail.episode_prefix")}
                          {item.sort}
                          {t("detail.episode_suffix")}&nbsp;{item.name}
                        </p>
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center my-8">{t("detail.no_more_chapters")}</p>
        )}
      </div>
    </>
  );
};

export default Series;
