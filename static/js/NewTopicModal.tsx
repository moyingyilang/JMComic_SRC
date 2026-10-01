import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Slide,
  Typography,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import { common } from "@mui/material/colors";
import Toolbar from "@mui/material/Toolbar";
import { TransitionProps } from "@mui/material/transitions";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FETCH_CHECK_RECOMMEND_BN_THUNK } from "../../actions/forumAction";
import { useAppDispatch } from "../../store/hooks";
import { generateMathProblem } from "../../utils/Function";
import AdComponent from "../Ads/AdComponent";
import { CaptchaAlert } from "../Alert/Alert";
import { SnackbarType } from "../Alert/PositionedSnackbar";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface NewTopicDialogProps {
  open: boolean;
  dialogOpen: any;
  setDialogOpen: React.Dispatch<React.SetStateAction<any>>;
  responds: any;
  setResponds: React.Dispatch<React.SetStateAction<any>>;
  handleSendNewTopic: () => void;
  showSnackbar: (msg: string, type?: SnackbarType) => void;
  queryId: string;
}

const NewTopicModal = ({
  open,
  dialogOpen,
  setDialogOpen,
  responds,
  setResponds,
  handleSendNewTopic,
  showSnackbar,
  queryId,
}: NewTopicDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [problem, setProblem] = useState(generateMathProblem());
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLogined, setIsLogined] = useState(true);
  const [captchaOpen, setCaptchaOpen] = useState(false);

  useEffect(() => {
    if (open && queryId) {
      setResponds((prev: any) => ({ ...prev, recommendBN_input: queryId }));
    }
  }, [open, queryId, setResponds]);

  const handleClose = (_event: React.SyntheticEvent, reason?: string): void => {
    if (reason === "backdropClick") return;
    setDialogOpen({ ...dialogOpen, newTopic: false });
  };

  const handleRegenerateProblem = () => {
    setProblem(generateMathProblem());
    setUserAnswer("");
    setIsCorrect(null);
  };

  const handleOpenCaptcha = () => {
    handleRegenerateProblem();
    setCaptchaOpen(true);
  };

  const checkAnswer = () => {
    if (userAnswer === problem.answer) {
      setIsCorrect(true);
      setCaptchaOpen(false);
      handleSendNewTopic();
      setUserAnswer("");
    } else {
      setIsCorrect(false);
      setCaptchaOpen(false);
      setUserAnswer("");
    }
  };

  const handleAddRecommendBN = async () => {
    const current: string[] = responds.recommendBN ?? [];
    const val = (responds.recommendBN_input ?? "").trim();
    if (!val) {
      setResponds({ ...responds, recommendBN_empty: true, recommendBN_exceed: false });
      return;
    }
    if (current.length >= 3) {
      setResponds({ ...responds, recommendBN_exceed: true, recommendBN_empty: false });
      return;
    }
    try {
      const result = await dispatch(FETCH_CHECK_RECOMMEND_BN_THUNK(val)).unwrap();
      if (result?.data?.status === "ok") {
        const appendText = `[ ${t("detail.recommend_book")} ${val} ]`;
        setResponds({
          ...responds,
          recommendBN: [...current, val],
          recommendBN_input: "",
          recommendBN_exceed: false,
          recommendBN_empty: false,
          newTopic: (responds.newTopic ?? "") + appendText,
        });
        showSnackbar(result?.data?.msg, "success");
      } else {
        showSnackbar(result?.data?.msg ?? t("detail.book_not_found"), "error");
      }
    } catch {
      showSnackbar(t("detail.book_not_found"), "error");
    }
  };

  const handleNewTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const label = t("detail.recommend_book");
    const text = e.target.value.replace(
      new RegExp(`(\\[ ${label} \\S+ \\])|(?:\\[\\s*)?${label}[^\\n]*`, "g"),
      (_, valid) => valid ?? ""
    );
    const matched = [...text.matchAll(new RegExp(`\\[ ${label} (\\S+) \\]`, "g"))].map((m) => m[1]);
    setResponds({
      ...responds,
      newTopic: text,
      recommendBN: matched,
      recommendBN_exceed: matched.length >= 3,
      recommendBN_empty: false,
    });
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      sx={{ "& .MuiPaper-root": { background: "#ededed" } }}
    >
      <AppBar position="sticky" className="pt-safe">
        <Toolbar className="min-h-20 bg-nbk flex justify-between items-center">
          <Button
            color="inherit"
            onClick={(e) => {
              setResponds((prev: any) => ({
                ...prev,
                newTopic: "",
                recommendBN: [],
                recommendBN_input: "",
                recommendBN_empty: false,
                recommendBN_exceed: false,
              }));
              handleClose(e);
            }}
            aria-label="close"
            sx={{ minWidth: 0, padding: 0 }}
          >
            <ArrowBackIcon sx={{ color: "white", fontSize: 24, stroke: "white", strokeWidth: 1, marginRight: 2 }} />
            <Typography className="text-lg">{t("forum.start_new_topic")}</Typography>
          </Button>
          <div className="flex items-center justify-between w-5/12">
            <div className="flex items-center">
              <Checkbox
                inputProps={{ "aria-label": "spoilers checkbox" }}
                checked={responds.spoilers}
                sx={{
                  color: common.white,
                  "&.Mui-checked": { color: common.white },
                  "& .MuiSvgIcon-root": { fontSize: 22 },
                }}
                onClick={() => setResponds({ ...responds, spoilers: !responds.spoilers })}
              />
              <Typography className="text-lg">{t("forum.spoiler_alert")}</Typography>
            </div>
            <Button
              className={`text-lg ${responds.newTopic !== "" ? "text-og" : "text-white"}`}
              disabled={responds.newTopic === ""}
              onClick={handleOpenCaptcha}
            >
              {t("forum.publish")}
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <List className="text-gy">
        <ListItem className="flex flex-col items-start">
          <Box className="w-full flex items-center">
            <input
              type="text"
              value={responds.recommendBN_input ?? ""}
              maxLength={10}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                setResponds({ ...responds, recommendBN_input: val });
              }}
              placeholder={t("detail.enter_BN")}
              className="w-8/12 h-12 text-lgy text-base border-2 border-tgy rounded-md px-2"
            />
            <button className="bg-og rounded-md text-white ml-2 py-2 px-5" onClick={handleAddRecommendBN}>
              {t("detail.add_BN")}
            </button>
          </Box>
          {responds.recommendBN_empty && <p className="text-red-500 text-sm mt-1 ml-1">{t("detail.add_BN")}</p>}
          {responds.recommendBN_exceed && (
            <p className="text-red-500 text-sm mt-1 ml-1">{t("detail.max_recommend_three_books")}</p>
          )}
        </ListItem>
        <ListItem className="">
          <textarea
            className="bg-defaultBg text-lg w-full h-screen outline-none py-3"
            placeholder={t("forum.saySomething")}
            maxLength={200}
            value={responds.newTopic}
            onChange={handleNewTopicChange}
          ></textarea>
        </ListItem>
      </List>
      <div className="fixed bottom-14 left-0 right-0">
        <AdComponent adKey="app_forum_new_theme_bottom" />
      </div>

      <Dialog
        open={captchaOpen}
        onClose={() => setCaptchaOpen(false)}
        sx={{ "& .MuiPaper-root": { width: "90%", maxWidth: "90%" } }}
      >
        <DialogTitle className="text-center">{t("detail.enter_answer")}</DialogTitle>
        <DialogContent>
          {problem.problem && (
            <Box className="flex justify-center items-center gap-2 py-2">
              <Typography className="text-2xl">{problem.problem} =</Typography>
              <input
                type="text"
                value={userAnswer}
                maxLength={10}
                inputMode="numeric"
                autoFocus
                onChange={(e) => setUserAnswer(e.target.value.replace(/\D/g, ""))}
                placeholder={t("detail.enter_answer")}
                className="w-24 h-12 text-lgy text-base border-2 border-tgy rounded-md px-2"
              />
              <IconButton className="rounded-full bg-gray-200 p-1" onClick={handleRegenerateProblem}>
                <ReplayIcon />
              </IconButton>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="flex justify-center pb-4 gap-4">
          <Button className="bg-tgy text-nbk rounded-md px-6" onClick={() => setCaptchaOpen(false)}>
            {t("member.cancel")}
          </Button>
          <Button className="bg-og text-white rounded-md px-6" onClick={checkAnswer}>
            {t("member.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      {(!isLogined || (!isCorrect && isCorrect !== null)) && (
        <CaptchaAlert
          isLogined={isLogined}
          setIsLogined={setIsLogined}
          isCorrect={isCorrect}
          setIsCorrect={setIsCorrect}
          setUserAnswer={setUserAnswer}
        />
      )}
    </Dialog>
  );
};

export default NewTopicModal;
