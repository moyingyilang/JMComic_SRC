import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IconButton } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import Series from "../Comic/Series";
import { useGlobalConfig } from "../../GlobalContext";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MsgModal = (props: any) => {
  const {
    t,
    logined,
    queryId,
    detailList,
    setSeriesGroups,
    seriesGroups,
    content,
    msgOpen,
    setMsgOpen,
    handleTracking,
    handleSetDontShow,
  } = props;
  const { config } = useGlobalConfig();
  const { darkMode } = config;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClose = (_event: React.SyntheticEvent, reason?: string): void => {
    // 檢查背景點擊 (backdropClick) 時不關閉視窗
    if (reason === "backdropClick") {
      return;
    }
    setMsgOpen({ ...msgOpen, search: false, detail: false, detailDownload: false, member: false, readTrack: false });
  };

  return (
    <>
      {msgOpen.search && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={msgOpen.search}
          TransitionComponent={Transition}
          className="text-white"
          sx={() => ({
            "& .MuiPaper-root": {
              paddingY: "1rem",
              width: "90%",
              background: darkMode ? "#323232" : "",
              color: darkMode ? "#d1d1d1" : "#323232",
            },
          })}
        >
          <DialogTitle className="text-center" id="customized-dialog-title">
            {content.title}
            <hr className="w-9/12 border-[#aaa] m-auto" />
          </DialogTitle>
          <DialogContent className="text-center py-0">
            <img
              src={content.image ? content.image : "/images/help_cover.png"}
              alt="help_cover"
              className="w-10/12 m-auto"
            />
            {content.text_sections.map((d: any, i: number) => (
              <div key={i}>
                <p className="font-black mt-3">{d.title}</p>
                <span>{d.content}</span>
                <span>{d.example}</span>
              </div>
            ))}
          </DialogContent>
          <DialogActions className="flex justify-center">
            <Button className="bg-og text-white rounded border-solid border-2 border-og w-8/12" onClick={handleClose}>
              {content.btn_text}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {msgOpen.detail && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={msgOpen.detail}
          TransitionComponent={Transition}
          sx={() => ({
            "& .MuiPaper-root": {
              paddingY: "1rem",
              width: "90%",
              background: darkMode ? "#323232" : "",
              color: darkMode ? "#d1d1d1" : "#323232",
            },
          })}
        >
          <DialogTitle className="text-center" id="customized-dialog-title">
            {content.title}
            <hr className="w-9/12 border-[#aaa] m-auto" />
          </DialogTitle>
          <DialogContent>
            <img src={content.image} alt="help_cover" className="w-8/12 m-auto" />
            <div>
              {content.text_sections.map((d: any, i: number) => (
                <div key={i} className="mt-2">
                  <p className="font-black">{d.title}</p>
                  <span>{d.content}</span>
                </div>
              ))}
            </div>
          </DialogContent>
          <DialogActions className="flex justify-center">
            <Button
              className="bg-og text-white rounded border-solid border-2 border-og w-8/12 text-base"
              onClick={handleClose}
            >
              {content.btn_text}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {msgOpen.detailDownload && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={msgOpen.detailDownload}
          TransitionComponent={Transition}
          sx={() => ({
            "& .MuiPaper-root": {
              // paddingY: "1rem",
              width: "90%",
              height: "60%",
            },
            "& .MuiDialogContent-root": {
              padding: 0,
            },
          })}
        >
          <DialogTitle id="customized-dialog-title">{t("detail.select_episode_to_download")}</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[900],
            })}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent>
            <Series
              t={t}
              queryId={queryId}
              detailList={detailList}
              seriesGroups={seriesGroups}
              setSeriesGroups={setSeriesGroups}
              msgOpen={msgOpen}
            />
          </DialogContent>
        </Dialog>
      )}

      {msgOpen.member && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={msgOpen.member}
          TransitionComponent={Transition}
          className="text-white"
          sx={() => ({
            "& .MuiPaper-root": {
              paddingY: "1rem",
              width: "90%",
              margin: "1rem",
            },
          })}
        >
          <DialogTitle className="text-center text-4xl text-og" id="customized-dialog-title">
            {content[0].title}
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[700],
              stroke: theme.palette.grey[700],
              strokeWidth: 2,
            })}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent sx={{ paddingTop: 0 }}>
            <div>
              {content[0].text_section.map((d: any, i: number) => (
                <div key={i} className="mt-3">
                  <div
                    className="bg-og border-1 border-solid border-og text-white text-xl flex justify-between rounded-t-lg p-4"
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  >
                    <p className="flex">
                      {Array.isArray(d.FAQ) &&
                        d.FAQ.map((q: any, index: number) => (
                          <React.Fragment key={index}>
                            {q}
                            {q.includes(t("common_q.jJar")) && <img src={content[0].list[0].img} alt="jJar" />}
                            {q.includes(t("common_q.jCharge")) && <img src={content[0].list[1].img} alt="jCharge" />}
                          </React.Fragment>
                        ))}
                    </p>
                    {openIndex === i ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </div>
                  {openIndex === i ? (
                    <p className="text-lg border border-solid border-gy border-t-og p-3">
                      {d.content.map((item: any) => (
                        <span key={item} className={`block ${i === 1 ? "text-center" : ""}`}>
                          {item}
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {msgOpen.readTrack && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={msgOpen.readTrack}
          TransitionComponent={Transition}
          className="text-white"
          sx={(theme) => ({
            "& .MuiPaper-root": {
              paddingY: "1rem",
              width: "90%",
              background: darkMode ? "#323232" : "",
              color: darkMode ? "#d1d1d1" : theme.palette.grey[500],
            },
          })}
        >
          <DialogTitle id="customized-dialog-title">{t("common_q.finalChapter")}</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            })}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent dividers className="py-10">
            {t("common_q.stayUpdated")}
          </DialogContent>
          <DialogActions className="flex justify-between items-center px-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="dontShow"
                name="dontShow"
                className="mr-1"
                onChange={(e) => handleSetDontShow(e)}
              />
              <label htmlFor="dontShow">{t("common_q.dontShow")}</label>
            </div>
            <Button
              className="bg-og text-white rounded border-solid border-2 border-og w-32"
              onClick={(e) => {
                handleTracking(queryId);
                logined && handleClose(e);
              }}
            >
              {t("common_q.followSeries")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default MsgModal;
