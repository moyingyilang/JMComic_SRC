import { App as CapacitorApp } from "@capacitor/app";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import LoopIcon from "@mui/icons-material/Loop";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FETCH_AD_FREE_PAY_THUNK } from "../../actions/memberAction";
import { useAppDispatch } from "../../store/hooks";
import PositionedSnackbar, { useSnackbarState } from "../Alert/PositionedSnackbar";

// interface PaymentMethodData {
//   id: string;
//   labelKey: string;
//   badgeText: string;
//   badgeClass: string;
// }

// interface PaymentMethodRowProps {
//   method: PaymentMethodData;
//   selected: boolean;
//   onSelect: () => void;
// }

function PaymentMethodRow(props: any) {
  const {
    method,
    selectedPid,
    onSelect,
    uid,
    selectedPlanKey,
    selectedMethodId,
    setSelectedMethodId,
    showSnackbar,
    refreshSession,
    isPaying,
    setIsPaying,
  } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handlerPayAds = async () => {
    if (isPaying) return;
    setIsPaying(true);

    // 必須在 await 之前、使用者手勢的同步階段就呼叫 window.open，
    // 否則部分 iOS Safari 版本會把 await 之後的 window.open 視為非使用者觸發而擋下彈窗，
    // 導致 payWindow 為 null，輪詢永遠偵測不到視窗關閉，isPaying 卡死轉圈圈
    const payWindow = window.open("", "_blank");

    try {
      // 記錄下單前的時間戳，因為建立訂單這支 API 不會直接回傳新訂單的 oid，
      // 之後只能靠「時間 + pid」在訂單列表裡反查出這筆新訂單
      const beforeCreate = Date.now() / 1000;

      const res = await dispatch(FETCH_AD_FREE_PAY_THUNK({ key: selectedPlanKey, pid: method.pid, uid })).unwrap();

      // 組出金流中繼頁網址，並帶上 /pay 網址上的參數（例如廣告來源的 utm 參數）
      const decodeHtmlEntities = (str: string) => {
        return str
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">");
      };

      function appendQuery(url: string, search: string): string {
        if (!search) return url;
        const query = search.startsWith("?") ? search.slice(1) : search;
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}${query}`;
      }

      const checkoutUrl: string = decodeHtmlEntities(
        appendQuery(
          res.data.checkout
            .replace("{key}", encodeURIComponent(selectedPlanKey))
            .replace("{pid}", encodeURIComponent(method.pid))
            .replace("{uid}", encodeURIComponent(uid)),
          location.search
        )
      );

      if (payWindow) {
        // 導向先前開好的分頁，保留原分頁繼續執行輪詢
        payWindow.location.href = checkoutUrl;
        startPolling(beforeCreate, method.pid, payWindow);
      } else {
        // 彈窗仍被擋下，改用當前分頁直接導向金流頁，避免卡在轉圈圈狀態
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      console.error(err);
      payWindow?.close();
      setIsPaying(false);
    }
  };

  const startPolling = (beforeCreate: number, pid: number, payWindow: Window | null) => {
    // 第一次查詢前還不知道 oid，找到後鎖定下來，後續改用 oid 精準比對
    let matchedOid: string | null = null;
    // closeWatcher 跟 appStateChange 都可能偵測到「已完成」，用這個旗標確保完成流程只會真正執行一次
    let isSettled = false;
    let appStateHandle: { remove: () => void } | null = null;

    const checkStatus = async () => {
      const res = await dispatch(FETCH_AD_FREE_PAY_THUNK({ uid })).unwrap();

      if (!matchedOid) {
        // 用「付款方式相同 + 建立時間晚於下單前」找出剛剛新增的那筆訂單
        const newOrder = res.data.orders.find((o: any) => o.pid === pid && o.ctime >= beforeCreate);
        if (newOrder) matchedOid = newOrder.oid;
        return newOrder;
      }
      // 已鎖定 oid，直接比對，避免之後又抓錯訂單
      return res.data.orders.find((o: any) => o.oid === matchedOid);
    };

    const finishPayment = async (order: any) => {
      if (isSettled) return;
      isSettled = true;

      clearInterval(closeWatcher);
      appStateHandle?.remove();
      payWindow?.close();
      setSelectedMethodId(null); // 不管成功或取消，都重置選取狀態

      try {
        if (order?.status === 2 && order?.otime > 0) {
          showSnackbar(t("sponsor.promo.pay_success"), "success");
          await refreshSession();
          goToOrderRecordTab(navigate);
        } else {
          showSnackbar(t("sponsor.promo.pay_cancelled"), "error");
        }
      } catch (err) {
        console.error(err);
        showSnackbar(t("sponsor.promo.order_confirmation_failed"), "error");
      } finally {
        setIsPaying(false);
      }
    };

    const settleWithError = (err: unknown) => {
      if (isSettled) return;
      isSettled = true;

      clearInterval(closeWatcher);
      appStateHandle?.remove();
      console.error(err);
      showSnackbar(t("sponsor.promo.order_confirmation_failed"), "error");
      setIsPaying(false);
    };

    // 使用者從支付寶／其他 App 切回本 App 的當下，立即主動查一次訂單狀態，
    // 不用等 closeWatcher（依賴視窗關閉，跳出到原生 App 時偵測不到）
    CapacitorApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive || isSettled) return;
      (async () => {
        try {
          const order = await checkStatus();
          if (order?.status === 2 && order?.otime > 0) {
            finishPayment(order);
          }
        } catch (err) {
          settleWithError(err);
        }
      })();
    }).then((handle) => {
      if (isSettled) {
        handle.remove();
      } else {
        appStateHandle = handle;
      }
    });

    // 每秒檢查金流分頁是否被用戶手動關閉
    const closeWatcher = setInterval(async () => {
      if (isSettled || !payWindow?.closed) return;

      showSnackbar(t("sponsor.promo.order_confirmation"), "info");
      try {
        const order = await checkStatus();
        finishPayment(order);
      } catch (err) {
        settleWithError(err);
      }
    }, 2000);
  };

  return (
    <button
      disabled={isPaying}
      onClick={() => {
        onSelect();
        handlerPayAds();
      }}
      className={`flex w-full items-center gap-4 rounded-lg border px-4 py-3 text-left transition-colors sm:px-5 sm:py-4 ${
        selectedPid ? "border-orange-400 bg-orange-50/60" : "border-stone-200 bg-white hover:border-stone-300"
      } ${isPaying ? "cursor-not-allowed opacity-40" : ""}`}
    >
      {isPaying && <LoopIcon className="ml-auto h-4 w-4 animate-spin text-orange-500 dark:text-tgy-400" />}
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-lg font-bold text-white sm:h-11 sm:w-11 ${badgeClass(
          method.type
        )}`}
      >
        {method.name.slice(0, 1)}
      </span>
      <span className="flex-1 text-base font-medium text-stone-700 sm:text-lg">{t(method.name)}</span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selectedPid ? "border-orange-500 bg-orange-500" : "border-stone-300"
        }`}
      >
        {selectedPid && <CheckRoundedIcon sx={{ fontSize: 11 }} />}
      </span>
    </button>
  );
}

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

// interface OrderSummaryProps {
//   plan: Plan;
//   onBack: () => void;
// }

function OrderSummary(props: any) {
  const { plan, onBack, memberInfo } = props;
  const { t } = useTranslation();
  // const percent = Math.round((1 - plan.total / plan.original) * 100);

  return (
    <section className="w-full rounded-2xl bg-white p-5 shadow-sm sm:p-7">
      <h2 className="mb-4 text-xl font-bold text-stone-800 sm:text-2xl">{t("sponsor.order_summary.heading")}</h2>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-stone-400 sm:text-base">
          {t("sponsor.order_summary.account_info")}
        </span>
        <div className="flex items-center justify-between text-base">
          <span className="text-stone-500">{t("sponsor.order_summary.username_label")}</span>
          <span className="text-stone-700">{memberInfo.username}</span>
        </div>
        <div className="flex items-center justify-between text-base">
          <span className="text-stone-500">{t("sponsor.order_summary.email_label")}</span>
          <span className="text-stone-700">{memberInfo.email}</span>
        </div>
      </div>

      <div className="my-5 border-t border-stone-100" />

      <div className="flex flex-col gap-2">
        <span className="text-base font-bold text-stone-800 sm:text-lg">{t(plan.name)}</span>
        <ul className="flex flex-col gap-1.5">
          {plan?.features.map((f: any) => (
            <li key={f} className="flex items-center gap-2 text-base text-stone-500">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stone-300" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="my-5 border-t border-stone-100" />

      <div className="flex items-center justify-between">
        {plan.save > 0 ? (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-500">
            {t("sponsor.order_summary.discount_label", { percent: plan.save })}
          </span>
        ) : (
          <span />
        )}
        {plan.original && (
          <span className="text-base text-stone-300 line-through">
            {t("sponsor.order_summary.original_price_prefix")} ¥{plan.original}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold text-stone-800 sm:text-xl">{t("sponsor.order_summary.total_label")}</span>
        <span className="text-3xl font-extrabold text-stone-800 sm:text-4xl">¥{plan.total ?? plan.price}</span>
      </div>

      <button
        onClick={onBack}
        className="mt-6 w-full rounded-lg border border-orange-400 py-3 text-base font-semibold text-orange-500 transition-colors hover:bg-orange-50 sm:text-lg"
      >
        {t("sponsor.order_summary.back_button")}
      </button>
    </section>
  );
}

const ORDER_RECORD_TAB = "9";

function goToOrderRecordTab(navigate: ReturnType<typeof useNavigate>) {
  sessionStorage.setItem("memberTab", ORDER_RECORD_TAB);
  navigate(`/member?tab=${ORDER_RECORD_TAB}`);
}

const badgeClass = (type: string) => {
  switch (type) {
    case "union":
      return "bg-red-600";
    case "alipay":
      return "bg-blue-600";
    case "wechat":
      return "bg-green-600";
  }
};

// interface StepPaymentMethodProps {
//   plan: Plan;
//   onBack: () => void;
// }

export default function StepPaymentMethod(props: any) {
  const { METHODS, plan, selectedPlanKey, onBack, refreshSession } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const memberInfo = JSON.parse(localStorage.getItem("memberInfo") as string);
  const [isPaying, setIsPaying] = useState(false);

  const securityPoints = t("sponsor.payment.security_points", {
    returnObjects: true,
  }) as unknown as string[];
  const noteItems = t("sponsor.payment.notes.items", {
    returnObjects: true,
  }) as unknown as string[];

  // 依訂單金額過濾付款渠道：min_price/max_price 皆預設 0，代表該端無限制
  const orderAmount = plan.total ?? plan.price;
  const visibleMethods = METHODS?.filter((method: any) => {
    const minPrice = Number(method.min_price) || 0;
    const maxPrice = Number(method.max_price) || 0;
    if (minPrice > 0 && orderAmount < minPrice) return false;
    if (maxPrice > 0 && orderAmount > maxPrice) return false;
    return true;
  });

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <section className="flex-1 rounded-2xl bg-white p-5 shadow-sm sm:p-8">
        <h2 className="mb-4 text-xl font-bold text-stone-800 sm:text-2xl">{t("sponsor.payment.heading")}</h2>

        <div className="mb-5 flex flex-col gap-2 rounded-lg bg-green-50/70 px-4 py-3">
          <span className="inline-flex items-center gap-1.5 text-base font-semibold text-green-600">
            <LockRoundedIcon sx={{ fontSize: 15 }} />
            {t("sponsor.payment.ssl_title")}
          </span>
          <ul className="flex flex-col gap-1 pl-1">
            {securityPoints.map((p) => (
              <li key={p} className="inline-flex items-center gap-1.5 text-base text-stone-600">
                <span className="text-green-500">
                  <CheckRoundedIcon sx={{ fontSize: 13 }} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="pay-reminder">
          <div className="flex items-center">
            <p className="mt-2 self-center rounded-full bg-[#fd721f] px-4 py-1.5 text-white">
              {t("sponsor.payment.reminder_title")}
            </p>
            <div className="ml-2 mr-3 h-20 w-20">
              <img src="/images/jm-reminder.png" alt="jm-girl" className="h-full w-full object-contain" />
            </div>
          </div>

          <div
            className="relative z-10 flex items-center gap-2.5 rounded-lg border-2 border-[#ff9a3d] bg-[#fffaf6] p-2.5 text-[#f37c0c]"
            style={{
              margin: "-10px 0 15px",
              boxShadow: "0px 3px 0px #ff9a3d",
            }}
          >
            <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full border-2 border-[#f37c0c] bg-white font-bold">
              !
            </span>
            <p className="m-0 text-sm">
              {t("sponsor.payment.reminder_text_line1")}
              <br />
              {t("sponsor.payment.reminder_text_line2")}
            </p>
          </div>
        </div>

        <div className="relative flex flex-col gap-3">
          {visibleMethods?.map((method: any) => (
            <PaymentMethodRow
              key={method.pid}
              method={method}
              selectedPid={selectedMethodId === method.pid}
              onSelect={() => setSelectedMethodId(method.pid)}
              uid={memberInfo?.uid}
              selectedPlanKey={selectedPlanKey}
              setSelectedMethodId={setSelectedMethodId}
              selectedMethodId={selectedMethodId}
              showSnackbar={showSnackbar}
              refreshSession={refreshSession}
              isPaying={isPaying}
              setIsPaying={setIsPaying}
            />
          ))}
          {isPaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/80 dark:bg-bbk-900/80">
              <LoopIcon className="h-8 w-8 animate-spin text-orange-500" />
              <span className="text-sm text-stone-600 dark:text-tgy-300">{t("sponsor.promo.order_confirmation")}</span>
            </div>
          )}
        </div>

        <div className="my-6 border-t border-stone-100" />

        <h3 className="mb-3 text-lg font-bold text-stone-800">{t("sponsor.payment.notes.heading")}</h3>
        <ol className="flex flex-col gap-2 pl-5 text-base text-stone-500">
          {noteItems.map((note, i) => (
            <li key={i} className="list-decimal leading-relaxed">
              {note}
            </li>
          ))}
          <li className="list-decimal leading-relaxed font-medium text-red-500">
            {t("sponsor.payment.notes.warning")}
          </li>
        </ol>

        <p className="mt-6 text-center text-base text-stone-400">
          {t("sponsor.payment.contact_prefix")}
          <Link to="/contact" className="font-medium text-orange-500 hover:underline">
            {t("sponsor.plan_section.contact_link")}
          </Link>
        </p>

        <p className="mt-2 text-center text-base">
          <button
            type="button"
            onClick={() => goToOrderRecordTab(navigate)}
            className="font-medium text-orange-500 hover:underline"
          >
            {t("sponsor.payment.order_record_link")}
          </button>
        </p>
      </section>

      <div className="w-full lg:sticky lg:top-6 lg:w-[340px] lg:shrink-0">
        <OrderSummary plan={plan} onBack={onBack} memberInfo={memberInfo} />
      </div>
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
    </div>
  );
}
