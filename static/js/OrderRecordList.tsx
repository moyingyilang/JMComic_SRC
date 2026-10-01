import ReplayIcon from "@mui/icons-material/Replay";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { FETCH_AD_FREE_PAY_THUNK } from "../../actions/memberAction";
import { useGlobalConfig } from "../../GlobalContext";
import { useScrollToTop } from "../../Hooks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import ClickPagination from "../Common/ClickPagination";

const ORDERS_PER_PAGE = 10;

// interface Order {
//   id: string;
//   plan: string;
//   method: string;
//   amount: number;
//   time: string;
//   status: Status;
// }

type Status = "成功" | "未完成" | "失敗";

const STATUS_COLOR: Record<Status, string> = {
  成功: "text-emerald-600 dark:text-emerald-400",
  未完成: "text-gray-400 dark:text-gray-500",
  失敗: "text-red-500 dark:text-red-400",
};

function Row({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="flex justify-between py-2.5 text-lg">
      <span className="text-gray-400 dark:text-gray-500">{label}</span>
      <span className={colorClass ? `font-medium ${colorClass}` : "text-gray-800 dark:text-tgy"}>{value}</span>
    </div>
  );
}

function OrderCard(props: any) {
  const { order } = props;
  return (
    <div className="border-b border-gray-300 py-4">
      <Row label="訂單編號" value={order.oid} />
      <Row label="方案" value={order.name} />
      <Row label="支付方式" value={order.pid_name} />
      <Row label="金額" value={order.amount} />
      <Row label="建立時間" value={order.ctime_fmt} />
      <Row label="狀態" value={order.status_text} colorClass={STATUS_COLOR[order.status_text as Status]} />
    </div>
  );
}

export default function OrderRecordList(props: any) {
  const { t, memberInfo, logined, refreshSession } = props;
  const dispatch = useAppDispatch();
  const scrollToTop = useScrollToTop();
  const { config } = useGlobalConfig();
  const { paginationMode } = config;
  const { adsPaymentList } = useAppSelector((state) => state.member);
  const [loading, setLoading] = useState(false);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();
  const orders = adsPaymentList.orders || [];
  const pageLimit = orders.length ? Math.ceil(orders.length / ORDERS_PER_PAGE) : 1;
  const pagedOrders = orders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE);
  const visibleOrders = orders.slice(0, page * ORDERS_PER_PAGE);
  const hasNextPage = page < pageLimit;

  const loadMore = () => {
    if (!hasNextPage) return;
    setPage((prev) => Math.min(prev + 1, pageLimit));
  };

  const goToPage = (value: number) => {
    setPage(value);
    scrollToTop();
  };

  useEffect(() => {
    if (paginationMode !== "click" && inView) loadMore();
  }, [inView]);

  const getOrderList = async (uid: string) => {
    setLoading(true);
    const res = await dispatch(FETCH_AD_FREE_PAY_THUNK({ uid })).unwrap();
    const session = await refreshSession();
    setPage(1);
    if (res.code === 200 && session?.code === 200) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const handleRefreshClick = () => {
    if (refreshCooldown > 0) return;
    setRefreshCooldown(30);
    getOrderList(memberInfo.uid);
  };

  useEffect(() => {
    if (refreshCooldown <= 0) return;
    const timer = setInterval(() => {
      setRefreshCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshCooldown]);

  useEffect(() => {
    if (memberInfo && logined && !adsPaymentList.plans?.length) {
      getOrderList(memberInfo.uid);
    }
  }, [adsPaymentList.plans?.length]);

  return (
    <div className="min-h-screen bg-white text-bbk dark:bg-bbk dark:text-tgy font-sans">
      <div className="mx-auto max-w-[480px] px-[18px] py-5 pb-16">
        {/* Section header */}
        <div className="px-1 pb-2">
          <div className="flex justify-between items-center m-0 text-xl font-semibold border-b border-gray-300 py-4">
            <h2>{t("member.order_record")}</h2>
            <div>
              {loading ? (
                <CircularProgress size={18} className="text-gy" />
              ) : (
                <button
                  type="button"
                  disabled={refreshCooldown > 0}
                  onClick={handleRefreshClick}
                  className={`flex items-center gap-1 text-sm px-2 py-1 rounded-md ${
                    refreshCooldown > 0 ? "text-gy border border-gy opacity-60 cursor-not-allowed" : "text-og"
                  }`}
                >
                  {refreshCooldown > 0 ? (
                    t("member.resend_countdown", { seconds: refreshCooldown })
                  ) : (
                    <ReplayIcon sx={{ color: "#ff6f00", fontSize: 18, stroke: "#ff6f00", strokeWidth: 1 }} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order list */}
        <div className="px-1 mb-40">
          {loading ? (
            <div className="flex flex-col justify-center items-center  pb-48">
              <img src="/images/loading.gif" alt="loading" width="80px" />
            </div>
          ) : (
            <>
              {orders.length === 0 ? (
                <div className="py-10 text-center text-lg text-gray-300 dark:text-gray-600">
                  {t("member.order_record_empty")}
                </div>
              ) : paginationMode === "click" ? (
                <>
                  {pagedOrders.map((o) => (
                    <OrderCard key={o.oid} order={o} />
                  ))}
                  <ClickPagination pageLimit={pageLimit} page={page} onChange={goToPage} loading={false} />
                </>
              ) : (
                <>
                  {visibleOrders.map((o) => (
                    <OrderCard key={o.oid} order={o} />
                  ))}
                  <button ref={ref} onClick={loadMore} className="w-full flex justify-center pb-10 pt-4">
                    {hasNextPage ? (
                      <div className="flex items-center">
                        <CircularProgress color="inherit" size={12} />
                        <p className="ml-2">{t("comic.pull_to_load")}</p>
                      </div>
                    ) : (
                      <p className="text-center">{t("comic.no_more")}</p>
                    )}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
