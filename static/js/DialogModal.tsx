import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import GroupIcon from "@mui/icons-material/Group";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Slider,
  Typography,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { useDelayedFlag } from "../../Hooks";
import { formatDate } from "../../utils/Function";
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
    nid,
    content,
    dialogOpen,
    setDialogOpen,
    searchConfig,
    setSearchConfig,
    catList,
    setFilter,
    filter,
    handlerSearch,
    dailyImgs,
    handleDecensored,
    readImgSource,
    textFieldsSettings,
    setTextFieldsSettings,
    handleChangeTextSettings,
    handleEngagementAction,
    favoriteSave,
    selectedFeedback,
    contactImgUrl,
    setContactImgUrl,
    isImageLoading,
    successData,
  } = props;
  const navigate = useNavigate();
  const { setConfig, config } = useGlobalConfig();
  const { setting, logined, memberInfo, app_img_shunt } = config;
  const { t } = useTranslation();
  const more_cat = t("cat_sort.more_cat", { returnObjects: true });

  const showCloseBtn = useDelayedFlag(3000);

  // switch img source
  const handleChangeImageSource = (key: string) => {
    if (key === "0") {
      setConfig((prev) => ({ ...prev, express: "on", app_img_shunt: key }));
    } else {
      setConfig((prev) => ({ ...prev, app_img_shunt: key }));
    }
    sessionStorage.setItem("imageSource", key);
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
      textFields: false,
      moreElse: false,
      buyNovel: false,
      feedbackDetail: false,
      contactImg: false,
      successMessage: false,
    });
  };

  const marks = [
    {
      value: 0,
      label: "極小",
    },
    {
      value: 25,
      label: "小",
    },
    {
      value: 50,
      label: "一般",
    },
    {
      value: 75,
      label: "大",
    },
    {
      value: 100,
      label: "超大",
    },
  ];

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
                    ${(Number(app_img_shunt) || 1) === d.key ? "bg-og" : ""}`}
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
              <AdComponent adKey="app_speed" />
              {Array.isArray(readImgSource) &&
                readImgSource.map((d: any) => (
                  <Button
                    key={d.key}
                    className={`w-full text-white rounded border-solid border-2 border-og mt-4 
                   ${Number(app_img_shunt) === d.key ? "bg-og" : ""}`}
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
                    // 最舊的只是把目前已載入的結果反轉顯示，不需要重新打 API
                    if (!d.isLocalOldest) {
                      handlerSearch(searchConfig.query, d.key);
                    }
                    handleClose(e);
                    sessionStorage.setItem("searchSort", d.title);
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

      {dialogOpen.successMessage && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="success-dialog-title"
          open={dialogOpen.successMessage}
          TransitionComponent={Transition}
          sx={{
            "& .MuiPaper-root": {
              width: "90%",
              backgroundColor: "#fff",
            },
          }}
        >
          <DialogContent>
            <Typography className="text-left text-xl text-[#39a900]">{t("contact.submit_success")}</Typography>
            <Typography className="whitespace-pre-wrap text-[#777] pt-6">{successData?.message}</Typography>
            <Typography className="mt-3 whitespace-pre-wrap  text-[#777]">
              {t("contact.submit_success_notice")}
            </Typography>
          </DialogContent>
          <DialogActions className="flex justify-center mb-4">
            <Button
              className="bg-og text-white rounded border-solid border-2 border-og px-6"
              onClick={(e) => {
                handleClose(e);
                navigate("/member?tab=4&subType=feedback_history");
              }}
            >
              {t("member.confirm")}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {dialogOpen.feedbackDetail && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="feedback-detail-dialog-title"
          open={dialogOpen.feedbackDetail}
          TransitionComponent={Transition}
          fullWidth
          maxWidth="md"
          sx={{
            "& .MuiDialog-container": {
              // alignItems: "flex-start",
            },
            "& .MuiPaper-root": {
              width: "95%",
              maxWidth: "950px",
              margin: "1rem auto",
              borderRadius: "10px",
              backgroundColor: "#eee",
              overflow: "hidden",
            },
          }}
        >
          {/* 標題 */}
          <div className="flex items-center justify-between px-3 py-3">
            <h2 id="feedback-detail-dialog-title" className="text-xl font-bold text-[#111]">
              {t("contact.detail.title_prefix")}
              {selectedFeedback?.feedback_id}
            </h2>
          </div>
          <DialogContent className="!p-0" sx={{ overflowY: "auto" }}>
            {/* 工單基本資料 */}
            <div className="mx-1 rounded-[10px] bg-white px-4">
              {/* 建立時間 */}
              <div className="grid grid-cols-[180px_1fr] border-b border-dashed border-[#aaa] py-3">
                <div className="text-base">{t("contact.detail.created_at_label")}</div>

                <div className="text-base">
                  {selectedFeedback?.created_at ? formatDate(selectedFeedback.created_at) : "-"}
                </div>
              </div>

              {/* 問題分類 */}
              <div className="grid grid-cols-[180px_1fr] border-b border-dashed border-[#aaa] py-3">
                <div className="text-base">{t("contact.category_label")}</div>

                <div className="text-base">
                  {selectedFeedback?.category || t("contact.detail.category_default")}

                  {selectedFeedback?.subcategory && <div className="mt-2 pl-2">└ {selectedFeedback.subcategory}</div>}
                </div>
              </div>

              {/* 使用電信 */}
              <div className="grid grid-cols-[180px_1fr] border-b border-dashed border-[#aaa] py-3">
                <div className="text-base">{t("contact.carrier_label")}</div>

                <div className="text-base">{selectedFeedback?.carrier_name || "-"}</div>
              </div>

              {/* 手機品牌與型號 */}
              <div className="grid grid-cols-[180px_1fr] border-b border-dashed border-[#aaa] py-3">
                <div className="text-base">{t("contact.detail.device_model_label")}</div>

                <div className="text-base">{selectedFeedback?.device_model || "-"}</div>
              </div>

              {/* 內容 */}
              <div className="grid grid-cols-[180px_1fr] border-b border-dashed border-[#aaa] py-3">
                <div className="text-base">{t("contact.detail.content_label")}</div>

                <div className="whitespace-pre-wrap break-words text-base leading-7">
                  {selectedFeedback?.description || "-"}
                </div>
              </div>

              {/* 圖片 */}
              <div className="grid grid-cols-[180px_1fr] border-b border-dashed border-[#aaa] py-3">
                <div className="text-base">{t("contact.detail.image_label")}</div>

                <div>
                  {selectedFeedback.attachments?.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      <div>
                        {isImageLoading ? (
                          <div className="flex h-[210px] w-[100px] items-center justify-center">
                            <CircularProgress size={32} />
                          </div>
                        ) : (
                          <img
                            src={contactImgUrl !== "" ? contactImgUrl : "/images/cover_default.jpg"}
                            alt={`${selectedFeedback?.feedback_id}-img`}
                            className="max-h-[210px] max-w-[300px] cursor-pointer object-contain"
                            onClick={() => {
                              setDialogOpen((prev: any) => ({ ...prev, contactImg: true }));
                            }}
                          />
                        )}

                        <div
                          className="mt-2 cursor-pointer text-blue-500"
                          onClick={() => {
                            setDialogOpen((prev: any) => ({ ...prev, contactImg: true }));
                          }}
                        >
                          {t("contact.detail.view_image")}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">{t("contact.detail.no_image")}</span>
                  )}
                </div>
              </div>

              {/* 狀態 */}
              <div className="grid grid-cols-[180px_1fr] py-3">
                <div className="text-base">{t("contact.detail.status_label")}</div>

                <div
                  className={`text-base ${selectedFeedback?.status === "replied" ? "text-[#39a900]" : "text-red-500"}`}
                >
                  {selectedFeedback?.status_text || "-"}
                </div>
              </div>
            </div>

            {/* 客服回覆 */}
            {selectedFeedback?.reply && (
              <div className="mx-1 mt-2 rounded-[10px] bg-white px-4">
                <div className="grid grid-cols-[180px_1fr] border-b border-dashed border-[#aaa] py-3">
                  <div className="text-base">{t("contact.detail.reply_content_label")}</div>

                  <div className="whitespace-pre-wrap break-words text-base leading-6">
                    {selectedFeedback.reply.content}
                  </div>
                </div>

                <div className="grid grid-cols-[180px_1fr] py-3">
                  <div className="text-base">{t("contact.detail.reply_time_label")}</div>

                  <div className="text-base">{formatDate(selectedFeedback.reply.replied_at)}</div>
                </div>
              </div>
            )}
          </DialogContent>
          <DialogActions className="!m-0 flex justify-center !px-4 !py-3">
            <Button
              onClick={handleClose}
              className="!rounded !border-2 !border-solid !border-og !bg-og !px-8 !text-white"
            >
              {t("contact.detail.close_button")}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {dialogOpen.contactImg && (
        <Dialog
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.contactImg}
          TransitionComponent={Transition}
          slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.6)" } } }}
          sx={{
            "& .MuiDialog-paper": {
              backgroundColor: "transparent",
              boxShadow: "none",
              height: "90vh",
              maxHeight: "90vh",
            },
            "& .MuiDialogContent-root": {
              backgroundColor: "transparent",
              padding: 0,
            },
          }}
        >
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen((prev: any) => ({ ...prev, contactImg: false }))}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "#fff",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <CloseIcon sx={{ stroke: "currentColor", strokeWidth: 1.5 }} />
          </IconButton>
          <DialogContent
            onClick={handleClose}
            className="flex items-center justify-center !p-0"
            sx={{ height: "90vh" }}
          >
            {isImageLoading ? (
              <CircularProgress sx={{ color: "grey.300" }} />
            ) : (
              <img
                src={contactImgUrl !== "" ? contactImgUrl : "/images/cover_default.jpg"}
                alt="imgUrl"
                style={{ maxWidth: "100vw", maxHeight: "90vh", width: "auto", height: "auto", objectFit: "contain" }}
              />
            )}
          </DialogContent>
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
            <p className="text-3xl text-og font-bold">JCoin{t("detail.exchange")}</p>
          </DialogTitle>
          <DialogContent sx={{ paddingY: 0 }}>
            <div className="flex flex-col justify-center items-center">
              <div className="flex justify-center items-center">
                <img src="/images/coin.png" alt="coin" width={16} />
                <p className="ml-2">100 Jcoin </p>
              </div>
              <p className="my-2 font-bold">{t("detail.exchange_uncensored")}</p>
              <p className="ml-2">(現有 {logined ? memberInfo.coin : "????"} JCoin)</p>
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
              {t("detail.consider")}
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
              backgroundColor: " rgba(0, 0, 0, 0.8)",
              padding: 2,
            },
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
              position: "absolute",
              right: 5,
              top: 5,
              color: theme.palette.grey[100],
            })}
          >
            <CloseIcon />
          </IconButton>

          <DialogContent onClick={handleClose}>
            <AdComponent adKey="app_user_notice" closeBtn={true} />
          </DialogContent>
        </Dialog>
      )}

      {dialogOpen.textFields && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.textFields}
          TransitionComponent={Transition}
          className="text-white"
          sx={() => ({
            "& .MuiPaper-root": {
              paddingY: "1rem",
              width: "90%",
              margin: "1rem",
              fontSize: "1.25rem",
            },
            "& .MuiDialogTitle-root+.css-kw13he-MuiDialogContent-root": {
              paddingTop: 4,
            },
          })}
        >
          <DialogTitle id="customized-dialog-title" className="flex justify-start items-center pt-0 pb-2">
            <p className="text-xl text-gy font-bold">{t("setting.font_language")}</p>
          </DialogTitle>
          <DialogContent className="flex flex-col justify-center items-center pt-4 pb-0" dividers>
            <p className="text-xl">{t("setting.font_size")}</p>
            <Box className="w-5/6 mt-4">
              <Slider
                aria-label="Restricted values"
                value={textFieldsSettings.wordValue}
                getAriaValueText={(value) => `${value}`}
                step={null}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => marks.find((mark) => mark.value === value)?.label || value}
                marks={marks}
                onChange={(event, newValue) =>
                  setTextFieldsSettings((prev: { wordValue: number }) => ({ ...prev, wordValue: newValue }))
                }
                sx={{
                  color: "#757575",
                  "& .MuiSlider-thumb": {
                    backgroundColor: "#ff5722",
                    width: 15,
                    height: 15,
                    transition: "width 0.2s, height 0.2s",
                    position: "relative",
                    "&:hover": {
                      backgroundColor: "#ff7b00",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: 6,
                      height: 6,
                      backgroundColor: "#ffffff",
                      borderRadius: "50%",
                      transform: "translate(-50%, -50%)",
                    },
                  },
                  "& .MuiSlider-rail": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiSlider-markLabel": {
                    fontSize: "1rem",
                    color: (theme) => "#757575",
                    transition: "color 0.3s",
                  },
                }}
              />
            </Box>
            <Box className="flex flex-col justify-center items-center mt-4">
              <p className="text-xl">{t("library.language")}</p>
              <div className="flex text-gy my-4">
                <div className="mx-2 flex items-center">
                  <input
                    type="radio"
                    name="lang"
                    id="tw"
                    className="peer hidden"
                    value="tw"
                    checked={textFieldsSettings.lang === "tw" ? true : false}
                    onChange={(e) =>
                      setTextFieldsSettings((prev: { lang: string }) => ({ ...prev, lang: e.target.value }))
                    }
                  />
                  <label
                    htmlFor="tw"
                    className="mx-2 inline-flex items-center justify-center w-4 h-4 border-2 border-gray-400 rounded-full cursor-pointer transition-colors duration-300 peer-checked:bg-orange-500 peer-checked:border-orange-500 peer-checked:ring-2 peer-checked:ring-white"
                  ></label>
                  <label htmlFor="tw">{t("setting.traditional_chinese")}</label>
                </div>
                <div className="mx-2 flex items-center">
                  <input
                    type="radio"
                    name="lang"
                    id="cn"
                    className="peer hidden"
                    value="cn"
                    checked={textFieldsSettings.lang === "cn" ? true : false}
                    onChange={(e) =>
                      setTextFieldsSettings((prev: { lang: string }) => ({ ...prev, lang: e.target.value }))
                    }
                  />
                  <label
                    htmlFor="cn"
                    className="mx-2 inline-flex items-center justify-center w-4 h-4 border-2 border-gray-400 rounded-full cursor-pointer transition-colors duration-300 peer-checked:bg-orange-500 peer-checked:border-orange-500 peer-checked:ring-2 peer-checked:ring-white"
                  ></label>
                  <label htmlFor="cn">{t("setting.simplified_chinese")}</label>
                </div>
              </div>
            </Box>
          </DialogContent>
          <DialogActions className="flex items-center justify-end pb-0">
            <Button className="bg-tgy text-nbk rounded-md text-lg px-4" onClick={handleClose}>
              {t("member.cancel")}
            </Button>
            <Button
              className="bg-og text-white rounded-md border-2 border-og text-lg px-4"
              onClick={(e) => {
                handleChangeTextSettings();
                handleClose(e);
              }}
            >
              {t("member.confirm")}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {dialogOpen.moreElse && (
        <Dialog
          open={dialogOpen.moreElse}
          onClose={handleClose}
          sx={{
            "& .MuiDialog-paper": {
              position: "fixed",
              bottom: 70,
              left: 0,
              right: 0,
              width: "100%",
              maxWidth: "100%",
              margin: 0,
              borderRadius: "0",
              backgroundColor: "#232323",
              color: "#fff",
              boxShadow: "none",
            },
          }}
        >
          <DialogContent onClick={handleClose} className="flex justify-start items-center p-1 pt-3">
            <Button
              className="flex flex-col items-center text-white"
              onClick={(e) => {
                handleClose(e);
                window.open("https://discord.com/invite/V74p7HM");
              }}
            >
              <GroupIcon />
              {t("novel.community")}
            </Button>
            <Button
              className="flex flex-col items-center text-white"
              onClick={(e) => {
                handleClose(e);
                window.open("https://payment.gcomicloveu.org/payments/order/6aa86c8520484331b19d9e7dfd1078cb");
              }}
            >
              <PhoneAndroidIcon />
              {t("novel.software")}
            </Button>

            <Button
              className="flex flex-col items-center text-white"
              onClick={(e) => {
                handleEngagementAction("like", nid);
                handleClose(e);
              }}
            >
              {favoriteSave.like.includes(nid) ? (
                <FavoriteIcon className="text-red-600" />
              ) : (
                <FavoriteBorderIcon className="text-og" />
              )}
              {t("detail.like")}
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {dialogOpen.buyNovel && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.buyNovel}
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
            <p className="text-3xl text-og font-bold">JCoin{t("detail.exchange")}</p>
          </DialogTitle>
          <DialogContent sx={{ paddingY: 0 }}>
            <div className="flex flex-col justify-center items-center">
              <div className="flex justify-center items-center">
                <img src="/images/coin.png" alt="coin" width={16} />
                <p className="ml-2">100 Jcoin </p>
              </div>
              <p className="mt-2 font-bold">{t("novel.preview_latest_chapter")}</p>
              <p className="mb-2 font-bold">{t("novel.auto_unlock_info")}</p>
              <p className="">(現有 {logined ? memberInfo.coin : "????"} JCoin)</p>
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
              {t("detail.consider")}
            </Button>
          </DialogActions>
          <p className="flex justify-center items-center">
            {t("novel.free_jcoins")}JCoins:<span className="text-og mx-2">1.{t("novel.daily_checkin")}</span>
            <span className="text-og">2.{t("novel.daily_task")}</span>
          </p>
        </Dialog>
      )}
    </>
  );
};

export default DialogModal;
