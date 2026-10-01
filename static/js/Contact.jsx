import { FormControl, MenuItem, Select } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FETCH_SEND_SUPPORT_REPORT_THUNK, FETCH_SUPPORT_REPORT_THUNK } from "../../actions/contactAction";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";
import Loading from "../../components/Common/Loading";
import BottomNav from "../../components/Main/BottomNav";
import DialogModal from "../../components/Modal/DialogModal";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useGlobalConfig } from "../../GlobalContext";

export default function Contact() {
  const { config } = useGlobalConfig();
  const { memberInfo } = config;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { categoriesList } = useAppSelector((state) => state.contact);
  const isVip = memberInfo?.ad_free === true;

  const initialFormState = {
    category: "",
    subCategory: "",
    carrier: "",
    phoneModel: "",
    description: "",
    captcha: "",
    image: null,
  };

  const [form, setForm] = useState(initialFormState);
  const [captchaCode, setCaptchaCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const [dialogOpen, setDialogOpen] = useState({ successMessage: false });
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(FETCH_SUPPORT_REPORT_THUNK({ action: "form" }));
  }, []);

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    setCaptchaCode(code);
    setForm((prev) => ({
      ...prev,
      captcha: "",
    }));
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { subCategory: "" } : {}),
    }));
  };

  const MAX_IMAGE_DIMENSION = 4096;

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setForm((prev) => ({ ...prev, image: null }));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      if (img.naturalWidth > MAX_IMAGE_DIMENSION || img.naturalHeight > MAX_IMAGE_DIMENSION) {
        showSnackbar(t("contact.validate.image_too_large"), "error");
        event.target.value = "";
        setForm((prev) => ({ ...prev, image: null }));
        return;
      }

      setForm((prev) => ({ ...prev, image: file }));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      event.target.value = "";
      setForm((prev) => ({ ...prev, image: null }));
    };

    img.src = objectUrl;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await dispatch(
        FETCH_SEND_SUPPORT_REPORT_THUNK({
          category_id: isVip ? form.category : "",
          sub_category_id: isVip ? form.subCategory : "",
          carrier_name: form.carrier,
          device_model: form.phoneModel,
          description: form.description,
          image: form.image,
        })
      ).unwrap();

      if (result?.code && result.code !== 200) {
        showSnackbar(result.errorMsg || t("contact.submit_fail"), "error");
      } else if (result.data?.feedback_id) {
        setSuccessData(result.data);
        setDialogOpen((prev) => ({ ...prev, successMessage: true }));
        setForm(initialFormState);
      } else {
        showSnackbar(t("contact.submit_fail"), "error");
      }
    } catch (error) {
      showSnackbar(typeof error === "string" ? error : t("contact.submit_fail"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // MUI Select 共用樣式
  const selectSx = {
    height: "41px",
    borderRadius: "5px",
    color: "#777",
    fontSize: "17px",

    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#cfcfcf",
    },

    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#cfcfcf",
    },

    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#ff7900",
      borderWidth: "1px",
    },

    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      height: "41px",
      padding: "0 14px",
      boxSizing: "border-box",
    },

    "& .MuiSvgIcon-root": {
      color: "#d2d2d2",
      fontSize: "30px",
    },

    "@media (max-width: 640px)": {
      fontSize: "15px",

      "& .MuiSelect-select": {
        padding: "0 12px",
      },
    },
  };

  const validateForm = () => {
    const errors = [];

    if (isVip && !form.category) {
      errors.push(t("contact.validate.category_required"));
    }

    if (isVip && !form.subCategory) {
      errors.push(t("contact.validate.sub_category_required"));
    }

    if (!form.carrier) {
      errors.push(t("contact.validate.carrier_required"));
    }

    if (!form.phoneModel.trim()) {
      errors.push(t("contact.validate.phone_model_required"));
    }

    if (!form.image) {
      errors.push(t("contact.validate.image_required"));
    }

    if (!form.description.trim()) {
      errors.push(t("contact.validate.description_required"));
    }

    if (!form.captcha.trim()) {
      errors.push(t("contact.validate.captcha_required"));
    }

    if (errors.length > 0) {
      showSnackbar(errors.join("\n"), "error");
      return false;
    }

    if (form.captcha.trim() !== captchaCode) {
      showSnackbar(t("contact.validate.captcha_invalid"), "error");

      generateCaptcha();

      return false;
    }

    return true;
  };

  const categoryTree = categoriesList?.category_tree || [];
  const telecomOptions = categoriesList?.telecom_options || [];
  const subCategoryItems = form.category !== "" ? categoryTree[Number(form.category)]?.items || [] : [];

  return (
    <div className="min-h-screen bg-[#eeeeee] pt-12 pb-24 font-['Microsoft_JhengHei','Noto_Sans_TC',Arial,sans-serif]">
      {isSubmitting && <Loading />}
      {/* 頁面內容 */}
      <div className="mx-auto w-full max-w-[545px] px-4">
        {/* Title */}
        <h1 className="m-0 py-[18px] pb-6 text-center text-[32px] font-bold tracking-[1px] text-black max-sm:text-[27px]">
          {t("contact.title")}
        </h1>
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-[10px] border-2 border-[#c5c5c5] bg-white px-5 pb-[18px] max-sm:px-[14px]"
        >
          {/* =========================================
              問題分類
          ========================================== */}
          <div
            className={`grid grid-cols-[108px_1fr] gap-[10px] border-b border-dotted border-[#aaa] py-5 max-sm:grid-cols-[88px_1fr] max-sm:gap-[7px] ${
              !isVip ? "" : "min-h-[122px]"
            }`}
          >
            <label className="flex pt-[5px] text-[18px] font-bold leading-[1.25] text-[#888] max-sm:text-[16px]">
              <i className="mr-[3px] not-italic text-[#d40000]">*</i>

              <span>{t("contact.category_label")}</span>
            </label>

            <div className="flex flex-col gap-3">
              {!isVip ? (
                <>
                  <div className="pl-2 pt-[5px] text-[17px] leading-[1.25] text-gy max-sm:text-[15px]">
                    {t("contact.vip_fixed_category")}
                  </div>
                </>
              ) : (
                <>
                  {/* 主分類 */}
                  <FormControl fullWidth size="small">
                    <Select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      displayEmpty
                      required
                      sx={selectSx}
                      renderValue={(selected) => {
                        if (selected === "") {
                          return <span className="text-[#bdbdbd]">{t("contact.category_placeholder")}</span>;
                        }

                        return categoryTree[Number(selected)]?.label;
                      }}
                    >
                      <MenuItem value="">
                        <span className="text-[#bdbdbd]">{t("contact.category_placeholder")}</span>
                      </MenuItem>
                      {categoryTree.map((cat, idx) => (
                        <MenuItem key={idx} value={String(idx)}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* 子分類 */}
                  <FormControl fullWidth size="small">
                    <Select
                      name="subCategory"
                      value={form.subCategory}
                      onChange={handleChange}
                      displayEmpty
                      required
                      disabled={form.category === ""}
                      sx={selectSx}
                      renderValue={(selected) => {
                        if (selected === "") {
                          return <span className="text-[#bdbdbd]">{t("contact.sub_category_placeholder")}</span>;
                        }

                        return subCategoryItems[Number(selected)];
                      }}
                    >
                      <MenuItem value="">
                        <span className="text-[#bdbdbd]">{t("contact.sub_category_placeholder")}</span>
                      </MenuItem>
                      {subCategoryItems.map((item, idx) => (
                        <MenuItem key={idx} value={String(idx)}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </div>
          </div>

          {/* =========================================
              使用電信
          ========================================== */}
          <div className="grid min-h-[81px] grid-cols-[108px_1fr] gap-[10px] border-b border-dotted border-[#aaa] py-5 max-sm:grid-cols-[88px_1fr] max-sm:gap-[7px]">
            <label className="flex pt-[5px] text-[18px] font-bold leading-[1.25] text-[#888] max-sm:text-[16px]">
              <i className="mr-[3px] not-italic text-[#d40000]">*</i>
              <span>{t("contact.carrier_label")}</span>
            </label>

            <FormControl fullWidth size="small">
              <Select
                name="carrier"
                value={form.carrier}
                onChange={handleChange}
                displayEmpty
                required
                sx={selectSx}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span className="text-[#bdbdbd]">{t("contact.carrier_placeholder")}</span>;
                  }

                  return selected;
                }}
              >
                <MenuItem value="">
                  <span className="text-[#bdbdbd]">{t("contact.carrier_placeholder")}</span>
                </MenuItem>

                {telecomOptions.map((carrier, idx) => (
                  <MenuItem key={idx} value={carrier.carrier_name}>
                    {carrier.carrier_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* =========================================
              手機品牌與型號
          ========================================== */}
          <div className="grid min-h-[81px] grid-cols-[108px_1fr] gap-[10px] border-b border-dotted border-[#aaa] py-5 max-sm:grid-cols-[88px_1fr] max-sm:gap-[7px]">
            <label className="flex flex-col pt-[5px] text-[18px] font-bold leading-[1.25] text-[#888] max-sm:text-[16px]">
              <span>
                <i className="mr-[3px] not-italic text-[#d40000]">*</i>
                {t("contact.phone_model_label_1")}
              </span>

              <span className="pl-[14px]">{t("contact.phone_model_label_2")}</span>
            </label>

            <input
              type="text"
              name="phoneModel"
              value={form.phoneModel}
              onChange={handleChange}
              placeholder={t("contact.phone_model_placeholder")}
              required
              className="h-[47px] w-full rounded-[5px] border border-[#cfcfcf] px-[14px] text-[17px] text-[#777] outline-none placeholder:text-[#bdbdbd] focus:border-[#ff7900] max-sm:text-[15px]"
            />
          </div>

          {/* =========================================
              上傳圖檔
          ========================================== */}
          <div className="grid min-h-[81px] grid-cols-[108px_1fr] gap-[10px] border-b border-dotted border-[#aaa] py-5 max-sm:grid-cols-[88px_1fr] max-sm:gap-[7px]">
            <label className="flex pt-[5px] text-[18px] font-bold text-[#888] max-sm:text-[16px]">
              <i className="mr-[3px] not-italic text-[#d40000]">*</i>

              <span>{t("contact.upload_label")}</span>
            </label>

            <div className="flex flex-col items-start gap-2">
              <label className="flex h-[48px] w-[165px] cursor-pointer items-center justify-center rounded-[5px] border border-[#ff7900] text-[16px] text-[#ff7900] transition hover:bg-[#fff6ee]">
                {t("contact.upload_button")}
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </label>
              {form.image && <span className="max-w-full truncate text-[13px] text-[#999]">{form.image.name}</span>}
            </div>
          </div>

          {/* =========================================
              問題描述
          ========================================== */}
          <div className="grid min-h-[358px] grid-cols-[108px_1fr] gap-[10px] border-b border-dotted border-[#aaa] py-5 max-sm:grid-cols-[88px_1fr] max-sm:gap-[7px]">
            <label className="flex pt-[5px] text-[18px] font-bold text-[#888] max-sm:text-[16px]">
              <i className="mr-[3px] not-italic text-[#d40000]">*</i>

              <span>{t("contact.description_label")}</span>
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={t("contact.description_placeholder")}
              required
              className="h-[325px] w-full resize-none rounded-[5px] border border-[#cfcfcf] p-[13px] text-[17px] text-[#777] outline-none placeholder:text-[#bdbdbd] focus:border-[#ff7900] max-sm:h-[295px] max-sm:text-[15px]"
            />
          </div>

          {/* =========================================
              驗證碼
          ========================================== */}
          <div className="grid min-h-[168px] grid-cols-[108px_1fr] gap-[10px] py-5 max-sm:grid-cols-[88px_1fr] max-sm:gap-[7px]">
            <label className="flex pt-[5px] text-[18px] font-bold text-[#888] max-sm:text-[16px]">
              <i className="mr-[3px] not-italic text-[#d40000]">*</i>

              <span>{t("contact.captcha_label")}</span>
            </label>

            <div className="flex flex-col items-start gap-2">
              {/* CAPTCHA */}
              <div className="relative flex h-[58px] w-[210px] items-center justify-center overflow-hidden bg-[repeating-linear-gradient(45deg,#1f513d_0,#1f513d_3px,#7a2938_3px,#7a2938_7px,#345d72_7px,#345d72_10px)] font-mono text-[32px] font-bold tracking-[8px] text-[#ddd] select-none max-sm:w-[190px]">
                <span className="relative z-10 -rotate-2 drop-shadow-[1px_1px_2px_#222]">{captchaCode}</span>

                {/* 干擾線 */}
                <span className="absolute left-[-15%] top-1/2 h-[2px] w-[130%] rotate-[-12deg] bg-white/40" />

                <span className="absolute left-[-15%] top-1/2 h-[2px] w-[130%] rotate-[16deg] bg-white/40" />

                <span className="absolute left-[-15%] top-[30%] h-[1px] w-[130%] rotate-[5deg] bg-black/40" />
              </div>

              {/* 換一張 */}
              <button
                type="button"
                onClick={generateCaptcha}
                className="border-0 bg-transparent p-0 text-[14px] text-[#ff7900] underline"
              >
                {t("contact.captcha_refresh")}
              </button>

              {/* 輸入 */}
              <input
                type="text"
                name="captcha"
                value={form.captcha}
                onChange={handleChange}
                placeholder={t("contact.captcha_placeholder")}
                maxLength={4}
                autoComplete="off"
                className="h-[41px] w-full rounded-[5px] border border-[#cfcfcf] px-[14px] text-[17px] text-[#777] outline-none placeholder:text-[#bdbdbd] focus:border-[#ff7900] max-sm:text-[15px]"
              />
            </div>
          </div>

          {/* =========================================
              送出
          ========================================== */}
          <div className="flex justify-center pt-[18px]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-[171px] rounded-[5px] bg-[#ff7900] text-[19px] font-bold text-white transition hover:bg-[#e86e00] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("contact.submit")}
            </button>
          </div>
        </form>
      </div>

      {/* =========================================
          Bottom Navigation
      ========================================== */}
      <BottomNav />
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
      {dialogOpen.successMessage && (
        <DialogModal dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} successData={successData} />
      )}
    </div>
  );
}
