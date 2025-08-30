import { useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { useDelayedFlag } from "../../../Hooks";
import AdComponent from "../../Ads/AdComponent";
import { getRandomItems } from "../../../utils/Function";
import { LOAD_MAIN_LIST } from "../../../reducers/mainReducer";
import { FETCH_COVER_ADS_THUNK } from "../../../actions/mainAction";
import { useAppDispatch } from "../../../store/hooks";

const SecondCover = (props: any) => {
  const { setting, onNext, ads } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const showCloseBtn = useDelayedFlag(3000);
  const { indexes: firstRandomItem } = getRandomItems(ads["app_splash"]?.advs);
  const { indexes: secondRandomItem } = getRandomItems(ads["app_splash2"]?.advs);

  useEffect(() => {
    if (setting.ipcountry) {
      const ipcountry = setting.ipcountry;
      const lang = setting.is_cn === 0 ? "TW" : "CN";
      dispatch(LOAD_MAIN_LIST({ isLoading: true }));
      dispatch(FETCH_COVER_ADS_THUNK({ lang, ipcountry }));
    }
  }, [setting.ipcountry]);

  return (
    <>
      <div className="w-full min-h-screen absolute left-0 top-0 z-50 bg-white dark:bg-[#545454]">
        <div className="relative w-full h-28 flex justify-center items-end">
          <span className="">{t("modal.ad_close_hint")}</span>
          {showCloseBtn && (
            <button className="absolute top-20 right-8 rounded-3xl bg-zinc-950 w-8 h-8 z-10" onClick={onNext}>
              <CloseIcon sx={{ fontSize: 16, stroke: "red", strokeWidth: 2, color: "red" }} />
            </button>
          )}
        </div>
        {[
          { key: "app_splash", index: firstRandomItem[0] },
          { key: "app_splash2", index: secondRandomItem[0] },
        ].map(({ key, index }) => (
          <div key={key} className="flex justify-center items-center mx-auto mt-10 overflow-hidden">
            <AdComponent adKey={key} adIndex={index} />
          </div>
        ))}
      </div>
    </>
  );
};

export default SecondCover;
