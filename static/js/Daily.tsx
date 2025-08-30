import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import classNames from "classnames";
import BottomNav from "../../components/Main/BottomNav";
import Loading from "../../components/Common/Loading";
import MemberModal from "../../components/Modal/MemberModal";
import {
  FETCH_GET_DAILY_THUNK,
  FETCH_DAILY_CHECK_THUNK,
  FETCH_DAILY_LIST_FILTER_THUNK,
} from "../../actions/memberAction";
import { defaultUserFormData } from "../../utils/InterFace";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";

const Daily = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined } = config;
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const memberInfo = JSON.parse(localStorage.getItem("memberInfo") as string);
  const dispatch = useAppDispatch();
  const { dailyList, memberResult, isLoading } = useAppSelector((state) => state.member);
  const month = (new Date().getMonth() + 1).toString();
  const [check, setCheck] = useState(true);
  const [formData, setFormData] = useState(defaultUserFormData);
  const [dialogOpen, setDialogOpen] = useState({
    login: false,
    signUp: false,
    forgot: false,
  });

  useEffect(() => {
    if (logined && memberInfo) {
      dispatch(FETCH_GET_DAILY_THUNK(memberInfo?.uid));
    }
  }, [logined, memberResult]);

  const allSigned =
    dailyList.record?.length > 0 &&
    dailyList.record.every((week: any) => week.every((day: any) => day.signed === true));

  const handleCheckEvent = async () => {
    const result = await dispatch(
      FETCH_DAILY_CHECK_THUNK({ user_id: memberInfo.uid, daily_id: dailyList.daily_id })
    ).unwrap();
    const { msg } = result.data;
    const type = msg.includes("已經簽到過了") ? "error" : "success";
    showSnackbar(msg, type);
  };

  const handleFullCheckEvent = async () => {
    const result = await dispatch(FETCH_DAILY_LIST_FILTER_THUNK(month)).unwrap();
    const { msg, status } = result.data;
    const type = status !== "ok" ? "error" : "success";
    if (result.code === 200) {
      showSnackbar(msg, type);
      setCheck(false);
    }
  };

  const styled = {
    date: {
      class:
        "w-[25px] h-[25px] border-2 border-dashed border-[#bbb] bg-[#ebebeb] p-1 rounded-[8px] text-[#bbb] flex justify-center items-center",
      style: {},
    },
    done: {
      class:
        "w-[25px] h-[25px] border-2 border-dashed border-[#943234] rounded-[8px] p-1 bg-[#943234] bg-cover bg-center bg-no-repeat flex justify-center items-center shadow-md shadow-stone-500/50",
      style: { backgroundImage: `url('/images/signList/done-icon.png')` },
    },
    heart: {
      class:
        "w-[25px] h-[25px] border-2 border-dashed border-[#f23f57] rounded-[8px] p-1 bg-[#fab3b1] bg-cover bg-center bg-no-repeat flex justify-center items-center shadow-md shadow-stone-500/50",
      style: { backgroundImage: `url('/images/signList/event-heart.png')` },
    },
    sign: {
      class:
        "w-[25px] h-[25px] border-2 border-solid border-gy bg-[#ffffff] rounded-[8px] p-1 text-gy flex justify-center items-center shadow-md shadow-stone-500/50",
      style: {},
    },
    signed: {
      class:
        "w-[25px] h-[25px] border-2 border-dashed border-[#943234] rounded-[8px] p-1 bg-[#943234] bg-cover bg-center bg-no-repeat  flex justify-center items-center shadow-md shadow-stone-500/50",
      style: { backgroundImage: `url('/images/signList/event-heart.png')` },
    },
  };

  return (
    <>
      {isLoading && <Loading />}
      <div
        className="w-full min-h-screen bg-cover bg-center overflow-hidden flex justify-center items-center"
        style={{
          backgroundImage: dailyList.background_phone
            ? `url(${setting?.img_host + dailyList.background_phone})`
            : `url(images/chapter_default.jpg)`,
        }}
      >
        <div className="w-10/12 border border-solid border-bbk rounded text-center">
          <div className="relative bg-og border border-solid border-bbk text-white p-4 z-20">
            <div className="absolute top-[-15px] left-0 w-full flex justify-around">
              <img src="/images/signList/coil.png" alt="coil1" width="15px" height="15px" />
              <img src="/images/signList/coil.png" alt="coil2" width="15px" height="15px" />
            </div>
            <div className="absolute top-[-4px] left-[14px]">
              <img
                src="/images/signList/month-badge.png"
                alt="month-badge"
                width="48px"
                height="48px"
                className="relative"
              />
              <p className="absolute left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2 text-sm">{month}月</p>
            </div>
            <p className="text-lg pt-2">{dailyList.event_name}</p>
          </div>
          <div className="relative border border-solid border-bbk p-6 bg-white z-10">
            <div
              className="absolute left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-full h-full bg-center bg-no-repeat opacity-50"
              style={{
                backgroundImage: `url('/images/signList/main-bg.png')`,
                backgroundSize: `${logined ? "80%" : "40%"}`,
              }}
            />
            <ul className="grid grid-cols-7 gap-3 relative text-white">
              {dailyList.record?.length > 0 &&
                dailyList.record.map((d: any) =>
                  d.map((item: any) => {
                    const { signed, bonus, date } = item;
                    // console.log(signed, bonus, date);

                    let itemClass = "";
                    let itemStyle = {};

                    if (signed === null && bonus) {
                      itemClass = styled.heart.class;
                      itemStyle = styled.heart.style;
                    } else if (signed && !bonus) {
                      itemClass = styled.done.class;
                      itemStyle = styled.done.style;
                    } else if (signed === null && !bonus) {
                      itemClass = styled.sign.class;
                      itemStyle = styled.sign.style;
                    } else if (!signed && signed !== null) {
                      itemClass = styled.date.class;
                      itemStyle = styled.date.style;
                    } else if (signed && bonus) {
                      itemClass = styled.signed.class;
                      itemStyle = styled.signed.style;
                    }
                    return (
                      <li key={date} className={classNames(itemClass)} style={itemStyle}>
                        {date}
                      </li>
                    );
                  })
                )}
            </ul>
            <div className="relative flex justify-between items-center mt-4">
              <span className="">{t("daily.consecutive_check_in")}</span>
              <div className="w-9/12">
                <div className="flex text-end px-2">
                  <span className="w-1/2">3天</span>
                  <span className="w-1/2">7天</span>
                </div>
                <div className="w-full bg-white border-2 border-solid border-bbk opacity-100 rounded-full h-4">
                  <div className="bg-og h-full rounded-full" style={{ width: `${dailyList.currentProgress}` }}></div>
                </div>
                <div className="flex-col items-center px-2">
                  <div className="flex mt-1">
                    <p className="w-1/2 flex justify-end items-center">
                      <span>+{dailyList.three_days_coin}</span>
                      <img src="/images/coin.png" alt="" width="15px" height="15px" className="ml-2" />
                    </p>
                    <p className="w-1/2 flex justify-end items-center">
                      <span>+{dailyList.seven_days_coin}</span>
                      <img src="/images/coin.png" alt="" width="15px" height="15px" className="ml-2" />
                    </p>
                  </div>
                  <div className="flex mt-1">
                    <p className="w-1/2 flex justify-end items-center">
                      <span>+{dailyList.three_days_exp}</span>
                      <span>exp</span>
                    </p>
                    <p className="w-1/2 flex justify-end items-center">
                      <span>+{dailyList.seven_days_exp}</span>
                      <span>exp</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative text-white">
              <div className="flex justify-between items-center mt-2">
                {!logined ? (
                  <button
                    className="bg-og w-32 rounded-lg py-2"
                    onClick={() => setDialogOpen({ ...dialogOpen, login: true })}
                  >
                    {t("login.login")}
                  </button>
                ) : (
                  <button className="bg-og w-32 rounded-lg py-2" onClick={() => check && handleCheckEvent()}>
                    {t("daily.check_in_now")}
                  </button>
                )}
                <button className="bg-gy w-32 rounded-lg py-2" onClick={() => navigate(location.state?.from || "/")}>
                  {t("comic.close")}
                </button>
              </div>
              <button
                className={`w-36 border-2 border-dashed border-[#bbb] rounded-lg py-1 my-4 ${
                  allSigned ? "bg-gy" : "bg-[#ebebeb] text-[#bbb]"
                }`}
                onClick={() => allSigned && handleFullCheckEvent()}
              >
                {t("daily.full_check_in_reward")}
              </button>
              <p className="text-red-600">{t("daily.monthly_check_in_bonus")}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16">
        <BottomNav currentPage="main" />
      </div>
      {(dialogOpen.login || dialogOpen.signUp || dialogOpen.forgot) && !logined && (
        <MemberModal
          setFormData={setFormData}
          formData={formData}
          setConfig={setConfig}
          logined={logined}
          isLoading={isLoading}
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          showSnackbar={showSnackbar}
        />
      )}
      <PositionedSnackbar setSnackbars={setSnackbars} snackbars={snackbars} />
    </>
  );
};
export default Daily;
