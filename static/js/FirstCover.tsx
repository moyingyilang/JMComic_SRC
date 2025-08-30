import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AdComponent from "../../Ads/AdComponent";
import { CircularProgress } from "@mui/material";
import { getRandomItems } from "../../../utils/Function";
import { clearAuth } from "../../../Hooks/useAuth";
import GlobalStore from "../../../config/GlobalStore";

const FirstPlate = (props: any) => {
  const { config, setConfig, onNext, ads } = props;
  const { t } = useTranslation();
  const [selectHost, setSelectHost] = useState({ line: "", lineKey: 1, lineIndex: 0 });
  const { indexes } = getRandomItems(ads["app_route"]?.advs);
  const [loading, setLoading] = useState(true);
  const hostServer = GlobalStore.hostServer;
  const randomItem = useMemo(() => {
    return getRandomItems(hostServer, hostServer?.length).items;
  }, [hostServer]);

  const switchHost = (newHost: string, index: number) => {
    setSelectHost({ ...selectHost, line: newHost, lineKey: index, lineIndex: index });
    const newUrl = `https://${newHost}${window.location.pathname}`;
    //  ${window.location.protocol}
    GlobalStore.updateApiUrl(newUrl);
    setConfig((prev: any) => ({ ...prev, host: newUrl }));
    const timer = setTimeout(() => {
      onNext();
    }, 500);
    return () => clearTimeout(timer);
  };
  useEffect(() => {
    if (config.hostReady) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [config.hostReady]);

  return (
    <>
      <div className="w-full min-h-screen bg-[#545454] absolute left-0 top-0 z-50 pb-20">
        <>
          <div className="flex justify-center items-center mx-auto mt-24 overflow-hidden">
            <div className="h-[250px]">
              <AdComponent adKey="app_route" adIndex={indexes[0]} />
            </div>
          </div>
          <div className="m-auto text-center">
            <div className="text-white my-8">
              <p className="text-lg mb-3">{t("modal.please_select_network")}</p>
              <p className="">{t("modal.network_troubleshooting_hint")}</p>
            </div>
            <div className="text-og flex flex-col items-center">
              {loading ? (
                <div className="w-full text-white mt-10">
                  <CircularProgress color="inherit" size={30} />
                  <p className="text-lg my-4">{t("modal.loading_network")}</p>
                </div>
              ) : (
                <>
                  {randomItem?.length > 0 &&
                    randomItem.map((d: any, i: number) => (
                      <button
                        key={d}
                        className={`border-2 border-og rounded-full w-2/5 p-3 mb-5 flex justify-center items-center
                    ${selectHost.lineKey === i + 1 ? "bg-og text-white" : ""}`}
                        onClick={() => switchHost(d[0], i + 1)}
                      >
                        <span className="ml-4">{d[1]}</span>
                        <div className="bg-green-600 w-2 h-2 rounded-full ml-4"></div>
                        <span className="ml-1 text-t08">{t("modal.smooth")}</span>
                        <div className="text-white ml-4">
                          {selectHost.lineIndex === i + 1 && <CircularProgress color="inherit" size={10} />}
                        </div>
                      </button>
                    ))}
                </>
              )}
            </div>
          </div>
        </>
      </div>
    </>
  );
};

export default FirstPlate;
