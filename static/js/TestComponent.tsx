import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import AdComponent from "../components/Ads/AdComponent";
import { useGlobalConfig } from "../GlobalContext";
import PositionedSnackbar, { useSnackbarState } from "../components/Alert/PositionedSnackbar";

const TestComponent = () => {
  const { config } = useGlobalConfig();
  // const { ads } = config;
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const [ads, setAds] = useState<Record<string, any>>({});

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showSnackbar("copied");
    });
  };

  // console.log(ads, "adsadsadsads");

  return (
    <>
      {Object.entries(ads)
        // .slice(0, 10) //數量
        .filter(([key]) => key?.includes("jm3"))
        // .filter(([_, value]) => value.adv_desc?.includes("搜尋頁下方"))
        // .filter(([_, value]) => value.adv_height === '300')
        .map(([key, value]) => (
          <div>
            <div className="mt-5" onClick={() => copyToClipboard(key)}>
              keyName: <span className="ml-2">{key}</span> {/* //點擊可copy */}
              <p className="text-og">
                {value.adv_desc}&nbsp;&nbsp;
                {value.adv_group_name}
              </p>
              type:<span className="ml-2">{value.advs ? value.advs[0].adv_type : ""}</span>
            </div>
            <div className="w-full flex justify-center">
              <AdComponent adKey={key} />
            </div>
          </div>
        ))}
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
    </>
  );
};

export default TestComponent;

// return (
//   <div>
//     <h1>{t("welcome")}</h1>
//     <h1>{t("description")}</h1>
//     <h2>{t("hello.name")}</h2>
//     <h2>{t("hello", { ns: "settings" })}</h2>
//     <h2>{t("new.0.title", { returnObjects: true, ns: "settings" })}</h2>
//     <br />
//     <button onClick={() => switchLanguage("zh-TW")}>切换到繁体中文</button>
//     <br />
//     <button onClick={() => switchLanguage("zh-CN")}>切换到简体中文</button>
//   </div>
// );
