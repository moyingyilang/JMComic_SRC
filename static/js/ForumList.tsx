import ReplyIcon from "@mui/icons-material/Reply";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";
import AdComponent from "../Ads/AdComponent";
import { useDelayedFlag } from "../../Hooks";

const ForumList = (props: any) => {
  const navigate = useNavigate();
  const hasScrolled = useDelayedFlag();
  const {
    t,
    setting,
    list,
    isLoading,
    setDialogOpen,
    dialogOpen,
    logined,
    responds,
    setResponds,
    handleSendRespond,
    showReplySection,
  } = props;

  const handleGetId = (id: string) => {
    const splitId = id.split("JM")[1];
    navigate(`/comic/detail?id=${splitId}`);
  };

  return (
    <>
      {list?.length > 0
        ? list.map((d: any, i: number) => (
            <div key={i} className="bg-defaultBg dark:bg-bk dark:text-tgy">
              {i > 0 && i % 7 === 0 && (
                <div className="dark:bg-bk pt-4">
                  <div className="bg-white pt-4 p-2 dark:bg-bbk">
                    <div className="flex">
                      <img
                        src={`${setting?.img_host}/media/users/nopic-Male.gif`}
                        alt={"avatar" + i}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/ic_head.png";
                        }}
                        className="w-16 bg-gy rounded-full"
                      />
                      <div className="w-full ml-2">
                        <p className="text-og">{t("forum.sponsor_JM")}</p>
                        {t("forum.LV100_click_to_save_forbidden_comics")}
                      </div>
                    </div>
                    <div className="w-full flex flex-row">
                      <div className="w-16 flex justify-start items-center"></div>
                      <div className="ml-2">
                        {hasScrolled && !isLoading && <AdComponent adKey="app_forum_middle" />}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="dark:bg-bk pt-4">
                <div className="bg-white text-[#9f9e9e] p-4 dark:bg-bbk">
                  <div className="flex">
                    <div className="w-16 flex justify-center">
                      <img
                        src={`${setting?.img_host}/media/users/${d.photo}`}
                        alt={d.username}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/ic_head.png";
                        }}
                        width="100%"
                        height="100%"
                        className={`w-14 h-14 bg-gy ${d.photo !== "nopic-Male.gif" ? "rounded-full" : ""}`}
                      />
                    </div>
                    <div className="w-full ml-2">
                      <p className="text-og">
                        {d.nickname || d.username}
                        <span className="text-[#9f9e9e]">&nbsp;·&nbsp;{d.expinfo?.level_name}</span>
                      </p>
                      {d.expinfo?.length > 0 && (
                        <div className="w-full flex justify-between">
                          <div className="flex">
                            {d.expinfo?.badges.map((badgesItem: any, badgesIndex: number) => (
                              <img
                                key={badgesIndex}
                                src={`${setting?.img_host}${decodeURIComponent(badgesItem.content)}`}
                                alt={badgesItem.name}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/images/ic_head.png";
                                }}
                                width="100%"
                                height="auto"
                                className="w-7 h-7 mr-2 object-cover bg-gy"
                              />
                            ))}
                          </div>
                          <span className="font-black">{d.addtime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full flex flex-row">
                    <div className="w-16 flex justify-center pt-2">
                      <p>Lv.{d.expinfo.level}</p>
                    </div>
                    <div className="w-10/12 ml-2 break-words">
                      <div className="text-bbk dark:text-tgy" dangerouslySetInnerHTML={{ __html: d.content }} />
                      <div className="flex justify-between items-center mt-2">
                        <div className="">
                          {/* <FavoriteIcon className="text-og text-lg mr-1" />
                          {d.likes} */}
                        </div>
                        <button className="float-right" onClick={() => handleGetId(d.name)}>
                          {d.name}
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* sub  */}
                  {d?.replys?.length > 0
                    ? d.replys.map((reply: any, index: number) => (
                        <div key={index} className="pl-2">
                          <div key={index} className="flex mt-4">
                            <div className="w-16 flex justify-center items-center">
                              <img
                                src={`${setting?.img_host}/media/users/${reply.photo}`}
                                alt={reply.username}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/images/ic_head.png";
                                }}
                                width="100%"
                                height="auto"
                                className={`bg-gy w-10 h-10 ${reply.photo !== "nopic-Male.gif" ? "rounded-full" : ""}`}
                              />
                            </div>
                            <div className="w-full ml-2">
                              <p className="text-og">
                                {reply.nickname || reply.username}
                                <span className="text-[#9f9e9e]">&nbsp;·&nbsp;{reply.expinfo.level_name}</span>
                              </p>
                              <div className="w-full flex justify-between">
                                <div className="flex">
                                  {reply.expinfo?.badges.map((badgesItem: any, badgesIndex: number) => (
                                    <img
                                      key={badgesIndex}
                                      src={`${setting?.img_host}${decodeURIComponent(badgesItem.content)}`}
                                      alt={badgesItem.name}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/images/ic_head.png";
                                      }}
                                      width="100%"
                                      height="auto"
                                      className="w-8 h-8 mr-2 bg-gy"
                                    />
                                  ))}
                                </div>
                                <span className="font-black">{reply.addtime}</span>
                              </div>
                            </div>
                          </div>
                          <div className="w-full flex flex-row">
                            <div className="w-16 flex justify-center pt-2">
                              <p>Lv.{reply.expinfo.level}</p>
                            </div>
                            <div className="w-10/12 ml-2 break-words">
                              <div
                                className="text-bbk dark:text-tgy"
                                dangerouslySetInnerHTML={{ __html: reply.content }}
                              />
                              <div className="flex justify-between items-center mt-2">
                                <div className="">
                                  {/* <FavoriteIcon className="text-og text-lg mr-1" /> */}
                                  {/* {reply.likes} */}
                                </div>
                                <button className="float-right" onClick={() => handleGetId(reply.name)}>
                                  {reply.name}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    : ""}
                </div>
              </div>
              {showReplySection && (
                <div className="py-4 flex items-center justify-center dark:bg-nbk">
                  <input
                    type="text"
                    placeholder={t("forum.give_response")}
                    className="w-10/12 h-10 rounded-lg p-2 border-none outline-none dark:bg-bbk"
                    maxLength={200}
                    value={responds.activeIndex === i ? responds.reply : ""}
                    onChange={(e) => {
                      if (!logined) {
                        setDialogOpen({ ...dialogOpen, login: true });
                      } else {
                        setResponds((prev: any) => ({
                          ...prev,
                          activeIndex: i,
                          reply: e.target.value,
                        }));
                      }
                    }}
                  />

                  <button
                    className={`rounded-full ${
                      responds.activeIndex === i && responds.reply !== "" ? "bg-og dark:bg-og" : "bg-[#aaa] dark:bg-gy"
                    } p-2 ml-2`}
                    disabled={responds.reply === ""}
                    onClick={() => {
                      handleSendRespond(responds.reply, d.AID, d.CID);
                    }}
                  >
                    <ReplyIcon sx={{ color: "white", fontSize: 20, stroke: "white", strokeWidth: 1 }} />
                  </button>
                </div>
              )}
            </div>
          ))
        : !isLoading && <p className="text-center my-10">{t("forum.no_comments_yet")}</p>}
      {isLoading && (
        <div className="flex flex-col justify-center my-4">
          <img src="/images/loading.gif" alt="loading" width="50px" className="mx-auto" />
          <p className="text-center text-gy">{t("comic.loading")}</p>
        </div>
      )}
    </>
  );
};

export default ForumList;
