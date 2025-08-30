import React from "react";
import { Link } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import {
  Slide,
  Button,
  Typography,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  IconButton,
  Checkbox,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { common } from "@mui/material/colors";
import { useGlobalConfig } from "../../GlobalContext";
import { useTranslation } from "react-i18next";
import { useDelayedFlag } from "../../Hooks";
import AdComponent from "../Ads/AdComponent";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogModal = (props: any) => {
  const {
    queryId,
    content,
    dialogOpen,
    setDialogOpen,
    searchConfig,
    setSearchConfig,
    catList,
    setFilter,
    filter,
    responds,
    setResponds,
    handleSendRespond,
    handlerSearch,
    dailyImgs,
    handleDecensored,
    readImgSource,
  } = props;
  const { setConfig, config } = useGlobalConfig();
  const { setting } = config;
  const { t } = useTranslation();
  const more_cat = t("cat_sort.more_cat", { returnObjects: true });
  const imgSource = localStorage.getItem("imageSource");
  const showCloseBtn = useDelayedFlag(3000);

  // switch img source
  const handleChangeImageSource = (key: string) => {
    if (key === "0") {
      setConfig((prev) => ({ ...prev, express: "on", app_img_shunt: key }));
    } else {
      setConfig((prev) => ({ ...prev, app_img_shunt: key }));
    }
    localStorage.setItem("imageSource", key);
  };

  const handleClose = (_event: React.SyntheticEvent, reason?: string): void => {
    _event.preventDefault();
    // 檢查背景點擊 (backdropClick) 時不關閉視窗
    if (reason === "backdropClick") {
      return;
    }
    setDialogOpen({
      ...dialogOpen,
      imageSource: false,
      search: false,
      readSource: false,
      catMore: false,
      newTopic: false,
      notifAds: false,
      dailyImg: false,
      buyComic: false,
      watchAds: false,
    });
  };

  return (
    <>
      {(dialogOpen.imageSource || dialogOpen.readSource) && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.imageSource || dialogOpen.readSource}
          TransitionComponent={Transition}
          sx={(theme) => ({
            "& .MuiPaper-root": {
              width: "90%",
              backgroundColor: theme.palette.grey[900],
              borderRadius: dialogOpen.readSource ? "2rem" : "",
              background: dialogOpen.readSource ? "#3f3f3f" : "",
            },
          })}
        >
          <DialogTitle sx={{ m: 0, p: 2 }} className="text-white text-center" id="customized-dialog-title">
            {dialogOpen.imageSource && t("modal.enhance_experience")}
            {dialogOpen.readSource && t("setting.switch_image_source")}
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[100],
            })}
          >
            <CloseIcon />
          </IconButton>
          {dialogOpen.imageSource && (
            <>
              <DialogContent dividers>
                <Typography gutterBottom className="grid grid-cols-4 gap-4 p-2 text-white text-center">
                  {Array.isArray(setting.app_shunts) &&
                    setting.app_shunts.map((d: any) => (
                      <span
                        key={d.key}
                        className={`border-[1px] border-og py-3 rounded 
                    ${(Number(imgSource) || 1) === d.key ? "bg-og" : ""}`}
                        onClick={(e) => {
                          handleChangeImageSource(d.key.toString());
                          handleClose(e);
                        }}
                      >
                        {d.title}
                      </span>
                    ))}
                </Typography>
              </DialogContent>
              <DialogActions className="flex justify-center mb-4">
                <Button className="bg-og text-white rounded border-solid border-2 border-og px-6" onClick={handleClose}>
                  {t("modal.i_feel_fast_now")}
                </Button>
              </DialogActions>
            </>
          )}
          {dialogOpen.readSource && (
            <DialogContent>
              <AdComponent adKey="app_chapter_next" />
              {Array.isArray(readImgSource) &&
                readImgSource.map((d: any) => (
                  <Button
                    key={d.key}
                    className={`w-full text-white rounded border-solid border-2 border-og mt-4 
                   ${(Number(imgSource) || 1) === d.key ? "bg-og" : ""}`}
                    onClick={(e) => {
                      handleChangeImageSource(d.key.toString());
                      handleClose(e);
                    }}
                  >
                    {d.title}
                  </Button>
                ))}
            </DialogContent>
          )}
        </Dialog>
      )}

      {dialogOpen.search && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.search}
          TransitionComponent={Transition}
          sx={(theme) => ({
            "& .MuiPaper-root": {
              width: "90%",
              backgroundColor: theme.palette.grey[900],
            },
          })}
        >
          <DialogTitle sx={{ m: 0, p: 2 }} className="text-white text-center" id="customized-dialog-title">
            {t("cat_sort.sort_by")}
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[100],
            })}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent dividers>
            <Typography gutterBottom className="grid grid-cols-4 gap-4 p-2 text-white text-center">
              {content.map((d: any, i: number) => (
                <span
                  key={i}
                  className={`border-[1px] border-og py-3 rounded ${
                    searchConfig.sort.title === d.title ? "bg-og" : ""
                  }`}
                  onClick={(e) => {
                    setSearchConfig((prev: any) => ({ ...prev, start: true, sort: d }));
                    handlerSearch(searchConfig.query, d.key);
                    handleClose(e);
                  }}
                >
                  {d.title}
                </span>
              ))}
            </Typography>
          </DialogContent>
        </Dialog>
      )}

      {dialogOpen.catMore && (
        <Dialog
          fullScreen
          open={dialogOpen.catMore}
          onClose={handleClose}
          sx={() => ({
            "& .MuiPaper-root": {
              background: "#ededed",
            },
          })}
        >
          <AppBar className="relative">
            <Toolbar className="bg-nbk flex items-center">
              <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                <ArrowBackIcon sx={{ color: "white", fontSize: 24, stroke: "white", strokeWidth: 1, marginRight: 2 }} />
                <Typography className="ml-2 text-lg">{t("cat_sort.more_categories")}</Typography>
              </IconButton>
            </Toolbar>
          </AppBar>
          <List className="mt-4">
            <div className="bg-white pt-3 my-3">
              <Typography className="ml-4 text-lg">{t("search.popular_adult_topics")}</Typography>
              <ListItem className="grid grid-cols-4 gap-x-2">
                {catList.tags.map((item: any) => (
                  <Link
                    key={item}
                    to={`/search?filter=${item}`}
                    onClick={(e) => {
                      setTimeout(() => {
                        handleClose(e, "clickaway");
                      }, 0);
                    }}
                  >
                    <ListItemText
                      primary={item}
                      slotProps={{
                        primary: {
                          className:
                            "truncate text-center overflow-hidden text-ellipsis whitespace-nowrap border border-tgy p-2",
                        },
                      }}
                    />
                  </Link>
                ))}
              </ListItem>
            </div>
            {/* )} */}
            {Array.isArray(more_cat) &&
              more_cat.map((d: any, i: number) => (
                <div key={d} className="bg-white pt-3 my-3">
                  <Typography className="ml-4 text-lg">{d}</Typography>
                  <ListItem className="grid grid-cols-4 gap-x-2">
                    {i === 0
                      ? catList.cat?.length > 0 &&
                        catList.cat.map((item: any) => (
                          <div
                            key={item.slug}
                            onClick={(e) => {
                              setFilter({ ...filter, slug: item.slug });
                              setTimeout(() => {
                                handleClose(e, "escapeKeyDown");
                              }, 0);
                            }}
                          >
                            <ListItemText
                              primary={item.name}
                              className="text-center border-[1px] border-solid border-tgy p-2"
                            />
                          </div>
                        ))
                      : catList.ranking.map((item: any) => (
                          <div
                            key={item.key}
                            onClick={(e) => {
                              setFilter({ ...filter, sort: item.key });
                              setTimeout(() => {
                                handleClose(e, "clickaway");
                              }, 0);
                            }}
                          >
                            <ListItemText
                              primary={item.title}
                              className="text-center border-[1px] border-solid border-tgy p-2"
                            />
                          </div>
                        ))}
                  </ListItem>
                </div>
              ))}
            {catList.blocks?.length > 0 &&
              catList.blocks.map((d: any) => (
                <div key={d.title} className="bg-white pt-3 my-3">
                  <Typography className="ml-4 text-lg">{d.title}</Typography>
                  <ListItem className="grid grid-cols-4 gap-x-2">
                    {d.content.map((item: any) => (
                      <Link
                        key={item}
                        to={`/search?filter=${item}`}
                        onClick={(e) => {
                          setTimeout(() => {
                            handleClose(e, "clickaway");
                          }, 0);
                        }}
                      >
                        <ListItemText primary={item} className="text-center border-[1px] border-solid border-tgy p-2" />
                      </Link>
                    ))}
                  </ListItem>
                </div>
              ))}
          </List>
        </Dialog>
      )}

      {dialogOpen.newTopic && (
        <Dialog
          fullScreen
          open={dialogOpen.newTopic}
          onClose={handleClose}
          TransitionComponent={Transition}
          sx={{
            "& .MuiPaper-root": {
              background: "#ededed",
            },
          }}
        >
          <AppBar className="relative">
            <Toolbar className="bg-nbk flex justify-between items-center">
              <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                <ArrowBackIcon sx={{ color: "white", fontSize: 24, stroke: "white", strokeWidth: 1, marginRight: 2 }} />
                <Typography className="text-lg">{t("forum.start_new_topic")}</Typography>
              </IconButton>
              <div className="flex items-center justify-between w-5/12">
                <div className="flex items-center">
                  <Checkbox
                    inputProps={{ "aria-label": "spoilers checkbox" }}
                    checked={responds.spoilers}
                    sx={{
                      color: common.white,
                      "&.Mui-checked": {
                        color: common.white,
                      },
                      "& .MuiSvgIcon-root": { fontSize: 22 },
                    }}
                    onClick={() => setResponds({ ...responds, spoilers: !responds.spoilers })}
                  />
                  <Typography className="text-lg">{t("forum.spoiler_alert")}</Typography>
                </div>
                <Button
                  className={`text-lg ${responds.newTopic !== "" ? "text-og" : "text-white"}`}
                  disabled={responds.newTopic === ""}
                  onClick={() => handleSendRespond(responds.newTopic, queryId)}
                >
                  {t("forum.publish")}
                </Button>
              </div>
            </Toolbar>
          </AppBar>
          <List className="text-gy">
            <ListItem className="">
              <textarea
                className="bg-defaultBg text-lg w-full h-screen outline-none py-3"
                placeholder={t("forum.saySomething")}
                maxLength={200}
                value={responds.newTopic}
                onChange={(e) => setResponds({ ...responds, newTopic: e.target.value })}
              ></textarea>
            </ListItem>
          </List>
          <div className="fixed bottom-14 left-0 right-0">
            <AdComponent adKey="app_forum_new_theme_bottom" />
          </div>
        </Dialog>
      )}

      {dialogOpen.notifAds && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.notifAds}
          TransitionComponent={Transition}
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "transparent",
              boxShadow: "none",
            },
            "& .MuiDialogContent-root": {
              backgroundColor: "transparent",
              padding: 0,
            },
            "& .MuiDialogActions-root": {
              backgroundColor: "transparent",
            },
          }}
        >
          <DialogContent>
            <AdComponent adKey="app_user_notice" />
          </DialogContent>
          <DialogActions className="flex justify-center mb-4">
            {showCloseBtn ? (
              <Button className="bg-og text-white rounded border-solid border-2 border-og px-6" onClick={handleClose}>
                關閉廣告
              </Button>
            ) : (
              <Button
                disabled
                className="bg-gy text-white rounded border-solid border-2 border-tgy px-6"
                onClick={handleClose}
              >
                請稍候..
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {dialogOpen.dailyImg && (
        <Dialog
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.dailyImg}
          TransitionComponent={Transition}
          slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.6)" } } }}
          sx={{
            "& .MuiDialogContent-root": {
              backgroundColor: "transparent",
              padding: 0,
            },
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[100],
            })}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent onClick={handleClose}>
            {dailyImgs !== null && <img src={dailyImgs} alt="dailyImgs" width="100%" height="auto" />}
          </DialogContent>
        </Dialog>
      )}

      {dialogOpen.buyComic && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.buyComic}
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
          <DialogTitle id="customized-dialog-title" className="flex justify-center items-end">
            <p className="text-3xl text-og font-bold">JCoin兌換</p>
          </DialogTitle>
          <DialogContent sx={{ paddingY: 0 }}>
            <div className="flex flex-col justify-center items-center">
              <div className="flex justify-center items-center">
                <img src="/images/coin.png" alt="coin" width={16} />
                <p className="ml-2">100 Jcoin </p>
              </div>
              <p className="my-2 font-bold">兌換禁漫去碼漫畫</p>
              <p className="ml-2">現有 ???? JCoin</p>
            </div>
          </DialogContent>
          <DialogActions className="flex flex-col items-center justify-center">
            <Button
              className="bg-og text-white rounded-xl border-solid border-2 border-og text-lg px-6 my-3"
              onClick={(e) => {
                handleDecensored();
                handleClose(e);
              }}
            >
              {t("member_card.confirm_redeem")}
            </Button>
            <Button
              className="text-nbk rounded-xl border-solid border-2 border-og text-lg px-6 ml-0"
              onClick={handleClose}
            >
              考慮一下
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {dialogOpen.watchAds && (
        <Dialog
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.watchAds}
          TransitionComponent={Transition}
          slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.6)" } } }}
          sx={{
            "& .MuiDialogContent-root": {
              backgroundColor: "transparent",
              padding: 0,
            },
          }}
        >
          <DialogContent onClick={handleClose}>
            <AdComponent adKey="app_user_notice" closeBtn={true} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DialogModal;
