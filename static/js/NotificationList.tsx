import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  FETCH_GET_NOTIFICATIONS_LIST_THUNK,
  FETCH_NOTIFICATIONS_UNREAD_THUNK,
  FETCH_POST_NOTIFICATIONS_THUNK,
} from "../../actions/memberAction";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import DraftsIcon from "@mui/icons-material/Drafts";
import DialogModal from "../Modal/DialogModal";
import { motion } from "framer-motion";
import { CLEAR_MEMBER_LIST, LOAD_MEMBER_LIST } from "../../reducers/memberReducer";

const NotificationList = (props: any) => {
  const { t, logined, unread, unreadCount, openIndex, setOpenIndex } = props;
  const dispatch = useAppDispatch();
  const { isLoading, notificationList } = useAppSelector((state) => state.member);
  const [page, setPage] = useState(1);
  type TabKey = "all" | "comic_follow" | "site_notice";
  const [tab, setTab] = useState<TabKey>("all");
  const [dialogOpen, setDialogOpen] = useState({ notifAds: false });
  const typePageLimit = tab !== "all" ? unread[tab] : unreadCount;
  const pageLimit = typePageLimit > 0 ? Math.ceil(typePageLimit / 20) : 0;
  const hasNextPage = page < pageLimit && pageLimit > 1;

  // GetList
  const loadList = (
    isLoadMore: boolean = false,
    isRefreshing: boolean = false,
    time: number = 0,
    type: string = "all",
    page: number = 1
  ) => {
    if (isRefreshing) {
      setPage(1);
      dispatch(CLEAR_MEMBER_LIST("notificationList"));
    }
    dispatch(LOAD_MEMBER_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    setTimeout(() => {
      dispatch(FETCH_GET_NOTIFICATIONS_LIST_THUNK({ type, page }));
    }, time);
  };

  useEffect(() => {
    if (logined && notificationList.list?.length === 0) {
      loadList();
    }
  }, [logined, notificationList.list]);

  // readed
  const handleReaded = async (id: string, read: number) => {
    const result = await dispatch(FETCH_POST_NOTIFICATIONS_THUNK({ id, read: read ? 0 : 1 })).unwrap();
    if (result.code === 200) {
      loadList();
      dispatch(FETCH_NOTIFICATIONS_UNREAD_THUNK());
    }
  };

  const handleLoadMore = (nextPage: number) => {
    if (!hasNextPage) return;
    setPage(nextPage);
    loadList(true, false, 1000, tab, nextPage);
  };

  useEffect(() => {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (img.src.includes("discordapp")) {
        img.style.setProperty("width", "300px", "important");
        img.style.setProperty("height", "300px", "important");
      }
    });
  }, [notificationList, tab, openIndex]);

  return (
    <>
      <div className="w-full text-bbk dark:bg-bbk dark:text-tgy">
        <div className="flex bg-white p-4 dark:bg-bbk">
          {[
            { title: "all", name: "全部" },
            { title: "comic_follow", name: t("member.comic_follow") },
            { title: "site_notice", name: t("member.site_notice") },
          ].map((d: any, i: number) => (
            <ul key={d.title} className={`transition-colors duration-300 ${tab === d.title ? "text-og " : ""}`}>
              <li
                className="mx-4 py-2 flex items-center space-x-2"
                onClick={() => {
                  setTab(d.title);
                  setOpenIndex(null);
                  setPage(1);
                }}
              >
                <span>{d.name}</span>
                {unreadCount > 0 && i === 0 && (
                  <span className="bg-red-600 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
                {unread.comic_follow > 0 && i === 1 && (
                  <span className="bg-red-600 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center">
                    {unread.comic_follow}
                  </span>
                )}
                {unread.site_notice > 0 && i === 2 && (
                  <span className="bg-red-600 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center">
                    {unread.site_notice}
                  </span>
                )}
              </li>
              {tab === d.title && (
                <motion.div
                  layoutId="tab-underline"
                  className="h-1 bg-og rounded"
                  style={{ width: "100%" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </ul>
          ))}
        </div>
        {notificationList.list?.length > 0 &&
          notificationList.list.map(
            (d: any, i: number) =>
              (tab === "all" || d.type === tab) && (
                <div key={d.id} className="w-full bg-white p-4 my-4  dark:bg-nbk">
                  <div className="flex">
                    <img src="/images/ic_head.png" alt="ic_head" className="w-16 h-16 rounded-full" />
                    <div className="flex flex-col ml-2">
                      <p className="flex items-center">
                        <span>
                          {d.type === "site_notice" ? t("member.site_notice") : t("member.comic_follow") + "."}
                        </span>
                        <span className="ml-2">{d.date}</span>
                        <span onClick={() => handleReaded(d.id, d.read)}>
                          {d.read ? (
                            <DraftsIcon className="ml-2 text-og" />
                          ) : (
                            <MailOutlineIcon className="ml-2 text-og" />
                          )}
                        </span>
                      </p>
                      <span className="text-lg font-bold">
                        {d.type === "site_notice"
                          ? d.title
                          : `[${t("comic.seriesUpdate")}]${t("comic.notice")}${d.content.length}` + t("library.update")}
                      </span>

                      <div>
                        {openIndex === i &&
                          (Array.isArray(d.content) ? (
                            d.content.map(
                              (item: any) =>
                                d.type === "comic_follow" && (
                                  <div
                                    key={item.comicId}
                                    className="w-full overflow-hidden break-words whitespace-pre-wrap"
                                  >
                                    <span className="text-gray-400">.&nbsp;&nbsp;{item.updateDate}</span>
                                    <br />
                                    <Link to={`/comic/detail?id=${item.comicId}`} className="text-og">
                                      {item.comicTitle}
                                    </Link>
                                  </div>
                                )
                            )
                          ) : (
                            <div
                              key={d.id}
                              className="text-bbk dark:text-tgy w-full overflow-hidden break-words whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{ __html: d.content }}
                            />
                          ))}
                        <p className="mt-4">
                          <span
                            className="mr-4"
                            onClick={() => {
                              handleReaded(d.id, d.read);
                            }}
                          >
                            {d.read ? t("member.unread") + "." : t("member.read")}
                          </span>
                          {openIndex === i ? (
                            <span
                              className="text-[#bbb]"
                              onClick={() => {
                                setOpenIndex(openIndex === i ? null : i);
                              }}
                            >
                              {t("member.collapse")}
                            </span>
                          ) : (
                            <span
                              className="text-[#bbb]"
                              onClick={() => {
                                setOpenIndex(openIndex === i ? null : i);
                                if (!d.read) {
                                  handleReaded(d.id, d.read);
                                  setDialogOpen({ ...DialogModal, notifAds: true });
                                }
                              }}
                            >
                              {t("comic.see_more")}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
          )}
        <div className="flex justify-center mt-10 pb-48">
          {isLoading && <img src="/images/loading.gif" alt="loading" width="80px" />}
          {!isLoading &&
            notificationList.list?.length > 0 &&
            (hasNextPage ? (
              <button
                onClick={() => handleLoadMore(page + 1)}
                className="w-11/12 rounded-sm text-white p-2 bg-og shadow-lg shadow-stone-700/50"
              >
                {t("comic.load_more")}
              </button>
            ) : (
              <p className="text-center mt-10">{t("comic.end_of_list")}</p>
            ))}
        </div>
      </div>
      {dialogOpen.notifAds && <DialogModal dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />}
    </>
  );
};

export default NotificationList;
