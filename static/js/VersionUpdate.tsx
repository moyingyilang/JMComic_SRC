import { useEffect, useRef, useState } from "react";
import { CircularProgress } from "@mui/material";
import { fetchRemoteVersion, getLocalVersion, runOtaFlow } from "../../utils/hotModule";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import LinearProgress, { LinearProgressProps } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import GlobalStore from "../../config/GlobalStore";

const VersionUpdate = (props: any) => {
  const { config, visible } = props;
  const [loading, setLoading] = useState(true);
  const { jm3_version_info, download_url, app_landing_page } = config.setting;
  const version = localStorage.getItem("newVersion") || "";
  const dispatch = useAppDispatch();
  const { hotUpdateModalProgress, newVersion } = useAppSelector((state) => state.hotUpdate);

  useEffect(() => {
    if (Object.keys(config.setting).length > 0) {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [config.setting]);

  const handleUpdate = () => {
    runOtaFlow(dispatch, { hotUpdate: { newVersion } } as RootState);
  };

  function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 2 }}>
        <Box
          sx={{
            width: "100%",
            bgcolor: "#fff3e0",
            borderRadius: 1,
            px: 0.25,
            py: 0.25,
          }}
        >
          <LinearProgress
            variant="determinate"
            {...props}
            sx={{
              height: 6,
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#ff7b00",
              },
            }}
          />
        </Box>
        <Box sx={{ minWidth: 35, color: "white" }}>
          <Typography>{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      {visible && (
        <div className="w-full min-h-screen bg-[#545454] text-white absolute left-0 top-0 flex flex-col justify-center items-center z-50">
          <div>
            {loading ? (
              <CircularProgress color="inherit" size={30} />
            ) : (
              <>
                <h1 className="text-xl">目前最新版本為v{version}</h1>
                <p>本次更新內容</p>
                <br />
                <div
                  className="min-h-[200px]"
                  dangerouslySetInnerHTML={{
                    __html: jm3_version_info?.replace(/\n/g, "<br />"),
                  }}
                />
                <div className="my-10">
                  <button
                    className="w-full bg-blue-500 p-2 shadow-lg rounded shadow-stone-700/50"
                    onClick={() => handleUpdate()}
                  >
                    數據包更新
                  </button>
                  <Box sx={{ width: "100%" }}>
                    <LinearProgressWithLabel value={hotUpdateModalProgress} />
                  </Box>
                  <p className="my-2">無法更新？請點選下方 spk 載點</p>
                  <a href={GlobalStore.apiUrl + "static/apk/JMComic3v2.0.3.apk?v=20250802"}>
                    <button className="w-full bg-og p-2 shadow-lg rounded shadow-stone-700/50 mb-3">下載點1</button>
                  </a>
                  <a href={app_landing_page}>
                    <button className="w-full bg-og p-2 shadow-lg rounded shadow-stone-700/50">下載點2</button>
                  </a>
                </div>
                <img
                  src="/images/updateversionbn.png"
                  alt="memberbn"
                  width="300px"
                  height="auto"
                  className="rounded-2xl"
                />
                <div className="flex justify-between mt-10 mb-2">
                  <span>© 2008-2025 禁漫天堂</span>
                  <span>JM v{config.version}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VersionUpdate;
