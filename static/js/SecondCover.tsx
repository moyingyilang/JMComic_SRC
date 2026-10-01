import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { useDelayedFlag } from "../../../Hooks";
import AdComponent from "../../Ads/AdComponent";

const SecondCover = (props: any) => {
  const { onNext } = props;
  const { t } = useTranslation();
  const showCloseBtn = useDelayedFlag(3000);

  return (
    <>
      <div className="w-full h-full absolute left-0 top-0 z-50 bg-white dark:bg-[#545454]">
        <div className="relative w-full h-28 flex justify-center items-end">
          <span className="">{t("modal.ad_close_hint")}</span>
          {showCloseBtn && (
            <button className="absolute top-20 right-8 rounded-3xl bg-zinc-950 w-8 h-8 z-10" onClick={() => onNext()}>
              <CloseIcon sx={{ fontSize: 16, stroke: "red", strokeWidth: 2, color: "red" }} />
            </button>
          )}
        </div>
        {["app_splash", "app_splash2", "app_splash_bottom"].map((adKey: string) => (
          <div key={adKey} className="flex justify-center items-center mx-auto mt-4 overflow-hidden">
            <AdComponent adKey={adKey} />
          </div>
        ))}
      </div>
    </>
  );
};

export default SecondCover;
