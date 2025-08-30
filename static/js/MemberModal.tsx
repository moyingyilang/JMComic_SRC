import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  AppBar,
  Toolbar,
  Slide,
  Button,
  Typography,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  IconButton,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { CommonQData } from "../../assets/JsonData";
import CircularProgress from "@mui/material/CircularProgress";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard, Scrollbar } from "swiper/modules";
import {
  FETCH_LOGIN_THUNK,
  FETCH_SIGN_UP_THUNK,
  FETCH_FORGOT_THUNK,
  FETCH_LOGOUT_THUNK,
} from "../../actions/memberAction";
import { CLEAR_MEMBER_LIST, RESET_MEMBER_STATE } from "../../reducers/memberReducer";
import { useTranslation } from "react-i18next";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MemberModal = (props: any) => {
  const {
    memberInfo,
    logined,
    isLoading,
    setConfig,
    dialogOpen,
    setDialogOpen,
    formData,
    setFormData,
    showSnackbar,
    handleChargeAdFree,
    langChange,
    setLangChange,
    switchLanguage,
    list,
    isRefreshing,
    handleRefresh,
    clearAuth,
  } = props;
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const CommonQ = CommonQData();
  const swiperRef = useRef<any>(null);
  const dispatch = useAppDispatch();
  const { info, memberResult } = useAppSelector((state) => state.member);

  const handleClose = (_event: React.SyntheticEvent, reason?: string): void => {
    _event.preventDefault();
    // 檢查背景點擊 (backdropClick) 時不關閉視窗
    if (reason === "backdropClick") {
      return;
    }
    setDialogOpen({
      ...dialogOpen,
      login: false,
      forgot: false,
      signUp: false,
      invite: false,
      charge: false,
      invincible: false,
      setting: false,
      darkMode: false,
      lang: false,
      logout: false,
      achievement: false,
    });
  };

  const handleSubmit = (formName: string, e: React.SyntheticEvent) => {
    e.preventDefault();
    dispatch(RESET_MEMBER_STATE());
    console.log("Form data:", formData);

    if (formName === "signUp" && formData.signUp.adult === false) {
      showSnackbar(t("login.confirm_18"), "error");
      return;
    }
    if (formName === "signUp" && formData.signUp.PrivacyPolicy === false) {
      showSnackbar(t("login.confirm_agree_terms"), "error");

      return;
    }
    switch (formName) {
      case "login":
        dispatch(FETCH_LOGIN_THUNK({ username: formData.login.username, password: formData.login.password }));
        localStorage.setItem("memberAccount", JSON.stringify(formData.login));
        break;
      case "signUp":
        dispatch(
          FETCH_SIGN_UP_THUNK({
            username: formData.signUp.username,
            email: formData.signUp.email,
            password: formData.signUp.password,
            password_confirm: formData.signUp.password_confirm,
            gender: formData.signUp.gender,
          })
        );
        break;
      case "forgot":
        dispatch(FETCH_FORGOT_THUNK({ email: formData.forgot.email }));
        break;
      default:
        console.error("Invalid form name:", formName);
    }
  };

  // 登入註冊忘記密碼儲存提交
  const handleChange = (formName: any, e: { target: HTMLInputElement }) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    if (value === "reset") {
      setFormData({});
      return;
    }
    setFormData((prevState: any) => ({
      ...prevState,
      [formName]: {
        ...prevState[formName],
        [name]: newValue,
      },
    }));
  };

  // login 錯誤或訊息提示
  useEffect(() => {
    const { code, errorMsg } = info;
    if (code === 401 && errorMsg) {
      showSnackbar(errorMsg, "error");
    } else {
      if (code === 200) {
        showSnackbar(t("login.login_success"), "success");
        setConfig((prev: any) => ({ ...prev, logined: true, memberInfo: info.data }));
        setDialogOpen({ ...dialogOpen, login: false });
      }
    }
    dispatch(CLEAR_MEMBER_LIST("info"));
  }, [info]);

  useEffect(() => {
    const { code, data, errorMsg } = memberResult;

    if (code === 200) {
      const msg = data.msg ?? errorMsg ?? "";
      const type = data.status !== "ok" ? "error" : "success";
      showSnackbar(msg, type);
      dispatch(CLEAR_MEMBER_LIST("memberResult"));
    }
  }, [memberResult]);

  const goToNextSlide = (state: string) => {
    if (swiperRef.current) {
      const swiper = swiperRef.current.swiper;
      if (state === "next") {
        swiper.slideNext();
      } else if (state === "prev") {
        swiper.slidePrev();
      }
    }
  };

  const memberLogout = async () => {
    const result = await dispatch(FETCH_LOGOUT_THUNK()).unwrap();
    if (result.code === 200) {
      setConfig((prev: any) => ({ ...prev, logined: false }));
      clearAuth(true);
      showSnackbar(t("login.logout_success"), "success");
    }
  };

  const copyToClipboard = (e: React.SyntheticEvent, urlCopied: string) => {
    navigator.clipboard.writeText(urlCopied).then(() => {
      showSnackbar("copied", "info");
    });
  };

  return (
    <>
      {(dialogOpen.login || dialogOpen.signUp || dialogOpen.forgot) && !logined && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.login || dialogOpen.signUp || dialogOpen.forgot}
          TransitionComponent={Transition}
          sx={(theme) => ({
            "& .MuiPaper-root": {
              width: "90%",
              backgroundColor: theme.palette.grey[900],
              borderRadius: "1rem",
            },
          })}
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
          {isLoading && (
            <CircularProgress
              color="inherit"
              size={30}
              className="absolute left-1/2 top-1/2 transform -translate-y-2 -translate-x-1/2 text-center text-gy z-50"
            />
          )}
          {dialogOpen.login && (
            <>
              <DialogTitle sx={{ m: 0, p: 2 }} className="text-white text-center" id="customized-dialog-title">
                {t("login.member_login")}
              </DialogTitle>
              <DialogContent>
                <form className="text-white" onSubmit={(e) => handleSubmit("login", e)}>
                  <div className="flex flex-col my-4">
                    <label htmlFor="name" className="">
                      {t("info.username")}
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      maxLength={50}
                      placeholder={t("info.username")}
                      className="text-nbk outline-none rounded p-2"
                      value={formData.login.username}
                      onChange={(e) => handleChange("login", e)}
                    />
                  </div>
                  <div className="flex flex-col my-4">
                    <label htmlFor="password">{t("info.password")}</label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      maxLength={50}
                      placeholder={t("info.password")}
                      className="text-nbk outline-none rounded p-2"
                      value={formData.login.password}
                      onChange={(e) => handleChange("login", e)}
                    />
                  </div>
                  <span onClick={() => setDialogOpen({ ...dialogOpen, forgot: true, login: false })}>
                    {t("login.forgot_password")}
                  </span>
                  <div className="float-right mt-14">
                    <button
                      className="border-[1px] border-solid border-og bg-transparent rounded-md ml-4 py-2 px-6"
                      type="reset"
                      onClick={() => setDialogOpen({ ...dialogOpen, signUp: true, login: false })}
                    >
                      {t("login.register")}
                    </button>
                    <button className="bg-og rounded-md ml-4 py-2 px-6" type="submit">
                      {t("login.member_login")}
                    </button>
                  </div>
                </form>
              </DialogContent>
            </>
          )}

          {dialogOpen.signUp && (
            <>
              <DialogTitle sx={{ m: 0, p: 2 }} className="text-white text-center" id="customized-dialog-title">
                {t("login.register")}
              </DialogTitle>
              <DialogContent>
                <form className="text-white" onSubmit={(e) => handleSubmit("signUp", e)}>
                  <div className="flex flex-col my-4">
                    <label htmlFor="name" className="">
                      {t("info.username")}
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      maxLength={50}
                      placeholder={t("info.username")}
                      className="text-nbk outline-none rounded p-2"
                      value={formData.signUp.username}
                      onChange={(e) => handleChange("signUp", e)}
                    />
                  </div>
                  <div className="flex flex-col my-4">
                    <label htmlFor="password">{t("info.password")}</label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      maxLength={50}
                      placeholder={t("info.password")}
                      className="text-nbk outline-none rounded p-2"
                      value={formData.signUp.password}
                      onChange={(e) => handleChange("signUp", e)}
                    />
                  </div>
                  <div className="flex flex-col my-4">
                    <label htmlFor="password">{t("info.password_confirm")}</label>
                    <input
                      type="password"
                      name="password_confirm"
                      id="password_confirm"
                      placeholder={t("info.password_confirm")}
                      className="text-nbk outline-none rounded p-2"
                      value={formData.signUp.password_confirm}
                      onChange={(e) => handleChange("signUp", e)}
                    />
                  </div>
                  <div className="flex flex-col my-4">
                    <label htmlFor="email">EMAIL</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="email"
                      pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                      className="text-nbk outline-none rounded p-2"
                      value={formData.signUp.email}
                      onChange={(e) => handleChange("signUp", e)}
                    />
                  </div>
                  <div className="flex my-4">
                    <label htmlFor="">{t("info.gender")}</label>
                    <div className="mx-2 flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        id="Male"
                        className="mx-2"
                        value="Male"
                        checked={formData.signUp.gender === "Male"}
                        onChange={(e) => handleChange("signUp", e)}
                      />
                      <label htmlFor="Male">{t("info.guys")}</label>
                    </div>
                    <div className="mx-2 flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        id="Female"
                        className="mx-2"
                        value="Female"
                        checked={formData.signUp.gender === "Female"}
                        onChange={(e) => handleChange("signUp", e)}
                      />
                      <label htmlFor="Female">{t("info.girls")}</label>
                    </div>
                  </div>
                  <div className="flex my-2">
                    <input
                      type="checkbox"
                      name="adult"
                      id="adult"
                      checked={formData.signUp.adult === true}
                      onChange={(e) => handleChange("signUp", e)}
                    />
                    <label htmlFor="18" className="mx-2">
                      {t("login.age_confirmation")}
                    </label>
                  </div>
                  <div className="flex my-2">
                    <input
                      type="checkbox"
                      name="PrivacyPolicy"
                      id="PrivacyPolicy"
                      checked={formData.signUp.PrivacyPolicy === true}
                      onChange={(e) => handleChange("signUp", e)}
                    />
                    <label htmlFor="PrivacyPolicy" className="mx-2">
                      {t("login.terms_and_conditions")}
                    </label>
                  </div>
                  <div className="float-right mt-14">
                    <button
                      className="border-[1px] border-solid border-og bg-transparent rounded-md ml-4 py-2 px-6"
                      onClick={() => setDialogOpen({ ...dialogOpen, signUp: false, login: true })}
                      type="reset"
                    >
                      {t("login.member_login")}
                    </button>
                    <button className="bg-og rounded-md ml-4 py-2 px-6" type="submit">
                      {t("login.register")}
                    </button>
                  </div>
                </form>
              </DialogContent>
            </>
          )}

          {dialogOpen.forgot && (
            <>
              <DialogTitle sx={{ m: 0, p: 2 }} className="text-white text-center" id="customized-dialog-title">
                {t("login.member_login")}
              </DialogTitle>
              <DialogContent>
                <form className="text-white" onSubmit={(e) => handleSubmit("forgot", e)}>
                  <div className="flex flex-col my-4">
                    <label htmlFor="name" className="">
                      {t("login.enter_email_for_registration")}
                    </label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      placeholder="用戶名"
                      className="text-nbk outline-none rounded p-2"
                      value={formData.forgot.email}
                      onChange={(e) => handleChange("forgot", e)}
                    />
                  </div>
                  <span onClick={() => setDialogOpen({ ...dialogOpen, forgot: false, login: true })}>
                    {t("login.back")}
                  </span>
                  <button className="bg-og rounded-md ml-4 py-2 px-6 float-right mt-14" type="submit">
                    {t("login.recover_password")}
                  </button>
                </form>
              </DialogContent>
            </>
          )}
        </Dialog>
      )}

      {dialogOpen.invite && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.invite}
          TransitionComponent={Transition}
          className="text-white"
          sx={() => ({
            "& .MuiPaper-root": {
              paddingY: "1rem",
              width: "80%",
              margin: "1rem",
            },
          })}
        >
          <DialogTitle className="text-center text-xl font-black" id="customized-dialog-title">
            <p>{memberInfo.username}</p>
            <p>{t("member_card.invite_code")}</p>
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
          <DialogContent sx={{ paddingY: 0, fontSize: 14 }}>
            <div className="px-4">
              <img
                src={memberInfo.invitation_qrcode}
                alt={memberInfo.invitation_qrcode}
                loading="lazy"
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.opacity = "1";
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/chapter_default.jpg";
                }}
                className="w-40 h-40 object-cover rounded-md mx-auto"
                style={{
                  opacity: "0",
                  transition: "opacity 0.5s ease-in-out",
                }}
              />
              <span>{t("member_card.invite_link")}:</span>
              <div className="flex items-center bg-og text-white rounded mb-4">
                <p className="w-10/12 bg-bbk px-2 py-1">{memberInfo.invitation_url}</p>
                <p
                  className="w-2/12 px-2 py-1 text-center cursor-pointer transform transition-all duration-200 ease-in-out active:scale-75 hover:text-gy"
                  onClick={(e) => copyToClipboard(e, memberInfo.invitation_url)}
                >
                  {t("member_card.copy")}
                </p>
              </div>
              <div className="text-center text-og">
                <p>
                  {t("member_card.invited_count")}
                  <span>{memberInfo.invited_cnt}/10</span>
                </p>
                <p className="pb-6">4月{t("member_card.reset_count")}</p>
                <span className="text-bbk">{t("member_card.invite_rule")}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {dialogOpen.charge && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.charge}
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
            <img src="/images/coin.png" alt="coin" width={30} />
            <p className="ml-4 font-black text-3xl">10000 </p>
            <span className="ml-2">JCoin</span>
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
          <DialogContent sx={{ paddingY: 0, fontSize: 14 }}>
            <div className="flex flex-col justify-center items-center mb-6">
              <img src="/images/arrow_down.png" alt="arrow_down" width={30} className="mb-6" />
              <p className="flex justify-center items-center">
                <img src="/images/jCharge.png" alt="jCharge" width={18} />
                <span className="font-black text-4xl mx-4">1</span>
                {t("common_q.jCharge")}
              </p>
            </div>
            <hr />
          </DialogContent>
          <DialogActions className="flex justify-center my-4">
            <Button
              className="bg-og text-white rounded-full border-solid border-2 border-og text-2xl px-6"
              onClick={() => {
                handleChargeAdFree({ coinCharge: true });
              }}
            >
              {t("member_card.confirm_redeem")}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {dialogOpen.invincible && (
        <Dialog
          fullScreen
          open={dialogOpen.invincible}
          onClose={handleClose}
          sx={{
            "& .MuiDialog-container": {
              transform: "none",
              transition: "none",
            },
            "& .MuiPaper-root": {
              background: "#ededed",
            },
          }}
        >
          <AppBar className="relative sticky top-0">
            <Toolbar className="bg-nbk flex justify-between items-center">
              <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                <ArrowBackIcon sx={{ color: "white", fontSize: 24, stroke: "white", strokeWidth: 1, marginRight: 2 }} />
                <Typography className="text-lg">{t("member_card.activate_invincibility")}</Typography>
              </IconButton>
            </Toolbar>
          </AppBar>
          <div
            className="w-full h-auto flex flex-col justify-center items-center bg-top bg-[#58c3e0] text-white"
            style={{ backgroundImage: `url(images/sky.png)` }}
          >
            <div className="w-full min-h-[60rem]">
              <div className="flex flex-row justify-cneter items-center pt-20">
                <Swiper
                  ref={swiperRef}
                  slidesPerView="auto"
                  spaceBetween={40}
                  keyboard={{
                    enabled: true,
                  }}
                  modules={[Pagination, Keyboard, Scrollbar]}
                  className="mySwiper w-11/12 p-4 overflow-visible"
                >
                  {CommonQ[1].list.map((d: any) => (
                    <SwiperSlide key={d.type}>
                      <img
                        src={d.img}
                        alt={d.type}
                        loading="lazy"
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = "1";
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/cover_default.jpg";
                        }}
                        width="100%"
                        height="auto"
                        className="object-cover rounded-3xl relative h-[38rem]"
                        style={{
                          opacity: "0",
                          transition: "opacity 0.5s ease-in-out",
                        }}
                      />

                      <div className="absolute left-1/2 bottom-20 transform -translate-y-6 -translate-x-1/2 text-center text-3xl z-10">
                        <p>{d.name}</p>
                        <p>{d.desc}</p>
                      </div>

                      <div className="w-[110%] h-32 bg-[#000] opacity-50 absolute left-1/2 bottom-20 transform -translate-x-1/2 flex items-center justify-center z-0"></div>
                      <div className="absolute left-1/2 bottom-[-2rem] transform -translate-x-1/2 z-50">
                        <Button
                          className="bg-og text-white rounded-full border-solid border-2 border-og text-2xl py-4 px-10 mt-[-3rem] z-20"
                          onClick={() => {
                            handleChargeAdFree({ AdFree: true, type: d.type });
                          }}
                        >
                          {t("member_card.redeem_now")}
                        </Button>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              <div className="w-8/12 flex justify-around items-center mt-10 mx-auto">
                <div
                  className="bg-og text-white rounded-full border-solid border-2 border-og min-w-0 p-2"
                  onClick={() => goToNextSlide("prev")}
                >
                  <ArrowBackIcon />
                </div>
                <div
                  className="bg-og text-white rounded-full border-solid border-2 border-og min-w-0 p-2"
                  onClick={() => goToNextSlide("next")}
                >
                  <ArrowForwardIcon />
                </div>
              </div>
            </div>
            <div className="size-full bg-[#ffb46e] rounded-t-[2rem] flex justify-center items-center mt-4 py-32 overflow-hidden">
              {Array.isArray(CommonQ[1].text_section) &&
                CommonQ[1].text_section.map((d: any, i: number) => (
                  <div
                    key={i}
                    className="w-11/12 bg-white text-nbk text-2xl p-8 rounded-2xl shadow-lg shadow-stone-700/50"
                  >
                    <p className="text-og text-4xl text-center mb-4 font-black">{CommonQ[1].title}</p>
                    <p>
                      {d.content.slice(0, 5).map((item: string) =>
                        item.includes(t("common_q.monthly")) ? (
                          <span key={item} className="text-og font-bold">
                            {item}
                          </span>
                        ) : (
                          <span key={item}>{item}</span>
                        )
                      )}
                    </p>
                    <br />
                    {d.content.slice(5, 10).map((item: string) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                ))}
            </div>
            <div className="size-full bg-[#ffdba1] flex justify-center items-center py-32 overflow-hidden">
              <div className="w-11/12 bg-white text-nbk p-8 rounded-2xl shadow-lg shadow-stone-700/50">
                <p className="text-og text-4xl text-center mb-4 font-black">{CommonQ[0].title}</p>
                {Array.isArray(CommonQ[0].text_section) &&
                  CommonQ[0].text_section.map((d: any, i: number) => (
                    <div key={i} className="mt-3">
                      <div
                        className="bg-og border-1 border-solid border-og text-white text-2xl flex justify-between rounded-t-lg p-4"
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      >
                        <p className="w-full flex justify-start items-center">
                          {d.FAQ.map((q: any, index: number) => (
                            <React.Fragment key={index}>
                              {q}
                              {q.includes(t("common_q.jJar")) && (
                                <img
                                  src={CommonQ[0].list[0].img}
                                  alt={CommonQ[0].list[0].type}
                                  width="16px"
                                  height="16px"
                                />
                              )}
                              {q.includes(t("common_q.jCharge")) && (
                                <img
                                  src={CommonQ[0].list[1].img}
                                  alt={CommonQ[0].list[1].type}
                                  width="12px"
                                  height="12px"
                                />
                              )}
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
            </div>
          </div>
        </Dialog>
      )}

      {dialogOpen.setting && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.setting}
          TransitionComponent={Transition}
          sx={() => ({
            "& .MuiPaper-root": {
              paddingY: "1rem",
              width: "90%",
              margin: "1rem",
            },
          })}
        >
          <DialogTitle id="customized-dialog-title" className="flex justify-center items-end">
            {CommonQ[2].title}
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
          <DialogContent sx={{ fontSize: 14 }}>
            {Array.isArray(CommonQ[2].list) &&
              CommonQ[2].list.map((d) => (
                <div key={d.type}>
                  <span
                    className={`p-1 font-bold 
                      ${d.type === "永久網域" && "bg-[#f29d13]"} 
                      ${d.type === "發布頁" && "bg-og"}
                       ${d.type === "聊天規範" && "bg-[#fcf91e]"}`}
                  >
                    {d.name}
                  </span>
                  <p className="py-1 text-blue-800 underline">
                    <a href={d.desc} target="_blank" rel="noreferrer">
                      {d.desc}
                    </a>
                  </p>
                </div>
              ))}
            <p className="my-8">
              <span className="bg-[#f2c511] text-xl font-bold p-1">{CommonQ[2].text_section[0].content[1]}</span>
            </p>
            {Array.isArray(CommonQ[2].text_section) &&
              CommonQ[2].text_section[0].content.slice(3, 9).map((d) => (
                <p key={d} className="">
                  {d}
                </p>
              ))}
            <p className="my-2">
              <span className="bg-[#fcf91e] text-red-600 font-bold p-1">{CommonQ[2].text_section[0].content[9]}</span>
            </p>
            {Array.isArray(CommonQ[2].text_section) &&
              CommonQ[2].text_section[0].content.slice(10, 12).map((d) => (
                <p key={d} className="">
                  {d}
                </p>
              ))}
          </DialogContent>
        </Dialog>
      )}
      {dialogOpen.lang && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.lang}
          TransitionComponent={Transition}
          sx={(theme) => ({
            "& .MuiPaper-root": {
              width: "90%",
              backgroundColor: theme.palette.grey[900],
            },
          })}
        >
          <DialogTitle sx={{ m: 0, p: 2 }} className="text-white text-center" id="customized-dialog-title">
            {t("setting.switch_language")}
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
            <Typography gutterBottom className="flex justify-center items-center text-white text-center p-2">
              {[
                { title: "zh-TW", name: t("setting.traditional_chinese") },
                { title: "zh-CN", name: t("setting.simplified_chinese") },
              ].map((d: any) => (
                <span
                  key={d.name}
                  className={`border-[1px] border-og p-3 mx-2 rounded ${langChange === d.title ? "bg-og" : ""}`}
                  onClick={() => setLangChange(d.title)}
                >
                  {d.name}
                </span>
              ))}
            </Typography>
          </DialogContent>
          <DialogActions className="flex justify-center mb-4">
            <Button
              className="bg-og text-white text-base rounded border-solid border-2 border-og px-6"
              onClick={(e) => {
                handleClose(e);
                switchLanguage();
              }}
            >
              {t("member.confirm")}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {dialogOpen.logout && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.logout}
          TransitionComponent={Transition}
          sx={(theme) => ({
            "& .MuiPaper-root": {
              width: "90%",
              backgroundColor: theme.palette.grey[900],
            },
          })}
        >
          <DialogTitle sx={{ m: 0, p: 2 }} className="text-white text-center" id="customized-dialog-title">
            {t("login.logoutConfirm")}
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
          <DialogActions className="flex justify-center mb-4">
            <Button
              className="text-white text-base rounded border-solid border-2 border-og px-6"
              onClick={(e) => {
                memberLogout();
                handleClose(e);
              }}
            >
              {t("member.confirm")}
            </Button>
            <Button
              className="bg-og text-white text-base rounded border-solid border-2 border-og px-6"
              onClick={(e) => {
                handleClose(e);
              }}
            >
              {t("login.logoutCancel")}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {dialogOpen.achievement && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.achievement}
          TransitionComponent={Transition}
          className="text-white"
          sx={() => ({
            "& .MuiPaper-root": {
              paddingY: "1rem",
              marginX: "1rem",
              width: "100%",
            },
          })}
        >
          {isRefreshing || isLoading ? (
            <CircularProgress
              sx={(theme) => ({
                position: "absolute",
                right: 50,
                top: 16,
                color: theme.palette.grey[700],
                stroke: theme.palette.grey[700],
                strokeWidth: 2,
              })}
              size={20}
              className="text-gy"
            />
          ) : (
            <ReplayIcon
              sx={(theme) => ({
                position: "absolute",
                right: 50,
                top: 16,
                color: theme.palette.grey[700],
                stroke: theme.palette.grey[700],
                strokeWidth: 2,
              })}
              onClick={() => handleRefresh()}
            />
          )}
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
          <DialogContent>
            {list.map((d: any, i: number) =>
              d.id === "79" || d.id === "236" ? (
                <hr key={d.id} className="border border-solid mt-4" />
              ) : (
                <div key={d.id} className="w-full flex justify-between items-center py-3 pr-4 mt-4">
                  <p>{d.name}</p>
                  <div className="w-6/12 flex justify-around items-center">
                    <hr className="border-2 border-solid border-og w-4/12" />
                    <span>
                      {d.rule_data?.unique}/{d.rule_data?.value}
                    </span>
                    <div className="w-10 flex items-center">
                      {d.type === "coin" ? (
                        <img src="/images/coin.png" alt="" width="15px" height="15px" className="mr-2" />
                      ) : (
                        <img src="/images/exp.png" alt="" width="15px" height="15px" className="mr-2" />
                      )}
                      <p>{d.content}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default MemberModal;
