import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { Box } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FETCH_FORUM_DELETE_THUNK, FETCH_FORUM_SEND_THUNK } from "../../actions/forumAction";
import { useGlobalConfig } from "../../GlobalContext";
import { useScrollToTop } from "../../Hooks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { generateMathProblem } from "../../utils/Function";
import AdComponent from "../Ads/AdComponent";
import { CaptchaAlert } from "../Alert/Alert";
import ClickPagination from "../Common/ClickPagination";
import NovelTextArea from "../Novels/NovelTextArea";
interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: "rotate(0deg)",
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: "rotate(180deg)",
      },
    },
  ],
}));

const ForumList = (props: any) => {
  const {
    t,
    setting,
    memberInfo,
    list,
    isLoading,
    responds,
    setResponds,
    page,
    setPage,
    loadList,
    showSnackbar,
    section,
    pageStorageKey,
    mode = "all",
    showPagination = true,
    pageSize = 10,
    scrollTarget,
  } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { config } = useGlobalConfig();
  const { paginationMode } = config;
  const scrollToTop = useScrollToTop();
  const searchParams = new URLSearchParams(location.search);
  const queryId = searchParams.get("id") || "";
  const comicId = location.pathname?.includes("detail") ? queryId : "";
  const [replyExpanded, setReplyExpanded] = useState<{ [key: number | string]: boolean }>({});
  const [problem, setProblem] = useState(generateMathProblem());
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLogined, setIsLogined] = useState<boolean>(true);
  const { ref, inView } = useInView();
  const { forumList, isLoadMore } = useAppSelector((state) => state.forum);
  const pageLimit = forumList.total ? Math.ceil(Number(forumList.total) / pageSize) : 0;
  const hasNextPage = page < pageLimit && pageLimit > 1;
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    comment_id: string;
    aid: string;
    bid: string;
    nid: string;
  }>({
    open: false,
    comment_id: "",
    aid: "",
    bid: "",
    nid: "",
  });

  const handleGetId = (id: string) => {
    const splitId = id.split("JM")[1];
    if (queryId === splitId) return;
    navigate(`/comic/detail?id=${splitId}`);
  };

  // reply
  const handleSendRespond = async () => {
    const { comment, comment_id, aid } = responds;
    if (comment !== "" && comment_id !== "") {
      const result = await dispatch(FETCH_FORUM_SEND_THUNK({ comment, aid, comment_id })).unwrap();
      if (result.code === 200) {
        const { msg, status } = result.data;
        const type = status !== "ok" ? "error" : "success";
        showSnackbar(msg, type);
        loadList(false, false, mode, 0, page);
        setResponds((prev: any) => ({
          ...prev,
          comment: "",
          comment_id: "",
          aid: "",
          ncid: "",
          recommendBN: [],
          recommendBN_input: "",
          recommendBN_exceed: false,
          recommendBN_empty: false,
        }));
      }
    }
  };

  const handleOpenDeleteConfirm = (comment_id: string, aid: string, bid: string, nid: string) => {
    setDeleteConfirm({ open: true, comment_id, aid, bid, nid });
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirm({ open: false, comment_id: "", aid: "", bid: "", nid: "" });
  };

  const handleDeteleComment = async () => {
    const { comment_id, aid, bid, nid } = deleteConfirm;
    const result = await dispatch(FETCH_FORUM_DELETE_THUNK({ comment_id, aid, bid, nid })).unwrap();
    handleCloseDeleteConfirm();
    if (result.code === 200) {
      const { msg, status } = result.data;
      const type = status !== "ok" ? "error" : "success";
      showSnackbar(msg, type);
      loadList(false, false, mode, 0, page);
    }
  };

  const handleRegenerateProblem = () => {
    const newProblem = generateMathProblem();
    setProblem(newProblem);
    setUserAnswer("");
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    if (userAnswer === problem.answer) {
      setIsCorrect(true);
      handleSendRespond();
      setUserAnswer("");
    } else {
      setIsCorrect(false);
      setUserAnswer("");
    }
  };

  // 切换展开状态
  const toggleReplyExpanded = (cardIndex: number, replyAreaOpen: boolean) => {
    setReplyExpanded((prev) => ({
      ...prev,
      [cardIndex]: !prev[cardIndex],
      replyArea: replyAreaOpen,
    }));
  };

  const renderContent = (content: string) => {
    if (!content) return null;
    const bnLabel = "(?:我推薦這本書|我推荐这本书)";
    const parts = content.split(new RegExp(`(\\[ ${bnLabel} \\S+ \\])`, "g"));
    return parts.map((part, i) => {
      const match = part.match(new RegExp(`^\\[ ${bnLabel} (\\S+) \\]$`));
      if (match) {
        const id = match[1].replace(/^JM/i, "");
        return (
          <Link
            key={i}
            to={`/comic/detail?id=${id}`}
            onClick={() => sessionStorage.setItem("relatedQuery", queryId)}
            className="text-og cursor-pointer"
          >
            {part}
          </Link>
        );
      }
      return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  // load more
  const loadListRef = useRef(loadList);
  useEffect(() => {
    loadListRef.current = loadList;
  });

  const isFetchingRef = useRef(false);
  useEffect(() => {
    if (!isLoadMore) isFetchingRef.current = false;
  }, [isLoadMore]);

  const loadMore = useCallback(() => {
    if (!inView || !hasNextPage || isLoadMore || isFetchingRef.current) return;
    isFetchingRef.current = true;
    const nextPage = page + 1;
    setPage(nextPage);
    if (pageStorageKey) sessionStorage.setItem(pageStorageKey, String(nextPage));
    loadListRef.current(true, false, mode, 1000, nextPage);
  }, [inView, hasNextPage, isLoadMore, page, setPage, mode]);

  const loadMoreRef = useRef(loadMore);
  useEffect(() => {
    loadMoreRef.current = loadMore;
  });
  useEffect(() => {
    loadMoreRef.current();
  }, [inView]);

  // click pagination
  const goToPage = (value: number) => {
    const targetPage = Math.min(Math.max(value, 1), pageLimit);
    setPage(targetPage);
    if (pageStorageKey) sessionStorage.setItem(pageStorageKey, String(targetPage));
    loadListRef.current(false, false, mode, 0, targetPage);
    //blogDetail target
    if (scrollTarget?.current) {
      scrollTarget.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
      {section !== "forum" && paginationMode === "click" && isLoading && (
        <div className="flex justify-center py-6">
          <img src="/images/loading.gif" alt="loading" width="80px" />
        </div>
      )}
      {list?.length > 0
        ? list.map((d: any, i: number) => (
            <div key={d.nickname + i} className="text-base mx-2 mt-3">
              {i > 0 && i % 7 === 0 && (
                <Card className="dark:bg-nbk dark:text-tgy my-3">
                  <CardHeader
                    className="flex justify-center items-start pb-0"
                    avatar={
                      <Avatar aria-label="recipe" sx={{ width: 45, height: 45 }}>
                        <img src={`${setting?.img_host}/media/users/nopic-Male.gif`} alt={"avatar" + i} />
                      </Avatar>
                    }
                    title={<Box className="text-base text-og">{t("forum.sponsor_JM")}</Box>}
                    subheader={
                      <Box className="mt-1 text-base dark:text-tgy">
                        {t("forum.LV100_click_to_save_forbidden_comics")}
                      </Box>
                    }
                  />
                  <div className="bg-white py-4 p-2 dark:bg-nbk">
                    <div className="w-full flex justify-center flex-row">
                      <AdComponent adKey="app_forum_middle" comicId={comicId} />
                    </div>
                  </div>
                </Card>
              )}
              <div>
                <div key={d.nickname + i}>
                  <Card className="dark:bg-nbk dark:text-tgy my-3">
                    <CardHeader
                      className="flex justify-center items-start pb-0"
                      avatar={
                        <Box className="flex flex-col items-center">
                          <Avatar aria-label="recipe" sx={{ width: 45, height: 45 }}>
                            <img
                              src={`${setting?.img_host}/media/users/${d.photo}`}
                              alt={d.nickname}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/ic_head.png";
                              }}
                              width="100%"
                              height="100%"
                              className="bg-gy"
                            />
                          </Avatar>
                          <Typography variant="body2" className="mt-1 text-base text-lgy dark:text-tgy">
                            Lv.{d.expinfo.level}
                          </Typography>
                        </Box>
                      }
                      action={
                        d.UID === memberInfo?.uid ? (
                          <IconButton
                            aria-label="settings"
                            className="text-og text-sm"
                            onClick={() => handleOpenDeleteConfirm(d.CID, d.AID || "", d.BID || "", d.NID || "")}
                          >
                            <RemoveCircleIcon className="text-base" />
                            {t("member.delete")}
                          </IconButton>
                        ) : undefined
                      }
                      title={
                        <Box className="flex items-center text-base">
                          <p className="text-og font-bold">{d.nickname}</p>
                          <span className="text-lgy dark:text-tgy">&nbsp;·&nbsp;{d.expinfo.level_name}</span>
                        </Box>
                      }
                      subheader={
                        <Box>
                          <p className="dark:text-tgy">{d.addtime}</p>
                          <Box className="mt-2 flex items-center">
                            {d.expinfo.badges?.map((badge: any, badgeIndex: number) => (
                              <img
                                key={badgeIndex}
                                src={setting?.img_host + badge.content}
                                alt={badge.name}
                                className="w-8 h-8 rounded-full mr-1"
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                    <CardContent className="w-[82%] text-gy text-lg flex justify-start ml-auto py-0 dark:text-tgy">
                      <div className="w-[80%] break-words whitespace-pre-wrap">{renderContent(d?.content)}</div>
                    </CardContent>
                    <button
                      className="text-gy text-sm flex justify-end ml-auto pr-5 dark:text-tgy"
                      onClick={() => handleGetId(d.name)}
                    >
                      {d.name}
                    </button>
                    <CardActions disableSpacing className="pl-20">
                      <IconButton
                        aria-label="add reply"
                        className="text-base dark:text-og"
                        onClick={() => toggleReplyExpanded(i, true)}
                      >
                        {t("novel.reply")}
                      </IconButton>
                      {d.replys?.length > 0 && (
                        <>
                          <IconButton
                            aria-label="more reply"
                            className="text-base dark:text-og"
                            onClick={() => toggleReplyExpanded(i, false)}
                          >
                            {t("novel.more_replies")}
                          </IconButton>
                          <ExpandMore
                            expand={replyExpanded[i]}
                            onClick={() => toggleReplyExpanded(i, false)}
                            aria-expanded={replyExpanded[i]}
                            aria-label="show more"
                          >
                            <ExpandMoreIcon className="dark:text-og" />
                          </ExpandMore>
                        </>
                      )}
                    </CardActions>
                    <Collapse in={replyExpanded[i]} timeout="auto" unmountOnExit>
                      {/* reply */}
                      {replyExpanded[i] && replyExpanded["replyArea"] && (
                        <NovelTextArea
                          t={t}
                          queryId={queryId}
                          ncid=""
                          aid={d.AID}
                          comment_id={d.CID}
                          responds={responds}
                          setResponds={setResponds}
                          problem={problem}
                          userAnswer={userAnswer}
                          setUserAnswer={setUserAnswer}
                          handleRegenerateProblem={handleRegenerateProblem}
                          checkAnswer={checkAnswer}
                          showSnackbar={showSnackbar}
                        />
                      )}
                      {/*more reply */}
                      {d.replys?.length > 0 &&
                        replyExpanded[i] &&
                        !replyExpanded["replyArea"] &&
                        d.replys.map((item: any, index: any) => (
                          <Card key={index} className="w-[95%] ml-auto shadow-none dark:bg-nbk dark:text-tgy">
                            <CardHeader
                              className="flex justify-center items-start pb-0"
                              avatar={
                                <Box className="flex flex-col items-center">
                                  <Avatar aria-label="recipe" sx={{ width: 35, height: 35 }}>
                                    <img
                                      src={`${setting?.img_host}/media/users/${item.photo}`}
                                      alt={item.nickname}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/images/ic_head.png";
                                      }}
                                      width="100%"
                                      height="100%"
                                      className="bg-gy"
                                    />
                                  </Avatar>
                                  <Typography variant="body2" className="mt-1 text-sm text-lgy dark:text-tgy">
                                    Lv.{item.expinfo.level}
                                  </Typography>
                                </Box>
                              }
                              action={
                                item.UID === memberInfo?.uid ? (
                                  <IconButton
                                    aria-label="settings"
                                    className="text-og text-sm pt-1"
                                    onClick={() =>
                                      handleOpenDeleteConfirm(item.CID, d.AID || "", d.BID || "", d.NID || "")
                                    }
                                  >
                                    <RemoveCircleIcon className="text-base" />
                                    {t("member.delete")}
                                  </IconButton>
                                ) : undefined
                              }
                              title={
                                <Box className="flex items-center">
                                  <p className="text-og">{item.nickname}</p>
                                  <span className="text-lgy dark:text-tgy">&nbsp;·&nbsp;{item.expinfo.level_name}</span>
                                </Box>
                              }
                              subheader={
                                <Box>
                                  <p className="dark:text-tgy">{item.addtime}</p>
                                  <Box className="mt-2 flex items-center">
                                    {item.expinfo.badges?.map((badge: any, badgeIndex: number) => (
                                      <img
                                        key={badgeIndex}
                                        src={setting?.img_host + badge.content}
                                        alt={badge.name}
                                        className="w-8 h-8 rounded-full mr-1"
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              }
                            />
                            <CardContent className="w-[82%] text-gy text-lg flex justify-start ml-auto dark:text-tgy pt-0">
                              <div className="w-[80%] break-words whitespace-pre-wrap">
                                {renderContent(item.content)}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </Collapse>
                  </Card>
                </div>
              </div>
            </div>
          ))
        : !isLoading && <p className="text-center my-10">{t("forum.no_comments_yet")}</p>}
      {section !== "forum" && paginationMode !== "click" && isLoading && (
        <div className="flex justify-center py-6">
          <img src="/images/loading.gif" alt="loading" width="80px" />
        </div>
      )}
      {showPagination &&
        forumList.list?.length > 0 &&
        (paginationMode === "click" ? (
          <ClickPagination pageLimit={pageLimit} page={page} onChange={goToPage} loading={isLoading} />
        ) : (
          <button ref={ref} onClick={loadMore} className="w-full flex justify-center py-4">
            {hasNextPage && isLoadMore ? (
              <div className="flex items-center">
                <CircularProgress color="inherit" size={12} />
                <p className="ml-2">{t("comic.pull_to_load")}</p>
              </div>
            ) : (
              <p className="text-center">{t("comic.no_more")}</p>
            )}
          </button>
        ))}
      {(!isLogined || (!isCorrect && isCorrect !== null)) && (
        <CaptchaAlert
          isLogined={isLogined}
          setIsLogined={setIsLogined}
          isCorrect={isCorrect}
          setIsCorrect={setIsCorrect}
          setUserAnswer={setUserAnswer}
        />
      )}
      <Dialog
        open={deleteConfirm.open}
        onClose={handleCloseDeleteConfirm}
        maxWidth={false}
        PaperProps={{ sx: { width: "90vw" } }}
      >
        <DialogTitle>{t("member.delete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("snack.confirm_delete")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>{t("member.cancel")}</Button>
          <Button onClick={handleDeteleComment} color="error" autoFocus>
            {t("member.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ForumList;
