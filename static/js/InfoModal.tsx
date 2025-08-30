import React from "react";
import { TransitionProps } from "@mui/material/transitions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Slide, Typography, Dialog, IconButton } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { InfoInputData } from "../../assets/JsonData";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const InfoModal = (props: any) => {
  const { memberInfo, setFormData, formData, dialogOpen, setDialogOpen, handleSubmit } = props;
  const infoInput = InfoInputData();
  const handleClose = (_event: React.SyntheticEvent, reason?: string): void => {
    // 檢查背景點擊 (backdropClick) 時不關閉視窗
    if (reason === "backdropClick") {
      return;
    }
    setDialogOpen({ ...dialogOpen, editInfo: false });
  };

  const handleChange = (e: { target: any }) => {
    const { name, value } = e.target;
    setFormData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <>
      {dialogOpen.editInfo && (
        <Dialog
          fullScreen
          open={dialogOpen.editInfo}
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
                <Typography className="text-lg">個人</Typography>
              </IconButton>
            </Toolbar>
          </AppBar>
          <form className="bg-white text-lg p-6 my-4" onSubmit={handleSubmit}>
            {/* {Array.isArray(infoInput) &&
              infoInput.map((d: any, i: number) => (
                <>
                  <p className="text-xl py-2">{d.title}</p>
                  {d.inputContnet.map(
                    (item: any, index: number) =>
                      (item.name === "username" || item.name === "email") && (
                        <div className="mt-4">
                          <label htmlFor={item.name}>{item.label}</label>
                          <input
                            type="text"
                            maxLength={200}
                            name={item.name}
                            id={item.name}
                            readOnly
                            defaultValue={member[item.name]}
                            className="bg-defaultBg w-full h-10 px-2 outline-none text-gy"
                          />
                        </div>
                      )
                  )}
                </>
              ))} */}
            <p className="text-xl py-2">帳戶信息</p>
            <hr />
            <div className="mt-4">
              <label htmlFor="username">用戶名</label>
              <input
                type="text"
                name="username"
                id="username"
                readOnly
                defaultValue={memberInfo.username}
                className="bg-defaultBg w-full h-10 px-2 outline-none text-gy"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="email">EMAIL</label>
              <input
                type="email"
                name="email"
                id="email"
                readOnly
                defaultValue={memberInfo.email}
                className="bg-defaultBg w-full h-10 px-2 outline-none text-gy"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="nickName">暱稱</label>
              <input
                type="text"
                name="nickName"
                id="nickName"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.nickName}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="password">密碼</label>
              <input
                type="text"
                name="password"
                id="password"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.password}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="password_confirm">重新輸入密碼</label>
              <input
                type="text"
                name="password_confirm"
                id="password_confirm"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.password_confirm}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <p className="text-xl py-2">個人信息</p>
            <hr />
            <div className="mt-4">
              <label htmlFor="lastName">名字</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.lastName}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="firstName">姓</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.firstName}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="birthday">生日</label>
              <input
                type="date"
                name="birthday"
                id="birthday"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.birthday}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="relations">關係</label>
              <FormControl sx={{ width: "100%", "& .MuiInputBase-root": { height: "32px" } }}>
                <Select name="relations" id="relations" value={formData.relations} onChange={(e) => handleChange(e)}>
                  <MenuItem value="">---</MenuItem>
                  <MenuItem value="Single">單身</MenuItem>
                  <MenuItem value="Taken">非單身</MenuItem>
                  <MenuItem value="Open">開放</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="mt-4">
              <label htmlFor="relations">興趣</label>
              <FormControl sx={{ width: "100%", "& .MuiInputBase-root": { height: "32px" } }}>
                <Select name="sexuality" id="sexuality" value={formData.sexuality} onChange={(e) => handleChange(e)}>
                  <MenuItem value="">---</MenuItem>
                  <MenuItem value="Guys">男</MenuItem>
                  <MenuItem value="Girls">女</MenuItem>
                  <MenuItem value="Guys + Girls">男+女</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="mt-4">
              <label htmlFor="website">網站</label>
              <input
                type="text"
                name="website"
                id="website"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.website}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <p className="text-xl py-2">位置信息</p>
            <hr />
            <div className="mt-4">
              <label htmlFor="birthPlace">出生地</label>
              <input
                type="text"
                name="birthPlace"
                id="birthPlace"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.birthPlace}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="city">城市</label>
              <input
                type="text"
                name="city"
                id="city"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.city}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="country">國家</label>
              <input
                type="text"
                name="country"
                id="country"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.country}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="occupation">職業</label>
              <input
                type="text"
                name="occupation"
                id="occupation"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.occupation}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="company">公司</label>
              <input
                type="text"
                name="company"
                id="company"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.company}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="school">學校</label>
              <input
                type="text"
                name="school"
                id="school"
                maxLength={50}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.school}
                className="bg-defaultBg w-full h-10 px-2"
              />
            </div>
            <p className="text-xl py-2">隨機信息</p>
            <hr />
            <div className="mt-4">
              <label htmlFor="aboutMe">關於我</label>
              <textarea
                name="aboutMe"
                id="aboutMe"
                maxLength={200}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.aboutMe}
                className="bg-defaultBg w-full h-28 p-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="infoHere">這裡的</label>
              <textarea
                name="infoHere"
                id="infoHere"
                maxLength={200}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.infoHere}
                className="bg-defaultBg w-full h-28 p-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="collections">收藏性類別</label>
              <textarea
                name="collections"
                id="collections"
                maxLength={200}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.collections}
                className="bg-defaultBg w-full h-28 p-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="ideal">最喜歡的理想性伴侶</label>
              <textarea
                name="ideal"
                id="ideal"
                maxLength={200}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.ideal}
                className="bg-defaultBg w-full h-28 p-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="erogenic">我的Erogenic區</label>
              <textarea
                name="erogenic"
                id="erogenic"
                maxLength={200}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.erogenic}
                className="bg-defaultBg w-full h-28 p-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="favorite">最喜歡</label>
              <textarea
                name="favorite"
                id="favorite"
                maxLength={200}
                onChange={(e) => handleChange(e)}
                defaultValue={formData.favorite}
                className="bg-defaultBg w-full h-28 p-2"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="hate">最討厭</label>
              <textarea
                name="hate"
                id="hate"
                maxLength={200}
                defaultValue={formData.hate}
                onChange={(e) => handleChange(e)}
                className="bg-defaultBg w-full h-28 p-2"
              />
            </div>
            <div className="w-full flex justify-center my-10">
              <button type="submit" className="w-11/12 rounded-sm text-white p-2 bg-og shadow-lg shadow-stone-700/50">
                保存使用偏好
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
};

export default InfoModal;
