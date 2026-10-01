import { Backdrop, Box, Button, Fade, Modal, Typography } from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { testUrlSpeed } from "../../utils/speedTestUtil";

export const ConfirmAlert = (props: any) => {
  const { edit, setEdit, handleAction } = props;

  return (
    <Backdrop sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })} open={edit.alert}>
      <div className="relative bg-white text-nbk w-5/6 h-44 p-5 text-lg">
        <p className="text-2xl">提示</p>
        <p className="my-4">{edit.message}</p>
        <div className="w-32 flex justify-between absolute bottom-5 right-5 font-medium">
          <button onClick={() => setEdit({ ...edit, alert: false, confirm: false })}>CANCEL</button>
          <button onClick={() => handleAction(edit.id)}>OK</button>
        </div>
      </div>
    </Backdrop>
  );
};

export const CaptchaAlert = (props: any) => {
  const { albumDownloadDetail, isLogined, setIsLogined, isCorrect, setIsCorrect, setUserAnswer } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isCorrect !== false && isLogined) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50">
      {!isLogined ? (
        <div className="relative bg-white text-nbk w-5/6 min-h-44 p-5 pb-14 text-2xl">
          <p>{t("login.please_login")}</p>
          <p className="w-full text-lg text-center my-5">{albumDownloadDetail?.msg}</p>
          <button
            className="absolute bottom-5 right-5 text-xl"
            onClick={() => {
              navigate(-1);
              setIsLogined(true);
              setUserAnswer("");
            }}
          >
            OK
          </button>
        </div>
      ) : (
        <div className="relative bg-white text-nbk w-5/6 min-h-44 p-5 pb-14 text-2xl">
          <p>{t("detail.captcha_error")}</p>
          <button
            className="absolute bottom-5 right-5 text-xl"
            onClick={() => {
              setIsCorrect(null);
              setUserAnswer("");
            }}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};

export const Alert = (props: any) => {
  const { edit, setEdit, handleEdit, handleAction, handleDelWatchComic, showSnackbar } = props;
  const { type, aid } = edit;
  const { t } = useTranslation();
  return (
    <>
      <Backdrop sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })} open={edit.alert}>
        <div className="relative bg-white text-nbk w-5/6 h-44 p-5 text-lg">
          <p className="text-2xl">提示</p>
          <p className="my-4">{edit.message}</p>
          <div className="w-32 flex justify-between absolute bottom-5 right-5 font-medium">
            <button onClick={() => setEdit({ ...edit, edit: false, alert: false, confirm: false, aid: "" })}>
              CANCEL
            </button>
            <button
              onClick={() => {
                switch (type) {
                  case "del_watch_history":
                    handleDelWatchComic();
                    break;

                  case "del":
                    handleEdit("del");
                    break;

                  case "del_comic":
                    if (aid) {
                      handleAction("mark", aid);
                    } else {
                      showSnackbar(t("member.please_select_comic"), "error");
                      setEdit({ ...edit, edit: false, alert: false, aid: "" });
                    }
                    break;
                }
              }}
            >
              OK
            </button>
          </div>
        </div>
      </Backdrop>
    </>
  );
};

type ErrorAlertProps = {
  open: boolean;
  url: string;
  errorText: string;
  onClose: () => void;
};

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ open, url, errorText, onClose }) => {
  const webHost = localStorage.getItem("main_web_host") || process.env.REACT_APP_COMIC_WEB_URL;
  const { t } = useTranslation();

  const [latency, setLatency] = React.useState<number | null>(null);
  const [downloadSpeed, setDownloadSpeed] = React.useState<number | null>(null);
  const [testing, setTesting] = React.useState(false);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleWebComicClick = () => {
    window.open(webHost, "_blank");
  };

  const handleSpeedTest = async () => {
    setTesting(true);
    try {
      const result = await testUrlSpeed(url);
      setLatency(result.latency);
      setDownloadSpeed(result.downloadSpeed);
    } catch (err) {
      console.error("網路測速失敗", err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      closeAfterTransition
      slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.2)", timeout: 500 } } }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #323232",
            boxShadow: 24,
            p: 4,
            fontSize: "13px",
          }}
        >
          <Typography variant="h5">{t("http.error")}</Typography>
          <div className="whitespace-pre-wrap mt-4">{errorText}</div>
          {/* 網路測速按鈕及結果 */}
          <Box className="mt-4">
            <Button onClick={handleSpeedTest} disabled={testing} className="p-0 justify-start text-base">
              {testing ? "測速中..." : "網路測速"}
            </Button>
            <Typography className="mt-2 text-bbk">
              延遲: {latency === null ? "-" : `${latency.toFixed(0)} ms`}
              <br />
              下載: {downloadSpeed === null ? "-" : `${downloadSpeed.toFixed(2)} Mbps`}
            </Typography>
          </Box>
          <Box className="flex justify-between mt-6 gap-2">
            <Button className="text-nbk text-lg" onClick={handleWebComicClick}>
              {t("http.webpage")}
            </Button>
            <div>
              <Button className="text-nbk text-lg" onClick={onClose}>
                {t("member.cancel")}
              </Button>
              <Button className="text-nbk text-lg" onClick={handleRetry}>
                {t("http.retry")}
              </Button>
            </div>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};
