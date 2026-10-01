import DraftsIcon from "@mui/icons-material/Drafts";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FETCH_SUPPORT_REPORT_THUNK, FETCH_SUPPORT_REPORT＿IMAGE_THUNK } from "../../actions/contactAction";
import {
  FETCH_GET_NOTIFICATIONS_LIST_THUNK,
  FETCH_NOTIFICATIONS_UNREAD_THUNK,
  FETCH_POST_NOTIFICATIONS_THUNK,
} from "../../actions/memberAction";
import { useGlobalConfig } from "../../GlobalContext";
import { useScrollToTop } from "../../Hooks";
import { CLEAR_CONTACT_LIST, LOAD_CONTACT_LIST } from "../../reducers/contactReducer";
import { CLEAR_MEMBER_LIST, LOAD_MEMBER_LIST } from "../../reducers/memberReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { formatDate } from "../../utils/Function";
import ClickPagination from "../Common/ClickPagination";
import DialogModal from "../Modal/DialogModal";

const NotificationList = (props: any) => {
  const { t, memberInfo, logined, unread, unreadCount, openIndex, setOpenIndex } = props;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const scrollToTop = useScrollToTop();
  const { config } = useGlobalConfig();
  const { paginationMode } = config;
  const { isLoading, notificationList } = useAppSelector((state) => state.member);
  const { supportReportList, isLoading: supportReportListIsLoading } = useAppSelector((state) => state.contact);
  const [page, setPage] = useState(() => Number(sessionStorage.getItem("notificationLoadMore")) || 1);
  type TabKey = "all" | "comic_follow" | "site_notice";
  const [tab, setTab] = useState<TabKey>("all");
  const [dialogOpen, setDialogOpen] = useState({ notifAds: false, feedbackDetail: false, contactImg: false });
  const typePageLimit = tab !== "all" ? unread[tab] : unreadCount;
  const pageLimit = typePageLimit > 0 ? Math.ceil(typePageLimit / 20) : 1;
  const hasNextPage = page < pageLimit && pageLimit > 1;
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const [subType, setSubType] = useState("");
  const [contactImgUrl, setContactImgUrl] = useState("");

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
    if (!isLoadMore) {
      scrollToTop();
    }
    dispatch(LOAD_MEMBER_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    setTimeout(() => {
      dispatch(FETCH_GET_NOTIFICATIONS_LIST_THUNK({ type, page }));
    }, time);
  };

  useEffect(() => {
    if (logined && !notificationList.list?.length) {
      loadList();
    }
  }, [logined, notificationList.list?.length]);

  useEffect(() => {
    if (searchParams.get("subType") === "feedback_history") {
      setSubType("feedback_history");
      setOpenIndex(null);
      loadSubList(false, false, 0, 1);
    }
  }, [searchParams]);

  // GetSubList
  const loadSubList = (
    isLoadMore: boolean = false,
    isRefreshing: boolean = false,
    time: number = 0,
    page: number = 1
  ) => {
    if (isRefreshing) {
      setPage(1);
      dispatch(CLEAR_CONTACT_LIST("supportReportList"));
    }
    if (!isLoadMore) {
      scrollToTop();
    }
    dispatch(LOAD_CONTACT_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    setTimeout(() => {
      dispatch(FETCH_SUPPORT_REPORT_THUNK({ action: "list", page }));
    }, time);
  };

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
    sessionStorage.setItem("notificationLoadMore", String(nextPage));
    loadList(true, false, 1000, tab, nextPage);
  };

  const handleListLoadMore = (nextPage: number) => {
    loadSubList(true, false, 1000, nextPage);
  };

  // click pagination
  const goToPage = (value: number) => {
    const targetPage = Math.min(Math.max(value, 1), pageLimit);
    setPage(targetPage);
    sessionStorage.setItem("notificationLoadMore", String(targetPage));
    loadList(false, false, 0, tab, targetPage);
  };

  const goToSupportPage = (value: number) => {
    const supportPageLimit = supportReportList.pagination?.total_pages || 1;
    const targetPage = Math.min(Math.max(value, 1), supportPageLimit);
    loadSubList(false, false, 0, targetPage);
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

  const handleViewDetail = async (d: any) => {
    setIsDetailLoading(true);
    try {
      const result = await dispatch(
        FETCH_SUPPORT_REPORT_THUNK({ action: "detail", feedback_id: String(d.feedback_id) })
      ).unwrap();
      if (result.code === 200) {
        setSelectedFeedback(result.data ?? d);

        const imgUrl = result.data.attachments?.[0]?.url;
        const srid = imgUrl ? new URL(imgUrl).searchParams.get("srid") : null;

        if (srid) {
          setIsImageLoading(true);
          getImageUrl(srid);
        }
      }
    } catch (error) {
      setSelectedFeedback(d);
    } finally {
      setIsDetailLoading(false);
    }
    setDialogOpen({ ...dialogOpen, feedbackDetail: true });
  };

  const getImageUrl = async (srid: string) => {
    const result = await dispatch(FETCH_SUPPORT_REPORT＿IMAGE_THUNK({ action: "image", srid })).unwrap();
    setContactImgUrl(result.data || "");
    setIsImageLoading(false);
  };

  return (
    <>
      <div className="w-full text-bbk dark:bg-bbk dark:text-tgy">
        <div className="bg-white p-4 dark:bg-bbk">
          {/* 第一層 */}
          <div className="flex">
            {[
              { title: "全部", name: "all" },
              { title: t("member.comic_follow"), name: "comic_follow" },
              { title: t("member.site_notice"), name: "site_notice" },
            ].map((d: any, i: number) => (
              <ul key={d.name} className={`shrink-0 transition-colors duration-300 ${tab === d.name ? "text-og" : ""}`}>
                <li
                  className="mx-4 flex cursor-pointer items-center space-x-2 py-2"
                  onClick={() => {
                    setTab(d.name);
                    setOpenIndex(null);
                    setPage(1);

                    if (d.name !== "all") {
                      setSubType("");
                    }
                  }}
                >
                  <span>{d.title}</span>

                  {unreadCount > 0 && i === 0 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-sm text-white">
                      {unreadCount}
                    </span>
                  )}

                  {unread.comic_follow > 0 && i === 1 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-sm text-white">
                      {unread.comic_follow}
                    </span>
                  )}

                  {unread.site_notice > 0 && i === 2 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-sm text-white">
                      {unread.site_notice}
                    </span>
                  )}
                </li>

                {tab === d.name && (
                  <motion.div
                    layoutId="tab-underline"
                    className="mx-4 h-1 rounded bg-og"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </ul>
            ))}
          </div>
          {/* 第二層 */}
          {tab === "all" && (
            <ul className="mt-3 flex gap-5 border-t border-gray-100 pt-2 dark:border-gray-700">
              {[
                { title: t("member.feedback_history"), name: "feedback_history" },
                { title: t("member.feedback_issues"), name: "feedback_issues" },
              ].map((sub: any) => (
                <li
                  key={sub.name}
                  className={`relative cursor-pointer px-2 py-2 text-base transition-colors ${
                    subType === sub.name ? "text-og" : "text-gray-500 dark:text-gray-400"
                  }`}
                  onClick={() => {
                    setSubType(sub.name);
                    setOpenIndex(null);
                    if (sub.name === "feedback_history") {
                      loadSubList(false, false, 1000, 1);
                    } else {
                      navigate("/contact");
                    }
                  }}
                >
                  {sub.title}

                  {subType === sub.name && (
                    <motion.div
                      layoutId="sub-tab-underline"
                      className="absolute bottom-0 left-0 h-0.5 w-full rounded bg-og"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {notificationList.list?.length > 0 &&
          notificationList.list.map(
            (d: any, i: number) =>
              (tab === "all" || d.type === tab) &&
              subType === "" && (
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
                                  if (!memberInfo.ad_free) {
                                    setDialogOpen({ ...dialogOpen, notifAds: true });
                                  }
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
        {tab === "all" &&
          subType !== "" &&
          (supportReportList?.list || []).map((d: any) => (
            <div key={d.feedback_id} className="my-1 w-full border-b-4 border-[#f1f1f1] bg-white px-4 py-3 dark:bg-nbk">
              {/* 第一行：客服單號 + 日期 */}
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#222] dark:text-tgy">
                  {t("contact.detail.feedback_id_label")} #{d.feedback_id}
                </span>

                <span className="text-sm text-[#999]">{formatDate(d.created_at)}</span>
              </div>

              {/* 第二行：狀態 */}
              <div className={`mt-1 text-sm ${d.status === "replied" ? "text-green-600" : "text-red-500"}`}>
                {d.status_text}
              </div>

              {/* 第三行：問題內容 + 詳情 */}
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 break-words text-[15px] leading-5 text-[#333]">{d.description}</p>
                </div>

                <button
                  type="button"
                  className="flex shrink-0 items-center justify-center rounded-md bg-[#ff7900] px-4 py-2 text-sm text-white disabled:opacity-70"
                  onClick={() => handleViewDetail(d)}
                >
                  {t("contact.detail.view_detail_button")}
                </button>
              </div>
            </div>
          ))}
        {subType === "" ? (
          <div className="flex justify-center mt-10 pb-48">
            {isLoading && <img src="/images/loading.gif" alt="loading" width="80px" />}
            {!isLoading &&
              notificationList.list?.length > 0 &&
              (paginationMode === "click" ? (
                <ClickPagination pageLimit={pageLimit} page={page} onChange={goToPage} loading={isLoading} />
              ) : hasNextPage ? (
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
        ) : (
          <div className="flex justify-center mt-10 pb-48">
            {supportReportListIsLoading && <img src="/images/loading.gif" alt="loading" width="80px" />}
            {!supportReportListIsLoading &&
              (paginationMode === "click" ? (
                <ClickPagination
                  pageLimit={supportReportList.pagination?.total_pages || 1}
                  page={supportReportList.pagination?.page || 1}
                  onChange={goToSupportPage}
                  loading={supportReportListIsLoading}
                />
              ) : supportReportList.pagination?.total_pages > 1 ? (
                <button
                  onClick={() => handleListLoadMore(supportReportList.pagination.page + 1)}
                  className="w-11/12 rounded-sm text-white p-2 bg-og shadow-lg shadow-stone-700/50"
                >
                  {t("comic.load_more")}
                </button>
              ) : (
                <p className="text-center mt-10">{t("comic.end_of_list")}</p>
              ))}
          </div>
        )}
      </div>
      {isDetailLoading && (
        <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gy z-50">
          <img src="/images/loading.gif" alt="loading" width="80px" />
          <p>{t("comic.loading")}</p>
        </div>
      )}
      {(dialogOpen.notifAds || dialogOpen.feedbackDetail || dialogOpen.contactImg) && (
        <DialogModal
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          selectedFeedback={selectedFeedback}
          contactImgUrl={contactImgUrl}
          setContactImgUrl={setContactImgUrl}
          setIsImageLoading={setIsImageLoading}
          isImageLoading={isImageLoading}
        />
      )}
    </>
  );
};

export default NotificationList;
