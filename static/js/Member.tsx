import { useState, useEffect, useRef } from "react";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useTranslation } from "react-i18next";
import Tab from "../../components/Member/Tab";
import CenterCard from "../../components/Member/CenterCard";
import MarkList from "../../components/Member/MarkList";
import TagMarkList from "../../components/Member/TagMarkList";
import AchievementList from "../../components/Member/AchievementList";
import DailyList from "../../components/Member/DailyList";
import ReadList from "../../components/Member/ReadList";
import CommentList from "../../components/Member/CommentList";
import InfoList from "../../components/Member/InfoList";
import SettingList from "../../components/Member/SettingList";
import NotificationList from "../../components/Member/NotificationList";
import TrackedList from "../../components/Member/TrackedList";
import BottomNav from "../../components/Main/BottomNav";
import MsgModal from "../../components/Modal/MsgModal";
import MemberModal from "../../components/Modal/MemberModal";
import { FETCH_CHARGE_THUNK, FETCH_AD_FREE_THUNK, FETCH_LOGIN_THUNK } from "../../actions/memberAction";
import { CommonQData, MemberCardData } from "../../assets/JsonData";
import { defaultUserFormData } from "../../utils/InterFace";
import { useLocation, useNavigate } from "react-router-dom";
import { useScrollToTop } from "../../Hooks";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import { LOAD_MEMBER_INFO_LIST } from "../../reducers/memberReducer";
import Cookies from "js-cookie";
import { clearAuth } from "../../Hooks/useAuth";

const Member = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined } = config;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const MemberCard = MemberCardData();
  const CommonQ = CommonQData();
  const scrollToTop = useScrollToTop();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const tabItems = t("member_card.tab_items", { returnObjects: true });
  const dispatch = useAppDispatch();
  const { unread, notifResult, isLoading, isInfoLoading, isInfoRefreshing } = useAppSelector((state) => state.member);
  const [dialogOpen, setDialogOpen] = useState({
    login: false,
    signUp: false,
    forgot: false,
    invite: false,
    charge: false,
    invincible: false,
    newTopic: false,
  });
  const [msgOpen, setMsgOpen] = useState({ member: false, invite: false, charge: false });
  const [scrollUp, setScrollUp] = useState(false);
  const [formData, setFormData] = useState(defaultUserFormData);
  const memberInfo = JSON.parse(localStorage.getItem("memberInfo") as string);
  const searchParams = new URLSearchParams(location.search);
  const initTab = logined ? 0 : 1;
  const [tab, setTab] = useState(() => {
    const stored = sessionStorage.getItem("memberTab");
    return stored !== null ? JSON.parse(stored) : initTab;
  });
  const [infoData, setInfoData] = useState(memberInfo || {});
  const memberProgress = Number(memberInfo?.charge?.split("/")[0]);
  const memberProgressMax = Number(memberInfo?.charge?.split("/")[1]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  sessionStorage.setItem("fromPage", `${location.pathname}?tab=${tab}`);
  const memberAccount = JSON.parse(localStorage.getItem("memberAccount") as string);
  const unreadCount = unread.comic_follow + unread.site_notice || 0;

  const loadInfoData = (isInfoLoading: boolean = true, isInfoRefreshing: boolean = true) => {
    dispatch(LOAD_MEMBER_INFO_LIST({ isInfoLoading, isInfoRefreshing }));
  };

  //isRefreshing
  const handleRefresh = async () => {
    loadInfoData();
    setInfoData({});
    clearAuth();
    if (!isInfoLoading && !isInfoRefreshing) {
      const result = await dispatch(
        FETCH_LOGIN_THUNK({
          username: memberAccount.username,
          password: memberAccount.password,
        })
      ).unwrap();
      if (result.code === 200) {
        setTimeout(() => {
          setInfoData(result.data);
          loadInfoData(false, false);
        }, 2000);
      }
    } else if (memberInfo) {
      setInfoData(memberInfo);
    }
  };

  // coinCharge && AdFree
  const handleChargeAdFree = async ({
    coinCharge = false,
    AdFree = false,
    type = "",
  }: {
    coinCharge?: boolean;
    AdFree?: boolean;
    type?: string;
  }) => {
    if (coinCharge) {
      const result = await dispatch(FETCH_CHARGE_THUNK()).unwrap();
      if (result.data.status === "ok" && memberAccount) {
        // 改變info狀態
        localStorage.removeItem("jwttoken");
        dispatch(FETCH_LOGIN_THUNK({ username: memberAccount.username, password: memberAccount.password }));
      }
    } else if (AdFree && type !== "") {
      const result = await dispatch(FETCH_AD_FREE_THUNK({ type })).unwrap();
      if (result.data.status === "ok" && memberAccount) {
        // 改變info狀態
        localStorage.removeItem("jwttoken");
        dispatch(FETCH_LOGIN_THUNK({ username: memberAccount.username, password: memberAccount.password }));
      }
    }
  };

  //滾動上方顯示個人資訊
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrollUp(true);
      } else {
        setScrollUp(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    scrollToTop();
    if (logined) {
      if (tab === 0 && unreadCount > 0) {
        setTab(3);
      }
      setInfoData(memberInfo);
    }
  }, [logined]);

  return (
    <>
      <div className="w-full bg-nbk text-white">
        <CenterCard
          t={t}
          logined={logined}
          setting={setting}
          infoData={infoData}
          isInfoRefreshing={isInfoRefreshing}
          handleRefresh={handleRefresh}
          MemberCard={MemberCard}
          scrollUp={scrollUp}
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          memberProgress={memberProgress}
          memberProgressMax={memberProgressMax}
          setMsgOpen={setMsgOpen}
          msgOpen={msgOpen}
        />
        <Tab
          logined={logined}
          tabItems={tabItems}
          tab={tab}
          setTab={setTab}
          unread={unread}
          openIndex={openIndex}
          notifResult={notifResult}
        />
        {tab !== 10 ? (
          logined ? (
            <div className="bg-defaultBg min-h-screen dark:bg-bk">
              {tab === 1 && <MarkList t={t} setting={setting} logined={logined} showSnackbar={showSnackbar} />}
              {tab === 2 && <TagMarkList t={t} setting={setting} logined={logined} showSnackbar={showSnackbar} />}
              {tab === 3 && (
                <NotificationList
                  t={t}
                  unread={unread}
                  unreadCount={unreadCount}
                  setting={setting}
                  logined={logined}
                  showSnackbar={showSnackbar}
                  openIndex={openIndex}
                  setOpenIndex={setOpenIndex}
                />
              )}
              {tab === 4 && (
                <TrackedList
                  t={t}
                  unread={unread}
                  logined={logined}
                  showSnackbar={showSnackbar}
                  openIndex={openIndex}
                  setOpenIndex={setOpenIndex}
                />
              )}
              {tab === 5 && (
                <AchievementList
                  t={t}
                  setConfig={setConfig}
                  setting={setting}
                  logined={logined}
                  memberInfo={memberInfo}
                  showSnackbar={showSnackbar}
                />
              )}
              {tab === 6 && (
                <DailyList
                  t={t}
                  setting={setting}
                  logined={logined}
                  memberInfo={memberInfo}
                  showSnackbar={showSnackbar}
                />
              )}
              {tab === 7 && <ReadList t={t} setting={setting} logined={logined} showSnackbar={showSnackbar} />}
              {tab === 8 && (
                <CommentList
                  t={t}
                  setting={setting}
                  logined={logined}
                  memberInfo={memberInfo}
                  showSnackbar={showSnackbar}
                />
              )}
              {tab === 9 && (
                <InfoList
                  t={t}
                  setting={setting}
                  logined={logined}
                  memberInfo={memberInfo}
                  showSnackbar={showSnackbar}
                />
              )}
            </div>
          ) : (
            <div className="w-full bg-defaultBg text-bbk min-h-screen dark:bg-bbk dark:text-tgy">
              <div className="bg-white dark:bg-bbk flex justify-center items-center text-xl h-[400px]">
                {t("login.please_login")}
              </div>
            </div>
          )
        ) : (
          <div className="bg-defaultBg min-h-screen dark:bg-bk">
            <SettingList
              t={t}
              i18n={i18n}
              setting={setting}
              setConfig={setConfig}
              logined={logined}
              memberInfo={memberInfo}
              showSnackbar={showSnackbar}
            />
          </div>
        )}
      </div>
      <BottomNav currentPage="member" />
      {msgOpen.member && <MsgModal t={t} content={CommonQ} msgOpen={msgOpen} setMsgOpen={setMsgOpen} />}
      {dialogOpen.invite && (
        <MemberModal
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          memberInfo={memberInfo}
          showSnackbar={showSnackbar}
        />
      )}
      {(dialogOpen.charge || dialogOpen.invincible) && (
        <MemberModal
          setConfig={setConfig}
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          handleChargeAdFree={handleChargeAdFree}
          showSnackbar={showSnackbar}
        />
      )}
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
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
    </>
  );
};

export default Member;
