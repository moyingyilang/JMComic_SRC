import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { FETCH_SEND_TAG_BLOCK_SETTING_THUNK, FETCH_TAG_BLOCK_SETTING_THUNK } from "../../actions/memberAction";
import { LOAD_MEMBER_LIST } from "../../reducers/memberReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 ${
        checked ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function TagBlockSetting(props: any) {
  const { t, setting, logined, memberInfo, showSnackbar } = props;
  const dispatch = useAppDispatch();
  const { tagBlockSetting, isLoading } = useAppSelector((state) => state.member);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const loadList = (isLoadMore: boolean = false, isRefreshing: boolean = false) => {
    dispatch(LOAD_MEMBER_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    // if (isRefreshing) {
    //   dispatch(CLEAR_MEMBER_LIST("tagBlockSetting"));
    // }
    dispatch(FETCH_TAG_BLOCK_SETTING_THUNK({ action: "form" }));
  };

  useEffect(() => {
    if (logined && tagBlockSetting.tag_list?.length === 0) loadList();
  }, [logined, tagBlockSetting?.tag_list?.length]);

  useEffect(() => {
    if (tagBlockSetting?.tag_list?.length > 0) {
      setSelectedTags(tagBlockSetting.tag_list.filter((item: any) => item.blocked).map((item: any) => item.tag));
    }
  }, [tagBlockSetting?.tag_list]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleConfirm = async () => {
    if (!tagBlockSetting.editable) {
      showSnackbar(t("member.tag_block_not_yet_editable", { time: tagBlockSetting.confirm_next_preview }), "error");
      return;
    }

    const savedTags: string[] = (tagBlockSetting.tag_list || [])
      .filter((item: any) => item.blocked)
      .map((item: any) => item.tag);
    const isUnchanged =
      selectedTags.length === savedTags.length && selectedTags.every((tag) => savedTags.includes(tag));
    if (isUnchanged) {
      showSnackbar(t("member.tag_block_no_change"), "error");
      return;
    }

    setIsSaving(true);
    try {
      const result = await dispatch(FETCH_SEND_TAG_BLOCK_SETTING_THUNK(selectedTags)).unwrap();

      if (result.code === 200) {
        showSnackbar(result.data?.msg || t("member.tag_block_success_default"), "success");
        loadList();
      } else {
        showSnackbar(result.data?.msg || t("member.tag_block_fail_default"), "error");
      }
    } catch (err) {
      showSnackbar(t("member.tag_block_fail_default"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-gray-100 text-bbk dark:bg-bbk dark:text-tgy p-4 sm:p-6 md:p-10 flex items-start justify-center">
      <div className="w-full max-w-3xl rounded-lg bg-white dark:bg-[#2c2c2c] shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 dark:border-gray-700 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <LabelOutlinedIcon className="text-gray-500 dark:text-gray-400" fontSize="small" aria-hidden="true" />
            <h1 className="text-lg font-medium text-gray-800 dark:text-tgy">{t("member.tag_block_title")}</h1>
          </div>
          <div className="flex flex-col gap-1 text-base text-orange-500">
            <div className="flex items-center gap-1.5">
              <HistoryOutlinedIcon fontSize="small" aria-hidden="true" />
              <span>{t("member.tag_block_last_confirm", { time: tagBlockSetting.last_confirm_at })}</span>
            </div>
            {tagBlockSetting.confirm_next_preview && (
              <span className="text-sm text-gray-400 dark:text-gray-400">
                {t("member.tag_block_next_confirm", { time: tagBlockSetting.confirm_next_preview })}
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <div className={memberInfo.level < 8 ? "pointer-events-none select-none" : ""}>
            {/* Tag rows */}
            <ul className="divide-y divide-gray-100 dark:divide-gray-700 px-4 sm:px-6">
              {tagBlockSetting.tag_list?.length > 0 ? (
                tagBlockSetting.tag_list.map((item: any) => (
                  <li key={item.tag} className="flex items-center justify-between gap-4 py-4">
                    <span className="text-gray-800 dark:text-tgy text-lg">{item.tag}</span>
                    <Toggle
                      checked={selectedTags.includes(item.tag)}
                      onChange={() => toggleTag(item.tag)}
                      label={t("member.tag_block_toggle_label", { tag: item.tag })}
                    />
                  </li>
                ))
              ) : (
                <div className="flex flex-col justify-center items-center">
                  {isLoading && <img src="/images/loading.gif" alt="loading" width="80px" />}
                </div>
              )}
            </ul>
            {/* confirm button */}
            {tagBlockSetting.tag_list?.length > 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-6 sm:py-8">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSaving}
                  className="flex w-full max-w-xs items-center justify-center gap-2 rounded-md bg-orange-500 px-6 py-2.5 text-lg font-medium text-white shadow-sm transition-colors duration-150 hover:bg-orange-600 active:bg-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : t("member.tag_block_confirm_btn")}
                </button>
              </div>
            )}
          </div>
          {memberInfo.level < 8 && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-[1px]">
              <span className="text-xl font-medium text-white">{t("member.tag_block_level_locked")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
