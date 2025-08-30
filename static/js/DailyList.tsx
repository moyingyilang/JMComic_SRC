import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Fade from "@mui/material/Fade";
import { FETCH_GET_DAILY_OPTION_THUNK, FETCH_DAILY_LIST_FILTER_THUNK } from "../../actions/memberAction";
import { CLEAR_MEMBER_LIST } from "../../reducers/memberReducer";
import DialogModal from "../Modal/DialogModal";

const DailyList = (props: any) => {
  const { t, logined, memberInfo } = props;
  const dispatch = useAppDispatch();
  const { dailyOption, dailyFilter, isLoading } = useAppSelector((state) => state.member);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const month = new Date().getMonth() + 1;
  const [select, setSelect] = useState({ filter: "2025", list: month, img: "" });
  const [dialogOpen, setDialogOpen] = useState({ dailyImg: false });

  useEffect(() => {
    if (memberInfo && logined && dailyOption.list?.length === 0) {
      dispatch(FETCH_GET_DAILY_OPTION_THUNK(memberInfo.uid));
      handleFilter(select.filter);
    }
  }, [logined, dailyOption.list?.length]);

  const handleFilter = async (title: string) => {
    dispatch(CLEAR_MEMBER_LIST("dailyFilter"));
    dispatch(FETCH_DAILY_LIST_FILTER_THUNK(title));
  };

  return (
    <>
      <div className="bg-defaultBg text-bbk dark:bg-bbk dark:text-tgy">
        <div className="w-full bg-white dark:bg-bbk flex justify-between items-center px-6 h-20">
          <div className="flex">
            <div className="flex items-center">
              <span className="font-black text-2xl mr-4">{t("daily.annual_full_check_in_rewards")}</span>
              <Button
                id="fade-button"
                aria-controls={Boolean(anchorEl) ? "fade-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? "true" : undefined}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ color: "#aaa", fontSize: 15, paddingLeft: 0 }}
              >
                <span className="pr-10">{select.filter || "2025"}</span>
                <ArrowDropDownIcon sx={{ color: "#ff6f00", fontSize: 24 }} />
              </Button>
              <Menu
                id="fade-menu"
                MenuListProps={{
                  "aria-labelledby": "fade-button",
                }}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                TransitionComponent={Fade}
                sx={(theme) => ({
                  "& .MuiPaper-root": {
                    marginTop: theme.spacing(0),
                    marginLeft: theme.spacing(-2),
                    color: "#757575",
                    width: "30%",
                  },
                })}
              >
                {dailyOption.list?.length > 0
                  ? dailyOption.list.map((d: any) => (
                      <MenuItem
                        key={d.title}
                        onClick={() => {
                          handleFilter(d.title);
                          setSelect({ ...select, filter: d.title });
                          setAnchorEl(null);
                        }}
                      >
                        {d.title}
                      </MenuItem>
                    ))
                  : ["2024", "2025"].map((d) => (
                      <MenuItem
                        key={d}
                        onClick={() => {
                          handleFilter(d);
                          setSelect({ ...select, filter: d });
                          setAnchorEl(null);
                        }}
                      >
                        {d}
                      </MenuItem>
                    ))}
              </Menu>
            </div>
          </div>
          <Link to="/daily" state={{ from: "/member?tab=6" }} className="bg-og rounded text-white py-3 px-4">
            {t("daily.start_this_month_check_in")}
          </Link>
        </div>
        <ul className="w-full bg-white dark:bg-bbk flex flex-col justify-center items-center pb-48">
          {isLoading && <img src="/images/loading.gif" alt="loading" width="80px" />}
          {dailyFilter.list?.length > 0 &&
            dailyFilter.list.map((d: any) => (
              <li key={d.id} className="relative w-11/12 border border-solid border-gy rounded my-4">
                <div className="absolute top-0 left-0 w-0 h-0 border-t-[80px] border-r-[80px] border-t-red-600 border-r-transparent"></div>
                <span className="absolute top-4 left-4 text-xl text-white">{d.month}月</span>
                {d.img ? (
                  <img
                    src={d.img}
                    alt={d.id}
                    loading="lazy"
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.opacity = "1";
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/not_sign_yet.png";
                    }}
                    width="100%"
                    className="max-h-[220px] object-cover object-top"
                    style={{
                      opacity: "0",
                      transition: "opacity 0.5s ease-in-out",
                    }}
                    onClick={() => {
                      setDialogOpen({ ...dialogOpen, dailyImg: true });
                      setSelect({ ...select, img: d.img });
                    }}
                  />
                ) : (
                  <img
                    src={`/images/not_sign_yet.png`}
                    alt={d.id}
                    width="100%"
                    className="max-h-[220px] object-contain"
                  />
                )}
              </li>
            ))}
        </ul>
        {dialogOpen.dailyImg && (
          <DialogModal setDialogOpen={setDialogOpen} dialogOpen={dialogOpen} dailyImgs={select.img} />
        )}
      </div>
    </>
  );
};

export default DailyList;
