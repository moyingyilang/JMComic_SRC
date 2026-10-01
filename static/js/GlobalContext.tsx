import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { FETCH_ALL_ADS_THUNK, FETCH_COVER_ADS_THUNK } from "./actions/mainAction";
import { FETCH_LOGIN_THUNK } from "./actions/memberAction";
import { FETCH_GET_SETTINGS_THUNK } from "./actions/settingAction";
import DarkModeToggle from "./components/Common/DarkModeToggle";
import { AppDispatch } from "./store";

interface GlobalConfig {
  hostReady: boolean;
  host: string;
  setting: Record<string, any>;
  memberInfo: Record<string, any>;
  app_img_shunt: string;
  express: string;
  darkMode: boolean;
  paginationMode: "infinite" | "click";
  langCode: string;
  lang: string;
  logined: boolean;
  error: string;
  ads: Record<string, any>;
  adsContent: Record<string, any>;
  version: string;
  oldAdsCache: string;
  showdone: boolean;
  defaultCoverImg: string;
}

const defaultConfig: GlobalConfig = {
  hostReady: false,
  host: "",
  setting: {},
  memberInfo: {},
  app_img_shunt: "1",
  express: "",
  langCode: "0",
  lang: "TW",
  darkMode: false,
  paginationMode: "infinite",
  logined: false,
  error: "",
  ads: {},
  adsContent: {},
  version: "0.0.0",
  oldAdsCache: "0",
  showdone: false,
  defaultCoverImg: "/images/cover_default.jpg",
};

const GlobalConfigContext = createContext<{
  config: GlobalConfig;
  setConfig: React.Dispatch<React.SetStateAction<GlobalConfig>>;
}>({
  config: defaultConfig,
  setConfig: () => {},
});

export const useGlobalConfig = () => useContext(GlobalConfigContext);

export const GlobalConfigProvider = ({ children }: any) => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [config, setConfig] = useState<GlobalConfig>(() => {
    const app_img_shunt = sessionStorage.getItem("imageSource") || "1";
    const memberInfo = JSON.parse(localStorage.getItem("memberInfo") as string) || defaultConfig.memberInfo;
    const logined = localStorage.getItem("jwttoken") !== null;
    const host = localStorage.getItem("apiUrl") || "";
    const darkMode = localStorage.getItem("darkMode") === "true" || false;
    const paginationMode = (localStorage.getItem("paginationMode") as "infinite" | "click") || "infinite";
    const ads = JSON.parse(localStorage.getItem("adsList") as string) || {};
    const adsContent = JSON.parse(localStorage.getItem("adsContent") as string) || {};
    const oldAdsCache = localStorage.getItem("oldAdsCache") || "0";
    return { ...defaultConfig, oldAdsCache, adsContent, ads, host, app_img_shunt, memberInfo, logined, darkMode, paginationMode };
  });

  const savedDarkMode = localStorage.getItem("darkMode");
  const langStorage = localStorage.getItem("langCode");

  const [memberAccount, setMemberAccount] = useState(() => {
    const item = localStorage.getItem("memberAccount");
    return item ? JSON.parse(item) : null;
  });

  // // ✅ 自動登入
  const login = useCallback(async () => {
    if (!memberAccount) return;
    try {
      const result = await dispatch(
        FETCH_LOGIN_THUNK({
          username: memberAccount.username,
          password: memberAccount.password,
        })
      ).unwrap();

      if (result.code === 200) {
        setConfig((prev) => ({ ...prev, logined: true, memberInfo: result.data }));
      }
    } catch (err) {
      setConfig((prev) => ({ ...prev, logined: false }));
    }
  }, [dispatch, memberAccount]);

  // // ✅ 自動判斷登入狀態
  useEffect(() => {
    if (!config.logined && memberAccount && Object.keys(memberAccount).length > 0) {
      login();
    }
  }, [config.logined, memberAccount]);

  useEffect(() => {
    const handleStorage = () => {
      const item = localStorage.getItem("memberAccount");
      setMemberAccount(item ? JSON.parse(item) : null);
    };

    const handleAuthUpdated = (e: Event) => {
      const { logined, memberInfo } = (e as CustomEvent).detail;
      setConfig((prev) => ({ ...prev, logined, memberInfo }));
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("authUpdated", handleAuthUpdated);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("authUpdated", handleAuthUpdated);
    };
  }, []);

  useEffect(() => {
    if (savedDarkMode) {
      setConfig({ ...config, darkMode: savedDarkMode === "true" });
    } else {
      localStorage.setItem("darkMode", "false");
    }

    if (langStorage) {
      setConfig({ ...config, langCode: langStorage, lang: langStorage === "1" ? "CN" : "TW" });
    } else {
      localStorage.setItem("langCode", "0");
    }
    const langCode = langStorage === "1" ? "zh-CN" : "zh-TW";
    const lang = langStorage === "1" ? "CN" : "TW";
    localStorage.setItem("lang", lang);
    i18n.changeLanguage(langCode);
  }, [savedDarkMode]);

  useEffect(() => {
    const { hostReady, host, setting, ads, adsContent, lang, oldAdsCache, showdone } = config;

    if ((!hostReady && host === "" && Object.keys(setting).length === 0) || showdone) return;

    const { ad_cache_version: v } = setting;
    if (!v) return;

    const ipcountryChanged = !!setting.ipcountry && setting.ipcountry !== localStorage.getItem("adsIpcountry");

    const cacheChanged = v !== Number(oldAdsCache);
    const needAllAds = Object.keys(ads).length === 0 || cacheChanged || ipcountryChanged;
    const needCoverAds = Object.keys(adsContent).length === 0 || cacheChanged || ipcountryChanged;
    if (!needAllAds && !needCoverAds) return;

    const getAds = async () => {
      const adsList = await dispatch(FETCH_ALL_ADS_THUNK({ ipcountry: setting.ipcountry, v })).unwrap();
      if (adsList) {
        localStorage.setItem("adsList", JSON.stringify(adsList));
        setConfig((prev) => ({ ...prev, ads: adsList }));
      }
    };
    const getAdsContent = async () => {
      const coverAds = await dispatch(FETCH_COVER_ADS_THUNK({ ipcountry: setting.ipcountry, v })).unwrap();
      if (coverAds) {
        localStorage.setItem("adsContent", JSON.stringify(coverAds));
        setConfig((prev) => ({ ...prev, adsContent: coverAds }));
      }
    };
    if (needAllAds) getAds();
    if (needCoverAds) getAdsContent();
    localStorage.setItem("oldAdsCache", String(v));
    if (setting.ipcountry) localStorage.setItem("adsIpcountry", setting.ipcountry);
  }, [config.hostReady, config.setting.ipcountry]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!config.hostReady) return;

    const fetchSettingImgSource = async () => {
      try {
        const { setting, app_img_shunt, lang, showdone } = config;
        let info = setting;

        if (Object.keys(setting).length === 0 || app_img_shunt !== "0") {
          info = await dispatch(FETCH_GET_SETTINGS_THUNK({ app_img_shunt, lang })).unwrap();
          if (info?.ipcountry) localStorage.setItem("ipcountry", info.ipcountry);
          setConfig((prevConfig) => ({
            ...prevConfig,
            setting: showdone ? {} : info || prevConfig.setting,
            imgSource: app_img_shunt || prevConfig.app_img_shunt,
            express: "",
          }));
        }
      } catch (error) {
        console.error("setting error", error);
      }
    };
    fetchSettingImgSource();
  }, [config.hostReady, config.app_img_shunt, config.lang]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GlobalConfigContext.Provider value={{ config, setConfig }}>
      {children}
      <DarkModeToggle />
    </GlobalConfigContext.Provider>
  );
};
