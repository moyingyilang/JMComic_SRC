import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ErrorIcon from "@mui/icons-material/Error";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Fade from "@mui/material/Fade";
import { FETCH_TASKS_LIST_THUNK, FETCH_CHANGE_TASKS_THUNK, FETCH_TASKS_BUY_THUNK } from "../../actions/memberAction";
import { CLEAR_MEMBER_LIST, LOAD_MEMBER_LIST } from "../../reducers/memberReducer";
import { AchievementSelectData } from "../../assets/JsonData";
import MemberModal from "../Modal/MemberModal";
import { ConfirmAlert } from "../Alert/Alert";

const AchievementList = (props: any) => {
  const { t, setConfig, logined, memberInfo, setting, showSnackbar } = props;
  const finishedItems = t("member.finished", { returnObjects: true });
  const dispatch = useAppDispatch();
  const { tasksList, isLoading, isRefreshing } = useAppSelector((state) => state.member);
  const [dialogOpen, setDialogOpen] = useState({ achievement: false });
  const [menuOpen, setMenuOpen] = useState<Record<string, boolean>>({ title: false, filter: false });
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const AchievementData = AchievementSelectData();
  const [purchase, setPurchase] = useState({ alert: false, message: "", confirm: false, id: "" });
  const getTaskType = () => sessionStorage.getItem("taskType") || "title";
  const getTaskFilter = () => sessionStorage.getItem("taskFilter") || "my";
  const getTypeName = (type: string) => (type === "title" ? t("achievement.title") : t("achievement.badge"));
  const getFilterName = (type: string, filter: string) => {
    if (filter === "my") {
      return type === "title" ? t("achievement.my_title") : t("achievement.my_badge");
    } else {
      return type === "title" ? t("achievement.all_titles") : t("achievement.all_badges");
    }
  };

  const taskType = getTaskType();
  const taskFilter = getTaskFilter();

  const defaultSelect = {
    edit: false,
    change: "",
    type: taskType,
    typeName: getTypeName(taskType),
    filter: taskFilter,
    filterName: getFilterName(taskType, taskFilter),
    option: [],
    isModalData: false,
  };
  const [select, setSelect] = useState<any>(defaultSelect);

  const handleClick = (event: React.MouseEvent<HTMLElement>, dropdownId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen((prev: any) => ({ ...prev, [dropdownId]: true }));
  };

  const handleClose = (dropdownId: string) => {
    setMenuOpen((prev: any) => ({ ...prev, [dropdownId]: false }));
    setAnchorEl(null);
  };

  // all:badge/title & my/all   // exp coin badge
  const loadList = async (type: string = "", filter: string = "", isRefreshing: boolean = false) => {
    dispatch(LOAD_MEMBER_LIST({ isLoading: true, isRefreshing, isLoadMore: false }));
    const result = await dispatch(FETCH_TASKS_LIST_THUNK({ type, filter })).unwrap();
    if (result.msg !== "") {
      const { status, msg } = result;
      const statusType = status !== "ok" && "error";
      showSnackbar(msg, statusType);
    }
  };

  const handleGetModalDesc = (isRefreshing: boolean = false) => {
    loadList(select.type, select.filter, isRefreshing);
    loadList("coin");
    loadList("exp");
  };

  // Refresh
  const handleRefresh = () => {
    handleGetModalDesc(true);
  };

  // init
  useEffect(() => {
    if (logined && tasksList.all?.length === 0) {
      handleGetModalDesc();
    }
  }, [logined, tasksList.all?.length]);

  useEffect(() => {
    if (tasksList.all?.length > 0 && select.type === "title") {
      const selectedTask = tasksList.all.find((d: any) => d.content === memberInfo.level_name);
      const selectedTaskId = selectedTask?.id || tasksList.all?.[0]?.id || "";
      setSelect((prev: any) => ({ ...prev, change: selectedTaskId }));
    }
  }, [tasksList.all?.length, select.type]);

  useEffect(() => {
    const options = AchievementData.find((d) => d.type === select.type)?.option || AchievementData[0].option;
    setSelect((prevSelect: any) => ({
      ...prevSelect,
      option: options,
    }));
  }, [select.type, select.edit, dialogOpen.achievement, setSelect]);

  const handleChangeEvent = async (d: string) => {
    if (d === t("member.cancel")) {
      setSelect({ ...select, edit: false });
      return;
    } else if (select.change !== "") {
      const result = await dispatch(
        FETCH_CHANGE_TASKS_THUNK({ type: select.type, uid: memberInfo.uid, task_id: select.change })
      ).unwrap();
      if (result.code === 200) {
        const { msg, errorMsg, status } = result.data;
        const message = errorMsg || msg;
        const type = status !== "ok" ? "error" : "success";
        showSnackbar(message, type);
        setSelect({ ...select, edit: false });
      }
    }
  };

  const handlePurchase = async (id: string) => {
    const result = await dispatch(FETCH_TASKS_BUY_THUNK({ uid: memberInfo.uid, task_id: id })).unwrap();
    if (result.code === 200) {
      const { msg, errorMsg, status } = result.data;
      const message = errorMsg || msg;
      const type = status !== 1 ? "error" : "success";
      showSnackbar(message, type);
      setPurchase({ ...purchase, alert: false, message: "", confirm: false, id: "" });
    }
  };

  return (
    <>
      <div className="bg-defaultBg text-bbk dark:bg-bbk dark:text-tgy">
        <div className="w-full bg-white dark:bg-bbk flex justify-between items-center px-6 h-20">
          <div className="flex">
            <div>
              <Button
                id="fade-button-title"
                aria-controls={menuOpen.title ? "fade-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen.title ? "true" : undefined}
                onClick={(e) => handleClick(e, "title")}
                sx={{ color: "#aaa", fontSize: 15, paddingLeft: 0 }}
              >
                <span className="pr-10">{select.typeName}</span>
                <ArrowDropDownIcon sx={{ color: "#ff6f00", fontSize: 24 }} />
              </Button>
              <Menu
                id="fade-menu"
                MenuListProps={{
                  "aria-labelledby": "fade-button",
                }}
                anchorEl={anchorEl}
                open={menuOpen.title}
                onClose={() => handleClose("title")}
                TransitionComponent={Fade}
                sx={(theme) => ({
                  "& .MuiPaper-root": {
                    marginTop: theme.spacing(0),
                    marginLeft: theme.spacing(-2),
                    width: "30%",
                    color: "#757575",
                  },
                })}
              >
                {AchievementData.map((d: any) => (
                  <MenuItem
                    key={d.type}
                    onClick={() => {
                      handleClose("title");
                      loadList(d.type, d.option[0].filter);
                      sessionStorage.setItem("taskType", d.type);
                      sessionStorage.setItem("taskFilter", d.option[0].filter);
                      setSelect({
                        ...select,
                        type: d.type,
                        typeName: d.name,
                        filter: d.option[0].filter,
                        filterName: "",
                        change: "",
                      });
                    }}
                  >
                    {d.name}
                  </MenuItem>
                ))}
              </Menu>
            </div>
            <div>
              <Button
                id="fade-button-filter"
                aria-controls={menuOpen.filter ? "fade-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen.filter ? "true" : undefined}
                onClick={(e) => handleClick(e, "filter")}
                sx={{ color: "#aaa", fontSize: 15 }}
              >
                <span className="pr-10">{select.filterName || select.option[0]?.name}</span>
                <ArrowDropDownIcon sx={{ color: "#ff6f00", fontSize: 24 }} />
              </Button>
              <Menu
                id="fade-menu"
                MenuListProps={{
                  "aria-labelledby": "fade-button",
                }}
                anchorEl={anchorEl}
                open={menuOpen.filter}
                onClose={() => handleClose("filter")}
                TransitionComponent={Fade}
                sx={(theme) => ({
                  "& .MuiPaper-root": {
                    marginTop: theme.spacing(0),
                    marginLeft: theme.spacing(-2),
                    width: "30%",
                    color: "#757575",
                  },
                })}
              >
                {select.option.length > 0 &&
                  select.option.map((d: any) => (
                    <MenuItem
                      key={d.filter}
                      onClick={() => {
                        handleClose("filter");
                        loadList(d.type, d.filter);
                        sessionStorage.setItem("taskType", d.type);
                        sessionStorage.setItem("taskFilter", d.filter);
                        setSelect({ ...select, filter: d.filter, filterName: d.name });
                      }}
                    >
                      {d.name}
                    </MenuItem>
                  ))}
              </Menu>
            </div>
          </div>
          {select.filter !== "all" && (
            <div>
              {select.edit ? (
                <div className="flex justify-around items-center">
                  {Array.isArray(finishedItems) &&
                    finishedItems.map((d) => (
                      <span key={d} className="w-8 mr-6" onClick={() => handleChangeEvent(d)}>
                        {d}
                      </span>
                    ))}
                </div>
              ) : (
                <div>
                  <span className="w-8 mr-6">
                    <ErrorIcon
                      sx={{ color: "#ff6f00", fontSize: 24 }}
                      onClick={() => setDialogOpen({ ...dialogOpen, achievement: true })}
                    />
                  </span>
                  <EditNoteIcon
                    sx={{ color: "#ff6f00", fontSize: 28, stroke: "#ff6f00", strokeWidth: 1 }}
                    onClick={() => setSelect({ ...select, edit: true })}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col pb-48">
          {isLoading ? (
            <div className="mx-auto">
              <img src="/images/loading.gif" alt="loading" width="80px" />
            </div>
          ) : (
            <ul className="bg-defaultBg grid grid-cols-4 text-center px-1 overflow-hidden dark:bg-bbk dark:text-tgy">
              {tasksList.all?.length > 0 &&
                tasksList.all.map((d: any) => (
                  <li
                    key={d.id}
                    className={`border border-solid border-[#aaa] flex flex-col justify-center items-center h-40 p-4 
                      ${d.done ? "bg-white dark:bg-bbk" : ""}
                      `}
                    onClick={() => select.edit && select.type === "title" && setSelect({ ...select, change: d.id })}
                  >
                    {select.type === "title" &&
                      (select.edit ? (
                        <div className={`text-lg ${select.change === d.id ? "text-og" : ""}`}>
                          <p className={`${!d.done ? "text-[#aaa]" : ""}`}>{d.content}</p>
                          <p className="text-[#aaa] text-base">{d.name}</p>
                        </div>
                      ) : (
                        <div className={`text-lg ${memberInfo.level_name === d.content ? "text-og" : ""}`}>
                          <p className={`${!d.done ? "text-[#aaa]" : ""}`}>{d.content}</p>
                          <p className="text-[#aaa] text-base">{d.name}</p>
                        </div>
                      ))}
                    {select.type === "badge" && (
                      <div
                        className="text-[#aaa]"
                        onClick={() => {
                          const message = `確定花費『${d.coin}』J coin 購買『${d.name}』嗎？`;
                          select.filter === "all" && setPurchase({ ...purchase, alert: true, message, id: d.id });
                        }}
                      >
                        <img src={setting.img_host + d.content} alt={d.id} width={50} height={50} />
                        <p className="mt-2">{d.name}</p>
                        <p className="flex justify-around items-center">
                          <img src="/images/coin.png" alt="coin" width={15} height={15} />
                          <span>{d.coin}</span>
                        </p>
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
      {dialogOpen.achievement && tasksList.coin?.length > 0 && tasksList.exp?.length > 0 && (
        <MemberModal
          setConfig={setConfig}
          list={[...tasksList.coin, ...tasksList.exp]}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          isRefreshing={isRefreshing}
          isLoading={isLoading}
          handleRefresh={handleRefresh}
          showSnackbar={showSnackbar}
        />
      )}
      {purchase.alert && <ConfirmAlert t={t} edit={purchase} setEdit={setPurchase} handleAction={handlePurchase} />}
    </>
  );
};

export default AchievementList;
