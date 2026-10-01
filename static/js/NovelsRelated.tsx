import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { Box, Popover } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Link, useNavigate } from "react-router-dom";
import { Keyboard, Pagination, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { FETCH_ADD_NOVEL_COMMENT_THUNK } from "../../actions/novelAction";
import { CommonQData } from "../../assets/JsonData";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { generateMathProblem, getRandomItems } from "../../utils/Function";
import { CaptchaAlert } from "../Alert/Alert";
import NovelTextArea from "./NovelTextArea";

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

const NovelsRelated = (props: any) => {
  const {
    t,
    config,
    nid,
    ncid,
    filter,
    showSnackbar,
    tab,
    setTab,
    relatedList,
    loadForumList,
    setDialogOpen,
    dialogOpen,
    favoriteSave,
    handleEngagementAction,
  } = props;
  const { setting, logined } = config;
  const commonQ = CommonQData();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { forumList, isLoadMore } = useAppSelector((state) => state.forum);
  const rulesContent = commonQ[2].text_section[0].content;
  const [replyExpanded, setReplyExpanded] = useState<{ [key: number | string]: boolean }>({});
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [problem, setProblem] = useState(generateMathProblem());
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLogined, setIsLogined] = useState<boolean>(true);
  const { ref, inView } = useInView();
  const [page, setPage] = useState<number>(1);
  const pageLimit = forumList.total ? Math.ceil(Number(forumList.total) / 5) : 1;
  const hasNextPage = page < pageLimit && pageLimit > 1;
  const [responds, setResponds] = useState<Record<string, any>>({
    comment: "",
    comment_id: "",
    ncid: "",
    recommendBN_input: "",
    recommendBN: [],
    recommendBN_empty: false,
    recommendBN_exceed: false,
  });
  const { items: randomItem } = getRandomItems(relatedList, 1);

  // forum area
  const loadMore = useCallback(() => {
    if (inView && page < pageLimit) {
      const nextPage = page + 1;
      loadForumList(true, false, 1000, nextPage);
      setPage(nextPage);
    }
  }, [inView]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  const hanldeSendNovelReply = async () => {
    const { comment, comment_id, ncid } = responds;
    const result = await dispatch(FETCH_ADD_NOVEL_COMMENT_THUNK({ nid, comment, comment_id, ncid })).unwrap();
    const { msg, status } = result;
    showSnackbar(msg, status !== "ok" ? "error" : "success");
    setResponds({ comment: "", comment_id: "", ncid: "" });
  };

  const handleDeteleComment = async (comment_id: string, aid: string) => {
    // const { comment_id, aid } = responds;
    // if (comment_id !== "") {
    //   const result = await dispatch(FETCH_FORUM_SEND_THUNK({ aid, comment_id })).unwrap();
    //   if (result.code === 200) {
    //     const { msg, status } = result.data;
    //     const type = status !== "ok" ? "error" : "success";
    //     showSnackbar(msg, type);
    //     setResponds((prev: any) => ({ ...prev, comment: "", comment_id: "", aid: "" }));
    //   }
    // }
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
      hanldeSendNovelReply();
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

  // const handleReport = () => {
  //   showSnackbar(`${t("novel.report")}成功`, "success");
  // };

  return (
    <>
      <div className="m-5">
        <div className="flex border-b my-4">
          <button
            className={`w-28 rounded-t-lg p-2 ${tab === 1 ? "bg-og text-white" : "text-gy dark:text-tgy"}`}
            onClick={() => setTab(1)}
          >
            {t("novel.related_novels")}
          </button>
          <button
            className={`w-28 flex justify-center items-center rounded-t-lg p-2 ${
              tab === 2 ? "bg-og text-white" : "text-gy dark:text-tgy"
            }`}
            onClick={() => setTab(2)}
          >
            <p className="pr-1">{t("detail.comments")}</p>
            {forumList.list?.length > 0 && (
              <span
                className={`rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center ${
                  tab === 2 ? "bg-white text-og" : "bg-og text-white"
                }`}
              >
                {forumList.total}
              </span>
            )}
          </button>
        </div>
        {tab === 1 && (
          <div>
            <Swiper
              slidesPerView={2}
              centeredSlides={false}
              spaceBetween={10}
              slidesPerGroupSkip={2}
              grabCursor={true}
              keyboard={{
                enabled: true,
              }}
              breakpoints={{
                769: {
                  slidesPerView: 4,
                  slidesPerGroup: 4,
                },
              }}
              scrollbar={true}
              modules={[Keyboard, Scrollbar, Pagination]}
              className="mySwiper2"
            >
              {relatedList.map((related: any, index: number) => (
                <SwiperSlide key={related.id}>
                  <div className="relative flex justify-center">
                    <Link to={`/novels/detail?nid=${related.id}&filter=${filter}`}>
                      <img
                        src={setting?.img_host + related?.image || "/images/cover_default.jpg"}
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
                        className="object-cover rounded-md"
                        style={{
                          opacity: "0",
                          transition: "opacity 0.5s ease-in-out",
                        }}
                      />
                    </Link>
                    <div
                      className="bg-[rgb(117,117,117,0.6)] absolute left-2 bottom-2 rounded p-[0.1rem]"
                      onClick={() => handleEngagementAction("like", related.id)}
                    >
                      <FavoriteIcon
                        className={`${favoriteSave.like.includes(related.id) ? "text-red-600" : "text-og"}`}
                      />
                    </div>
                    <div
                      className="bg-[rgb(117,117,117,0.6)] absolute right-2 bottom-2 rounded p-[0.1rem]"
                      onClick={() => handleEngagementAction("mark", related.id)}
                    >
                      {favoriteSave.mark.includes(related.id) ? (
                        <BookmarkIcon className="text-og" />
                      ) : (
                        <BookmarkBorderIcon className="text-2xl text-white" />
                      )}
                    </div>
                  </div>
                  <p className="truncate">{related.name}</p>
                  <p className="truncate text-og">{related.author}</p>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="flex justify-center gap-4 my-4">
              <button
                className="border border-og text-og p-2 px-3 rounded-md"
                onClick={() => navigate(`/novels/detail?nid=${randomItem[0].NID}`)}
              >
                {t("novel.random_browse")}
              </button>
              <button className="bg-og text-white p-2 px-3 rounded-md" onClick={() => navigate("/novels?filter=")}>
                {t("novel.view_more")}
              </button>
            </div>
          </div>
        )}
        {tab === 2 && (
          <div className="min-h-[200px] text-base">
            <p className="py-2">
              {commonQ[2].text_section[0].content[0].slice(0, 3)}
              <span>
                <button
                  onClick={(e) => setAnchorEl(e.currentTarget as HTMLElement)}
                  className="text-og font-bold p-0 ml-1"
                >
                  {commonQ[2].text_section[0].content[0].slice(3, 9)}
                </button>
              </span>
              {commonQ[2].text_section[0].content[0].slice(9, 30)}
            </p>
            {!logined ? (
              <div className="flex justify-center py-2">
                <button
                  className="bg-og text-base text-white py-2 px-4 rounded-md shadow-lg"
                  onClick={() => setDialogOpen({ ...dialogOpen, login: true })}
                >
                  {t("novel.login_prompt")}
                </button>
              </div>
            ) : (
              <NovelTextArea
                t={t}
                aid=""
                ncid={ncid}
                comment_id=""
                queryId={nid}
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
            <div>
              <p className="mt-2">
                {t("novel.show")}
                {forumList.list?.length}
                {t("detail.comments")}
              </p>
              {forumList.list?.length > 0 ? (
                forumList.list.map((d: any, i: number) => (
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
                          <IconButton
                            aria-label="settings"
                            className="text-og text-sm"
                            onClick={(e) => handleDeteleComment(d.CID, d.AID)}
                          >
                            <RemoveCircleIcon className="text-base" />
                            {t("novel.report")}
                          </IconButton>
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
                        <div
                          className="w-[80%] break-words whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: d?.content,
                          }}
                        />
                      </CardContent>
                      <Typography className="text-gy text-sm flex justify-end ml-auto pr-5 dark:text-tgy">
                        NVL{d.NID}
                      </Typography>
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
                            aid=""
                            ncid=""
                            comment_id={d.CID}
                            queryId={nid}
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
                                  <IconButton
                                    aria-label="settings"
                                    className="text-og text-sm pt-1"
                                    onClick={(e) => handleDeteleComment(d.CID, item.AID)}
                                  >
                                    <RemoveCircleIcon className="text-base" />
                                    {t("novel.report")}
                                  </IconButton>
                                }
                                title={
                                  <Box className="flex items-center">
                                    <p className="text-og">{item.nickname}</p>
                                    <span className="text-lgy dark:text-tgy">
                                      &nbsp;·&nbsp;{item.expinfo.level_name}
                                    </span>
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
                                <div
                                  className="w-[80%] break-words whitespace-pre-wrap"
                                  dangerouslySetInnerHTML={{
                                    __html: item.content,
                                  }}
                                />
                              </CardContent>
                            </Card>
                          ))}
                      </Collapse>
                    </Card>
                  </div>
                ))
              ) : (
                <p className="text-center text-tgy py-10 dark:bg-nbk">{t("forum.no_comments_yet")}</p>
              )}
            </div>
            <button ref={ref} onClick={loadMore} className="w-full flex justify-center pt-4">
              {forumList.list?.length > 0 &&
                (hasNextPage && isLoadMore ? (
                  <div className="flex items-center">
                    <CircularProgress color="inherit" size={12} />
                    <p className="ml-2">{t("comic.pull_to_load")}</p>
                  </div>
                ) : (
                  <p className="text-center">{t("comic.no_more")}</p>
                ))}
            </button>
            {/*rules modal  */}
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <div className="p-3 text-gy dark:text-[#bbb] dark:bg-nbk">
                <p className="border-b py-2"> {commonQ[3].text_section[0].content[0].slice(3, 9)}</p>
                <div className="py-2">
                  {rulesContent.slice(1, 10).map((d: any) => (
                    <p key={d}>{d}</p>
                  ))}
                </div>
              </div>
            </Popover>
          </div>
        )}
      </div>
      {(!isLogined || (!isCorrect && isCorrect !== null)) && (
        <CaptchaAlert
          isLogined={isLogined}
          setIsLogined={setIsLogined}
          isCorrect={isCorrect}
          setIsCorrect={setIsCorrect}
          setUserAnswer={setUserAnswer}
        />
      )}
    </>
  );
};
export default NovelsRelated;
