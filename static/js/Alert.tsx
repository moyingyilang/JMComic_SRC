import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Backdrop, Fade, Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

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

export const DownloadAlert = (props: any) => {
  const { albumDownloadDetail, isLogined, setIsLogined, isCorrect, setIsCorrect } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Backdrop sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })} open={!isCorrect || !isLogined}>
      {!isLogined ? (
        <div className="relative bg-white text-nbk w-5/6 h-44 p-5 text-2xl">
          <p>{t("login.please_login")}</p>
          <p className="w-full text-lg text-center my-5">{albumDownloadDetail?.msg}</p>
          <button
            className="absolute bottom-5 right-5 text-xl"
            onClick={() => {
              navigate(-1);
              setIsLogined(true);
            }}
          >
            OK
          </button>
        </div>
      ) : (
        <div className="relative bg-white text-nbk w-5/6 h-44 p-5 text-2xl">
          <p>{t("detail.captcha_error")}</p>
          <button className="absolute bottom-5 right-5 text-xl" onClick={() => setIsCorrect(null)}>
            OK
          </button>
        </div>
      )}
    </Backdrop>
  );
};

export const Alert = (props: any) => {
  const { edit, setEdit, handleEdit, handleAction, showSnackbar } = props;
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
                edit.type === "del" && handleEdit("del");
                if (edit.aid !== "") {
                  edit.type === "del_comic" && handleAction("mark", edit.aid);
                } else {
                  setEdit({ ...edit, edit: false, alert: false, aid: "" });
                  edit.type === "del_comic" && showSnackbar(t("member.please_select_comic"), "error");
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
  errorText: string;
  onClose: () => void;
};

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ open, errorText, onClose }) => {
  const webHost = localStorage.getItem("main_web_host") || process.env.REACT_APP_COMIC_WEB_URL;
  const { t } = useTranslation();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleWebComicClick = () => {
    window.open(webHost, "_blank");
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      // onClose={onClose}
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
