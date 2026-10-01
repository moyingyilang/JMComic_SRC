/* --------------------------------- Step 1 UI -------------------------------- */

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

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

// interface PlanCardProps {
//   plan: Plan;
//   selected: string | null;
//   onSelect: (key: string) => void;
// }

function PlanCard(props: any) {
  const { plan, selected, onSelect, logined, dialogOpen, setDialogOpen } = props;
  const { t } = useTranslation();

  const isSelected = selected === plan.key;
  return (
    <div
      onClick={() => {
        logined ? onSelect(plan.key) : setDialogOpen({ ...dialogOpen, login: true });
      }}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.98] ${
        isSelected
          ? "border-orange-500 shadow-lg shadow-orange-200 ring-2 ring-orange-400 ring-offset-2"
          : plan.highlight
          ? "border-orange-400 shadow-md shadow-orange-100"
          : "border-stone-200 hover:border-orange-300"
      }`}
    >
      <span
        className={`absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-all duration-200 ${
          isSelected ? "scale-100 opacity-100" : "pointer-events-none scale-50 opacity-0"
        }`}
      >
        <CheckRoundedIcon sx={{ fontSize: 16 }} />
      </span>

      {plan.popular === 1 && (
        <div className="bg-orange-500 px-5 py-2 text-base font-semibold tracking-wide text-white">
          {t("sponsor.plans.quarterly.ribbon")}
        </div>
      )}

      <div
        className={`flex flex-1 flex-col gap-5 px-6 py-6 sm:px-7 sm:py-7 ${
          plan.highlight ? "bg-orange-50/60" : "bg-white"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-bold text-stone-800 sm:text-2xl">{t(plan.name)}</h3>
          {plan.promo_text && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-600">
              <VolumeUpRoundedIcon sx={{ fontSize: 12 }} />
              {plan.promo_text}
            </span>
          )}
        </div>

        <ul className="flex flex-col gap-2">
          {plan?.features?.map((f: any) => (
            <li key={f} className="flex items-center gap-2 text-base text-stone-500">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stone-300" />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-1 flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            {plan.original > plan.total && (
              <span className="text-lg text-stone-300 line-through">¥{plan.original}</span>
            )}
            <span className="text-4xl font-extrabold text-stone-800 sm:text-5xl">¥{plan.price}</span>
            <span className="text-base text-stone-400">/ {plan.days <= 30 ? "次" : "月"}</span>
          </div>
          {plan.total && (
            <span className="text-sm text-stone-400">
              {t("sponsor.plan_common.total_prefix")} ¥{plan.total}
            </span>
          )}
        </div>

        <button
          className={`mt-auto w-full rounded-lg border py-3 text-base font-semibold transition-colors sm:text-lg ${
            selected === plan.id
              ? "border-orange-500 bg-orange-500 text-white"
              : "border-orange-400 text-orange-500 hover:bg-orange-50"
          }`}
        >
          {selected === plan.id ? (
            <span className="inline-flex items-center justify-center gap-1.5">
              <CheckRoundedIcon sx={{ fontSize: 16 }} />
              {t("sponsor.plan_common.selected_button")}
            </span>
          ) : (
            t("sponsor.plan_common.buy_button")
          )}
        </button>
      </div>
    </div>
  );
}

interface FaqItem {
  id: string;
  questionKey: string;
  answerKey: string;
  supportInfoKey: string;
}

const FAQ_KEYS = [
  "payment_methods",
  "payment_failed",
  "effective_time",
  "cross_device",
  "ads_after_purchase",
  "payment_page_error",
  "refund",
] as const;

const FAQS: FaqItem[] = FAQ_KEYS.map((key) => ({
  id: `faq-${key}`,
  questionKey: `sponsor.faq.items.${key}.question`,
  answerKey: `sponsor.faq.items.${key}.answer`,
  supportInfoKey: `sponsor.faq.items.${key}.support_info`,
}));

interface FaqAccordionItemProps {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}

function FaqAccordionItem({ item, open, onToggle }: FaqAccordionItemProps) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-lg border border-orange-300">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 bg-white px-4 py-3 text-left text-base font-semibold text-stone-700"
      >
        <span>
          {t("sponsor.faq.question_prefix")}
          {t(item.questionKey)}
        </span>
        <span className="text-orange-500">
          <ExpandMoreRoundedIcon
            sx={{
              fontSize: 18,
              transition: "transform 200ms",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </span>
      </button>
      {open && (
        <div className="border-t border-dashed border-orange-200 bg-sky-50 text-base text-stone-600">
          <div className="px-4 py-3" style={{ whiteSpace: "pre-line" }}>
            {t("sponsor.faq.answer_prefix")}
            {t(item.answerKey)}
          </div>

          {item.supportInfoKey && (
            <div className="border-t border-dashed border-stone-400 px-4 py-2">
              <div className="mb-1">如遇问题请提供：</div>
              <div>{t(item.supportInfoKey)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// interface StepSelectPlanProps {
//   PLANS: any;
//   selectedPlanKey: string | null;
//   onChoosePlan: (key: string) => void;
//   logined: boolean;
//   dialogOpen: boolean;
//   setDialogOpen: (any: string) => void;
// }

export default function StepSelectPlan(props: any) {
  const { PLANS, selectedPlanKey, onChoosePlan, logined, dialogOpen, setDialogOpen } = props;
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1");
  const toggleFaq = (id: string) => setOpenFaq((prev) => (prev === id ? null : id));

  return (
    <>
      <section className="w-full rounded-2xl bg-white p-5 shadow-sm sm:p-8">
        <h2 className="mb-5 text-xl font-bold text-stone-800 sm:mb-6 sm:text-2xl">
          {t("sponsor.plan_section.heading")}
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
          {PLANS.map((plan: any) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              selected={selectedPlanKey}
              onSelect={onChoosePlan}
              logined={logined}
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
            />
          ))}
        </div>

        {/* <p className="mt-6 text-center text-base text-stone-400">
          {t("sponsor.plan_section.contact_prefix")}
          <Link to="/contact" className="font-medium text-orange-500 hover:underline">
            {t("sponsor.plan_section.contact_link")}
          </a>
        </p> */}
      </section>

      <section className="w-full rounded-2xl bg-white p-5 shadow-sm sm:p-8">
        <h2 className="mb-5 text-xl font-bold text-stone-800 sm:mb-6 sm:text-2xl">{t("sponsor.faq.heading")}</h2>

        <div className="flex flex-col gap-3">
          {FAQS.map((item) => (
            <FaqAccordionItem
              key={item.id}
              item={item}
              open={openFaq === item.id}
              onToggle={() => toggleFaq(item.id)}
            />
          ))}
        </div>

        <div className="mt-6 text-right">
          <Link to="/" className="text-base text-stone-400 hover:text-orange-500 hover:underline">
            {t("sponsor.faq.back_home")}
          </Link>
        </div>
      </section>
    </>
  );
}
