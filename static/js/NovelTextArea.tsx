import ReplayIcon from "@mui/icons-material/Replay";
import { Box, TextareaAutosize } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import { useEffect } from "react";
import { FETCH_CHECK_RECOMMEND_BN_THUNK } from "../../actions/forumAction";
import { useAppDispatch } from "../../store/hooks";

const NovelTextArea = (props: any) => {
  const {
    t,
    aid,
    ncid,
    comment_id,
    queryId,
    responds,
    setResponds,
    problem,
    userAnswer,
    setUserAnswer,
    handleRegenerateProblem,
    checkAnswer,
    showSnackbar,
  } = props;

  useEffect(() => {
    if (queryId) {
      setResponds((prev: any) => ({ ...prev, recommendBN_input: queryId }));
    }
  }, [queryId, setResponds]);

  const dispatch = useAppDispatch();

  const handleAddRecommendBN = async () => {
    const current: string[] = responds.recommendBN ?? [];
    const val = (responds.recommendBN_input ?? "").trim();

    if (!val) {
      setResponds((prev: any) => ({ ...prev, recommendBN_empty: true, recommendBN_exceed: false }));
      return;
    }
    if (current.length >= 3) {
      setResponds((prev: any) => ({ ...prev, recommendBN_exceed: true, recommendBN_empty: false }));
      return;
    }
    try {
      const result = await dispatch(FETCH_CHECK_RECOMMEND_BN_THUNK(val)).unwrap();

      if (result?.data?.status === "ok") {
        const appendText = `[ ${t("detail.recommend_book")} ${val} ]`;
        setResponds((prev: any) => ({
          ...prev,
          recommendBN: [...(prev.recommendBN ?? []), val],
          recommendBN_input: "",
          recommendBN_exceed: false,
          recommendBN_empty: false,
          comment: (prev.comment ?? "") + appendText,
          comment_id: comment_id,
          ncid: ncid,
          aid: aid,
        }));
        showSnackbar(result?.data?.msg, "success");
      } else {
        showSnackbar(result?.data?.msg ?? t("detail.book_not_found"), "error");
      }
    } catch {
      showSnackbar(t("detail.book_not_found"), "error");
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const label = t("detail.recommend_book");
    const text = e.target.value.replace(
      new RegExp(`(\\[ ${label} \\S+ \\])|(?:\\[\\s*)?${label}[^\\n]*`, "g"),
      (_, valid) => valid ?? ""
    );
    const matched = [...text.matchAll(new RegExp(`\\[ ${label} (\\S+) \\]`, "g"))].map((m) => m[1]);
    setResponds((prev: any) => ({
      ...prev,
      comment: text,
      comment_id,
      ncid,
      aid,
      recommendBN: matched,
      recommendBN_exceed: matched.length >= 3,
      recommendBN_empty: false,
    }));
  };

  return (
    <Card className="dark:bg-nbk dark:text-tgy">
      <CardContent className="">
        <Box className="w-full flex justify-end ml-auto pt-0">
          <label htmlFor="reply"></label>
          <TextareaAutosize
            value={responds.comment}
            id="reply"
            aria-label="reply textarea"
            minRows={3}
            maxLength={200}
            placeholder="分享你的想法吧"
            className="border-2 border-tgy text-base text-lgy w-full rounded-md p-1 focus:border-gray-500 focus:outline-none dark:bg-bbk"
            onChange={handleCommentChange}
          />
        </Box>
        <Box className="w-full">
          <input
            type="text"
            id="add_BN"
            value={responds.recommendBN_input ?? ""}
            maxLength={10}
            onChange={(e) => {
              const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
              setResponds((prev: any) => ({ ...prev, recommendBN_input: val }));
            }}
            placeholder={t("detail.enter_BN")}
            className="w-8/12 h-12 text-lgy text-base border-2 border-tgy rounded-md px-2 mt-2 dark:bg-bbk"
          />
          <button className="bg-og rounded-md text-white ml-2 py-2 px-5" onClick={handleAddRecommendBN}>
            {t("detail.add_BN")}
          </button>
          {responds.recommendBN_empty && <p className="text-red-500 text-sm mt-1 ml-1">{t("detail.enter_BN")}</p>}
          {responds.recommendBN_exceed && (
            <p className="text-red-500 text-sm mt-1 ml-1">{t("detail.max_recommend_three_books")}</p>
          )}
        </Box>
        {problem.problem ? (
          <Box className="flex justify-center items-center text-base pt-4">
            <p className="text-2xl">{problem.problem} =</p>
            <input
              type="text"
              id="captcha-answer"
              value={userAnswer}
              maxLength={10}
              inputMode="numeric"
              onChange={(e) => setUserAnswer(e.target.value.replace(/\D/g, ""))}
              placeholder={t("detail.enter_answer")}
              className="w-28 h-12 text-lgy text-base border-2 border-tgy rounded-md px-2 ml-2 dark:bg-bbk"
            />
            <IconButton
              aria-label="reset"
              className="rounded-full bg-gray-200 ml-2 p-1"
              onClick={handleRegenerateProblem}
            >
              <ReplayIcon className="text-2xl" />
            </IconButton>
            <button className="bg-og rounded-md text-white ml-8 py-2 px-5" onClick={() => checkAnswer()}>
              {t("detail.responds")}
            </button>
          </Box>
        ) : (
          <div className="text-center py-6 text-gray-500">Loading captcha...</div>
        )}
      </CardContent>
    </Card>
  );
};

export default NovelTextArea;
