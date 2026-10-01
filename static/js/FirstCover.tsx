import { CircularProgress } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { clearAuth } from "../../../Hooks/useAuth";
import GlobalStore from "../../../config/GlobalStore";
import { getRandomItems } from "../../../utils/Function";
import { getSpeedLevel, speedLevelStyle } from "../../../utils/speedTestUtil";
import AdComponent from "../../Ads/AdComponent";

const FirstPlate = (props: any) => {
  const { config, setConfig, adFreeStatus, onNext } = props;
  const { ads } = config;
  const { t } = useTranslation();
  const [selectHost, setSelectHost] = useState({ line: "", lineKey: 1, lineIndex: 0 });
  const [loading, setLoading] = useState(true);
  const [lineLatency, setLineLatency] = useState<Record<string, number | null>>({});
  const hostServer = GlobalStore.hostServer;
  const randomItem = useMemo(() => {
    return getRandomItems(hostServer, hostServer?.length).items;
  }, [hostServer]);

  // 對每條線路各自打一次真實的設定 API，用實際延遲決定亮燈顏色（綠/橘/紅）
  // useEffect(() => {
  //   if (loading || !randomItem?.length) return;
  //   let cancelled = false;
  //   randomItem.forEach(([host, label]: [string, string]) => {
  //     testHostSpeedAndStore(host, label, { testImage: false }).then(({ latency }) => {
  //       if (!cancelled) setLineLatency((prev) => ({ ...prev, [label]: latency }));
  //     });
  //   });
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [loading, randomItem]);

  const switchHost = (newHost: string, index: number) => {
    setSelectHost({ ...selectHost, line: newHost, lineKey: index, lineIndex: index });
    const newUrl = `https://${newHost}${window.location.pathname}`;
    //  ${window.location.protocol}
    GlobalStore.updateApiUrl(newUrl);
    setConfig((prev: any) => ({ ...prev, host: newUrl }));
    const timer = setTimeout(() => {
      clearAuth(setConfig);
      if (!adFreeStatus) {
        onNext();
      } else {
        onNext(2);
      }
    }, 500);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    if (!config.hostReady || !config.setting) {
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [config.hostReady, config.setting]);

  return (
    <>
      <div className="w-full h-full bg-[#545454] absolute left-0 top-0 z-50 pb-20">
        <>
          <div className="flex justify-center items-center mx-auto mt-24 overflow-hidden">
            {!adFreeStatus ? (
              !loading && (
                <div className="h-[250px]">
                  <AdComponent adKey="app_route" />
                </div>
              )
            ) : (
              <div className="h-[150px]"></div>
            )}
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
                    randomItem.map((d: any, i: number) => {
                      const tested = Object.prototype.hasOwnProperty.call(lineLatency, d[1]);
                      // const level = getSpeedLevel(lineLatency[d[1]] ?? null);
                      const level = getSpeedLevel(500);
                      return (
                        <button
                          key={d}
                          className={`border-2 border-og rounded-full w-2/5 p-3 mb-5 flex justify-center items-center
                    ${selectHost.lineKey === i + 1 ? "bg-og text-white" : ""}`}
                          onClick={() => switchHost(d[0], i + 1)}
                        >
                          {/* <span className="ml-4">{d[1]}</span>
                          <div
                            className={`w-2 h-2 rounded-full ml-4 ${
                              tested ? speedLevelStyle[level].dot : "bg-gray-400 animate-pulse"
                            }`}
                          ></div>
                          <span className="ml-1 text-t08">
                            {tested ? t(`modal.${level}`) : t("modal.testing_line")}
                          </span>
                          <div className="text-white ml-4">
                            {selectHost.lineIndex === i + 1 && <CircularProgress color="inherit" size={10} />}
                          </div> */}

                          <span className="ml-4">{d[1]}</span>
                          <div className={`w-2 h-2 rounded-full ml-4 ${speedLevelStyle[level].dot}`}></div>
                          <span className="ml-1 text-t08">{t(`modal.smooth`)}</span>
                          <div className="text-white ml-4">
                            {selectHost.lineIndex === i + 1 && <CircularProgress color="inherit" size={10} />}
                          </div>
                        </button>
                      );
                    })}
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
