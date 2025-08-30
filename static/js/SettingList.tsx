import { useState } from "react";
import MemberModal from "../../components/Modal/MemberModal";
import DialogModal from "../Modal/DialogModal";
import { SettingLinkData } from "../../assets/JsonData";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import DarkModeToggle from "../Common/DarkModeToggle";
import { clearAuth } from "../../Hooks/useAuth";
import { getRandomItems } from "../../utils/Function";
import { useAppDispatch } from "../../store/hooks";
import { FETCH_SETTINGS_THUNK } from "../../actions/settingAction";

const SettingList = (props: any) => {
  const { t, i18n, memberInfo, setting, setConfig, showSnackbar } = props;
  const dispatch = useAppDispatch();
  const [dialogOpen, setDialogOpen] = useState({
    setting: false,
    imageSource: false,
    darkMode: false,
    lang: false,
    watchAds: false,
    logout: false,
  });
  const settingData = SettingLinkData();
  const linkdata = JSON.parse(localStorage.getItem("adsContent") as string);
  const coverLinks = linkdata.link?.exchange_link;
  const LinksAdd = coverLinks ? coverLinks.show_max - coverLinks.first_links?.length : 1;
  const { items: secondRandomItem } = getRandomItems(coverLinks?.second_links, LinksAdd);
  const allLinks = [...(coverLinks?.first_links || []), ...secondRandomItem];
  const [langChange, setLangChange] = useState(() => {
    const langValue = localStorage.getItem("lang");
    if (langValue === "0") return "zh-TW";
    if (langValue === "1") return "zh-CN";
    return "zh-TW"; // 預設值
  });

  const switchLanguage = () => {
    i18n.changeLanguage(langChange);
    const lang = langChange === "zh-CN" ? "1" : "0";
    localStorage.setItem("lang", lang);
    setConfig((prev: any) => ({ ...prev, lang }));
    dispatch(FETCH_SETTINGS_THUNK(lang));
  };

  return (
    <>
      <div className="w-full text-[#aaa] dark:text-tgy pb-40">
        <ul className="pt-1 text-base">
          <div className="mt-5">
            {Array.isArray(settingData[0].new) &&
              settingData[0].new.map((item) => (
                <li key={item.name} className="bg-white flex justify-between items-center px-4 py-2 my-1 dark:bg-nbk">
                  <span className="text-bbk dark:text-tgy">{item.title}</span>
                  {item.name === t("setting.view_articles") ? (
                    <span onClick={() => setDialogOpen({ ...dialogOpen, setting: true })}>{item.name}</span>
                  ) : (
                    <a href={item.link} target="blank" rel="noreferrer">
                      {item.name}
                    </a>
                  )}
                </li>
              ))}
            {Array.isArray(allLinks) &&
              allLinks.map((item: any, index: number) => (
                <li key={item.name} className="bg-white flex justify-between items-center px-4 py-2 my-1 dark:bg-nbk">
                  <span className="text-bbk dark:text-tgy">{index === 0 && t("setting.site_link")}</span>
                  <a href={item.link} target="blank" rel="noreferrer">
                    {item.name}
                  </a>
                </li>
              ))}
            {Array.isArray(settingData[2].setting) &&
              settingData[2].setting.map((item) => (
                <li key={item.name} className="bg-white flex justify-between items-center px-4 py-2 my-1 dark:bg-nbk">
                  <span className="text-bbk dark:text-tgy">{item.title}</span>
                  {item.title === t("setting.language") && (
                    <span
                      className="text-og flex items-center"
                      onClick={() => setDialogOpen({ ...dialogOpen, lang: true })}
                    >
                      {item.name}
                      <KeyboardArrowRightIcon className="text-bbk dark:text-tgy" />
                    </span>
                  )}
                  {item.title === t("setting.switch_image_source") && (
                    <span
                      className="text-og flex items-center"
                      onClick={() => setDialogOpen({ ...dialogOpen, imageSource: true })}
                    >
                      {item.name}
                      <KeyboardArrowRightIcon className="text-bbk dark:text-tgy" />
                    </span>
                  )}
                  {item.title === t("setting.night_mode") && (
                    <div className="text-og flex items-center">
                      <DarkModeToggle isButtonVisible={true} />
                      <KeyboardArrowRightIcon className="text-bbk dark:text-tgy" />
                    </div>
                  )}
                </li>
              ))}
            {Array.isArray(settingData[3].sponsor) &&
              settingData[3].sponsor.map((item: any, index: number) => (
                <li key={item.name} className="bg-white flex justify-between items-center px-4 py-2 my-1 dark:bg-nbk">
                  <span className="text-bbk dark:text-tgy">{item.title}</span>
                  {index === 0 ? (
                    <a href={setting.donate_url} target="blank" rel="noreferrer">
                      {item.name}
                    </a>
                  ) : (
                    <button onClick={() => setDialogOpen({ ...dialogOpen, watchAds: true })}>{item.name}</button>
                  )}
                </li>
              ))}
            {Array.isArray(settingData[4].contact) &&
              settingData[4].contact.map((item) => (
                <li key={item.name} className="bg-white flex justify-between items-center px-4 py-2 my-1 dark:bg-nbk">
                  <span className="text-bbk dark:text-tgy">{item.title}</span>
                  <a href={item.link} target="blank" rel="noreferrer">
                    {item.name}
                  </a>
                </li>
              ))}

            {memberInfo !== null &&
              Array.isArray(settingData[5].logout) &&
              settingData[5].logout.map((item) => (
                <li
                  key={item.name}
                  className="bg-white flex justify-center items-center px-4 py-4 my-1  dark:bg-nbk"
                  onClick={() => setDialogOpen({ ...dialogOpen, logout: true })}
                >
                  <span className="text-og">{item.name}</span>
                </li>
              ))}
          </div>
        </ul>
        {(dialogOpen.setting || dialogOpen.lang || dialogOpen.logout) && (
          <MemberModal
            setDialogOpen={setDialogOpen}
            dialogOpen={dialogOpen}
            langChange={langChange}
            setLangChange={setLangChange}
            memberInfo={memberInfo}
            clearAuth={clearAuth}
            switchLanguage={switchLanguage}
            showSnackbar={showSnackbar}
            setConfig={setConfig}
          />
        )}
        <DialogModal setDialogOpen={setDialogOpen} dialogOpen={dialogOpen} />
      </div>
    </>
  );
};

export default SettingList;
