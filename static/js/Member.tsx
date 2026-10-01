import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { useScrollToTop } from "../../Hooks";
import { clearAuth } from "../../Hooks/useAuth";
import { FETCH_AD_FREE_THUNK, FETCH_CHARGE_THUNK, FETCH_LOGIN_THUNK } from "../../actions/memberAction";
import { CommonQData, MemberCardData } from "../../assets/JsonData";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import HeaderAds from "../../components/Common/HeaderAds";
import BottomNav from "../../components/Main/BottomNav";
import AchievementList from "../../components/Member/AchievementList";
import CenterCard from "../../components/Member/CenterCard";
import CommentList from "../../components/Member/CommentList";
import DailyList from "../../components/Member/DailyList";
import InfoList from "../../components/Member/InfoList";
import MarkList from "../../components/Member/MarkList";
import NotificationList from "../../components/Member/NotificationList";
import NovelMarkList from "../../components/Member/NovelMarkList";
import OrderRecordList from "../../components/Member/OrderRecordList";
import ReadList from "../../components/Member/ReadList";
import SettingList from "../../components/Member/SettingList";
import Tab from "../../components/Member/Tab";
import TagBlockSetting from "../../components/Member/TagBlockSetting";
import TagMarkList from "../../components/Member/TagMarkList";
import TrackedList from "../../components/Member/TrackedList";
import MemberModal from "../../components/Modal/MemberModal";
import MsgModal from "../../components/Modal/MsgModal";
import { LOAD_MEMBER_INFO_LIST } from "../../reducers/memberReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { defaultUserFormData } from "../../utils/InterFace";

const Member = () => {
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined, adsContent } = config;
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
  const headerAdsRef = useRef<HTMLDivElement>(null);
  const [headerAdsHeight, setHeaderAdsHeight] = useState(0);
  const CENTER_CARD_EXPANDED_HEIGHT = 110;
  const centerCardStickyHeight = !logined || scrollUp ? CENTER_CARD_EXPANDED_HEIGHT : 0;
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
    clearAuth(setConfig);
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
      }, 1000);
    }
  };

  const refreshSession = async () => {
    if (!memberAccount) return;
    localStorage.removeItem("jwttoken");
    return await dispatch(
      FETCH_LOGIN_THUNK({
        username: memberAccount.username,
        password: memberAccount.password,
      })
    ).unwrap();
  };

  // coinCharge && AdFree
  type ChargeAdFreeParams =
    | { coinCharge: true; adFree?: never; type?: never }
    | { coinCharge?: false; adFree: true; type: string };

  const handleChargeAdFree = async (params: ChargeAdFreeParams) => {
    try {
      const result = params.coinCharge
        ? await dispatch(FETCH_CHARGE_THUNK()).unwrap()
        : await dispatch(FETCH_AD_FREE_THUNK({ type: params.type })).unwrap();

      if (result.data.status === "ok") {
        await refreshSession();
      }
    } catch (error) {
      console.error("charge / ad-free 请求失败", error);
    }
  };

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (headerAdsRef.current) setHeaderAdsHeight(headerAdsRef.current.offsetHeight);
    });
    if (headerAdsRef.current) observer.observe(headerAdsRef.current);
    return () => observer.disconnect();
  }, []);

  //滾動上方顯示個人資訊
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrollUp(true);
      } else {
        setScrollUp(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!logined) {
      scrollToTop();
      return;
    }
    if (tab === 0) {
      setTab(unreadCount > 0 ? 4 : 1);
    }
    setInfoData(memberInfo);
  }, [logined]);

  const tabParam = searchParams.get("tab");
  useEffect(() => {
    if (tabParam === "4" && tab !== 4) {
      setTab(4);
    }
  }, [tabParam, tab]);

  // 順序需對應 member_card.tab_items（設定除外，見 isSettingsTab）
  const tabPanels: Array<() => JSX.Element> = [
    () => <MarkList t={t} setting={setting} logined={logined} showSnackbar={showSnackbar} />,
    () => <NovelMarkList t={t} setting={setting} logined={logined} showSnackbar={showSnackbar} />,
    () => <TagMarkList t={t} setting={setting} logined={logined} showSnackbar={showSnackbar} />,
    () => (
      <NotificationList
        t={t}
        memberInfo={memberInfo}
        unread={unread}
        unreadCount={unreadCount}
        setting={setting}
        logined={logined}
        showSnackbar={showSnackbar}
        openIndex={openIndex}
        setOpenIndex={setOpenIndex}
      />
    ),
    () => (
      <TrackedList
        t={t}
        unread={unread}
        logined={logined}
        showSnackbar={showSnackbar}
        openIndex={openIndex}
        setOpenIndex={setOpenIndex}
      />
    ),
    // () => <SpeedTest />,
    () => (
      <TagBlockSetting t={t} setting={setting} logined={logined} memberInfo={memberInfo} showSnackbar={showSnackbar} />
    ),
    () => (
      <AchievementList
        t={t}
        setConfig={setConfig}
        setting={setting}
        logined={logined}
        memberInfo={memberInfo}
        showSnackbar={showSnackbar}
      />
    ),
    () => <DailyList t={t} setting={setting} logined={logined} memberInfo={memberInfo} showSnackbar={showSnackbar} />,
    () => <OrderRecordList t={t} logined={logined} memberInfo={memberInfo} refreshSession={refreshSession} />,
    () => <ReadList t={t} setting={setting} logined={logined} showSnackbar={showSnackbar} />,
    () => <CommentList t={t} setting={setting} logined={logined} memberInfo={memberInfo} showSnackbar={showSnackbar} />,
    () => <InfoList t={t} setting={setting} logined={logined} memberInfo={memberInfo} showSnackbar={showSnackbar} />,
  ];
  const isSettingsTab = Array.isArray(tabItems) && tab === tabItems.length;

  return (
    <>
      <div className="w-full bg-nbk text-white">
        <div ref={headerAdsRef} className="bg-nbk sticky top-safe flex flex-col z-40">
          <HeaderAds />
        </div>
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
          stickyTop={headerAdsHeight - 1}
        />
        <Tab
          logined={logined}
          tabItems={tabItems}
          tab={tab}
          setTab={setTab}
          unread={unread}
          openIndex={openIndex}
          notifResult={notifResult}
          stickyTop={headerAdsHeight + centerCardStickyHeight - 1}
        />
        {!isSettingsTab ? (
          logined ? (
            <div className="bg-defaultBg min-h-screen dark:bg-bk">{tabPanels[tab - 1]?.()}</div>
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
              adsContent={adsContent}
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
          setConfig={setConfig}
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
