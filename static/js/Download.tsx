import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useTranslation } from "react-i18next";
import ReplayIcon from "@mui/icons-material/Replay";
import Loading from "../../components/Common/Loading";
import AdComponent from "../../components/Ads/AdComponent";
import { DownloadAlert } from "../../components/Alert/Alert";
import { FETCH_ALBUM_DOWNLOAD_THUNK } from "../../actions/detailAction";
import { CLEAR_MAIN_LIST } from "../../reducers/mainReducer";
import { GoBack } from "../../Hooks";

const generateMathProblem = () => {
  const num1 = Math.floor(Math.random() * 100) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;

  const problem = `${num1} + ${num2}`;
  const answer = num1 + num2;

  return {
    problem,
    answer: answer.toString(),
  };
};

const Download = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryId = searchParams.get("id") as string;
  const downloadRules = t("detail.download_rules", { returnObjects: true });
  const { albumDownloadDetail, isLoading } = useAppSelector((state) => state.detail);
  const [problem, setProblem] = useState(generateMathProblem());
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLogined, setIsLogined] = useState(true);

  useEffect(() => {
    if (albumDownloadDetail?.status === "0") {
      setIsLogined(false);
    } else {
      setIsLogined(true);
    }
  }, [albumDownloadDetail?.status]);

  useEffect(() => {
    if (queryId) dispatch(FETCH_ALBUM_DOWNLOAD_THUNK(queryId));
  }, [queryId]);

  const checkAnswer = () => {
    if (userAnswer === problem.answer) {
      setIsCorrect(true);
      const link = document.createElement("a");
      link.href = albumDownloadDetail.download_url;
      link.download = albumDownloadDetail.title;
      link.click();
    } else {
      setIsCorrect(false);
    }
  };

  const regenerateProblem = () => {
    const newProblem = generateMathProblem();
    setProblem(newProblem);
    setUserAnswer("");
    setIsCorrect(null);
  };

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="bg-nbk relative w-full h-14 text-white flex items-center px-3 py-2 z-20">
            <GoBack back={-1} />
            <div className="ml-4">{t("detail.download_page")}</div>
          </div>
          <div className="w-full mx-auto flex justify-center mb-24">
            {!isLoading && <AdComponent adKey="download1" />}
          </div>
          <div className="bg-white m-3 p-4">
            <div className="flex justify-between py-4 word-break">
              <p>{albumDownloadDetail.title}</p>
              <p>{albumDownloadDetail.fileSize}</p>
            </div>
            <div>
              <img src={albumDownloadDetail.img_url} alt={albumDownloadDetail.title} />
            </div>
            <div className="flex justify-center items-center p-6">
              <p className="text-2xl ml-2">{problem.problem} =</p>
              <input
                type="text"
                value={userAnswer}
                maxLength={10}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t("detail.enter_answer")}
                className="w-32 h-12 px-2 ml-2"
              />
              <button className="bg-og rounded-md text-white ml-2 p-3" onClick={checkAnswer}>
                {t("detail.download")}
              </button>
              <ReplayIcon className="text-3xl ml-2" onClick={regenerateProblem} />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-10">
              <div className="max-h-[120px] overflow-hidden object-top">
                {!isLoading && <AdComponent adKey="download2" />}
              </div>
              <div className="max-h-[120px] overflow-hidden object-top">
                {!isLoading && <AdComponent adKey="download3" />}
              </div>
            </div>
            <div className="text-[red] mt-6">
              {Array.isArray(downloadRules) && downloadRules.map((d: any) => <p key={d}>{d}</p>)}
            </div>
          </div>
          {(!isLogined || (!isCorrect && isCorrect !== null)) && (
            <DownloadAlert
              albumDownloadDetail={albumDownloadDetail}
              isLogined={isLogined}
              setIsLogined={setIsLogined}
              isCorrect={isCorrect}
              setIsCorrect={setIsCorrect}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Download;
