import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FETCH_AD_FREE_PAY_THUNK,
  FETCH_AD_FREE_THUNK,
  FETCH_CHARGE_THUNK,
  FETCH_LOGIN_THUNK,
} from "../../actions/memberAction";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import Loading from "../../components/Common/Loading";
import MemberModal from "../../components/Modal/MemberModal";
import StepPaymentMethod from "../../components/Sponsor/StepPaymentMethod";
import StepSelectPlan from "../../components/Sponsor/StepSelectPlan";
import { useGlobalConfig } from "../../GlobalContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { defaultUserFormData } from "../../utils/InterFace";

/* ---------------------------------- Data ---------------------------------- */
/* 只存翻譯 key 跟非文字資料（價格、id、樣式），實際顯示文字一律透過 t() 取得 */

// interface Plan {
//   id: string;
//   nameKey: string;
//   badgeKey: string | null;
//   ribbonKey?: string;
//   featuresKey: string;
//   originalPrice: number | null;
//   price: number;
//   total: number | null;
//   highlight: boolean;
// }

/* -------------------------------- Layout bits ------------------------------ */

function PageHeader() {
  return (
    <header className="flex items-center gap-3 border-b border-stone-200 bg-white px-5 py-3 sm:px-8">
      <Link to="/">
        <img src="/images/new_logo.webp" alt="logo" width="130px" height="30px" className="animation-click-item" />
      </Link>
    </header>
  );
}

function PromoBar(props: any) {
  const { logined, dialogOpen, setDialogOpen } = props;
  const { t } = useTranslation();
  return (
    <div className="flex w-full max-w-3xl flex-col items-start gap-4 rounded-xl bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <p className="text-base leading-relaxed text-stone-600">
        {t("sponsor.promo.text_line1")}
        <br className="sm:hidden" />
        {t("sponsor.promo.text_line2")}
      </p>
      <div className="text-base leading-relaxed text-stone-600">
        <span>{t("sponsor.promo.no_sponsor")}？</span>
        <button
          className="flex justify-cnetet items-center text-[#545ab5] font-medium"
          onClick={() =>
            logined ? setDialogOpen({ ...dialogOpen, invincible: true }) : setDialogOpen({ ...dialogOpen, login: true })
          }
        >
          {t("sponsor.promo.jcoin_ad_free")}
          <ChevronRightIcon sx={{ fontSize: 13 }} />
        </button>
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  step: 0 | 1;
}

function StepIndicator({ step }: StepIndicatorProps) {
  const { t } = useTranslation();
  const steps = [t("sponsor.steps.select_plan"), t("sponsor.steps.payment_method")];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6">
      {steps.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <div key={label} className="flex items-center gap-3 sm:gap-6">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 text-base font-medium sm:text-lg ${
                  active || done ? "text-orange-500" : "text-stone-400"
                }`}
              >
                {done && <CheckRoundedIcon sx={{ fontSize: 13 }} />}
                {label}
              </span>
              <span className={`h-2 w-2 rounded-full ${active || done ? "bg-orange-500" : "bg-stone-300"}`} />
            </div>
            {i < steps.length - 1 && (
              <span className="mb-4 h-px w-10 sm:w-16 border-t border-dashed border-stone-400" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------- Page ----------------------------------- */

export default function Pay() {
  const { t } = useTranslation();
  const { config, setConfig } = useGlobalConfig();
  const { setting, logined } = config;
  const dispatch = useAppDispatch();

  const memberAccount = JSON.parse(localStorage.getItem("memberAccount") as string);
  const [formData, setFormData] = useState(defaultUserFormData);
  const { adsPaymentList, isLoading } = useAppSelector((state) => state.member);
  const [dialogOpen, setDialogOpen] = useState({ login: false, signUp: false, forgot: false, invincible: false });
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const [step, setStep] = useState<0 | 1>(0);
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // console.log(adsPaymentList, "adsPaymentList");

  const selectedPlan = adsPaymentList.plans?.find((p: any) => p.key === selectedPlanKey) ?? null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const getList = async () => {
      setLoading(true);
      await dispatch(FETCH_AD_FREE_PAY_THUNK({})).unwrap();
      setLoading(false);
    };
    if (adsPaymentList.plans?.length === 0 || adsPaymentList.pay_methods?.length === 0) {
      getList();
    }
  }, [logined]);

  const handleChoosePlan = (key: string) => {
    setSelectedPlanKey(key);
    setStep(1);
  };

  const handleBack = () => {
    setStep(0);
  };

  const refreshSession = async () => {
    if (!memberAccount) return;
    localStorage.removeItem("jwttoken");
    await dispatch(
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

  return (
    <div className="min-h-screen bg-[#f2ece0]">
      <PageHeader />

      <main className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-5 py-10 sm:gap-10 sm:px-8 sm:py-14">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold text-stone-800 sm:text-4xl">{t("sponsor.title")}</h1>
          <span className="h-1 w-14 rounded-full bg-orange-400" />
        </div>

        <PromoBar logined={logined} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />

        <StepIndicator step={step} />

        {step === 0 && (
          <div className="flex w-full max-w-3xl flex-col items-center gap-8 sm:gap-10">
            {!loading ? (
              <StepSelectPlan
                PLANS={adsPaymentList.plans}
                selectedPlanKey={selectedPlanKey}
                onChoosePlan={handleChoosePlan}
                logined={logined}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
              />
            ) : (
              <Loading />
            )}
          </div>
        )}

        {step === 1 && selectedPlan && (
          <StepPaymentMethod
            plan={selectedPlan}
            METHODS={adsPaymentList.pay_methods}
            selectedPlanKey={selectedPlanKey}
            onBack={handleBack}
            refreshSession={refreshSession}
          />
        )}
      </main>
      {dialogOpen.invincible && (
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
    </div>
  );
}
