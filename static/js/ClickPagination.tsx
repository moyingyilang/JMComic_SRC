import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ClickPaginationProps {
  pageLimit: number;
  page: number; // 1-indexed
  onChange: (page: number) => void;
  loading?: boolean;
}

const ClickPagination = ({ pageLimit, page, onChange, loading = false }: ClickPaginationProps) => {
  const { t } = useTranslation();
  const [jumpPage, setJumpPage] = useState("");
  const [outOfRange, setOutOfRange] = useState(false);

  const jumpDisabled = loading || pageLimit <= 1;

  const handleJumpPage = () => {
    if (jumpDisabled) return;
    const value = Number(jumpPage);
    if (!value || value < 1) return;
    if (value > pageLimit) {
      setOutOfRange(true);
      return;
    }
    setOutOfRange(false);
    onChange(value);
    setJumpPage("");
  };

  return (
    <div className="w-full flex flex-col items-center gap-2 pt-4 pb-40">
      <Pagination
        count={pageLimit}
        page={page}
        onChange={(_, value) => !loading && onChange(value)}
        color="standard"
        disabled={loading}
        sx={{
          "& .MuiPaginationItem-root": { color: "#232323" },
          "html.dark & .MuiPaginationItem-root": { color: "#d1d1d1" },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "#ff7b00",
            color: "#fff",
          },
          "html.dark & .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "#ff7b00",
            color: "#fff",
          },
        }}
      />
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={pageLimit}
          value={jumpPage}
          disabled={jumpDisabled}
          onChange={(e) => {
            setJumpPage(e.target.value);
            setOutOfRange(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleJumpPage()}
          placeholder={t("comic.jump_to_page")}
          className="w-24 border border-og rounded px-2 py-1 text-center text-base dark:bg-nbk dark:text-tgy disabled:opacity-50"
        />
        <button
          onClick={handleJumpPage}
          disabled={jumpDisabled}
          className="bg-og text-white text-base rounded px-3 py-1 min-w-[64px] flex items-center justify-center disabled:opacity-70"
        >
          {loading ? <CircularProgress color="inherit" size={16} /> : t("comic.go")}
        </button>
      </div>
      {outOfRange && <p className="text-red-500 text-sm">{t("comic.page_out_of_range", { max: pageLimit })}</p>}
    </div>
  );
};

export default ClickPagination;
