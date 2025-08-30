import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useGlobalConfig } from "../../GlobalContext";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Loading from "../../components/Common/Loading";
import TopBtn from "../../components/Common/TopBtn";
import ComicList from "../../components/Common/ComicList";
import { FETCH_WEEK_THUNK, FETCH_WEEK_FILTER_THUNK } from "../../actions/weekAction";
import { GoBack } from "../../Hooks";
import { defaultEditInitialState } from "../../utils/InterFace";
import { motion } from "framer-motion";
import PositionedSnackbar, { useSnackbarState } from "../../components/Alert/PositionedSnackbar";

const Week = () => {
  const { config } = useGlobalConfig();
  const { setting, logined, darkMode } = config;
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { snackbars, setSnackbars, showSnackbar } = useSnackbarState();
  const { weekList, weekFilterList, isLoading } = useAppSelector((state) => state.week);
  const { editResult } = useAppSelector((state) => state.member);
  const [selected, setSelected] = useState({ selectType: "", episode: "", categoriesId: "" });
  const [dialogOpen, setDialogOpen] = useState({ folder: false });
  const [editFolder, setEditFolder] = useState(defaultEditInitialState);
  // sessionStorage.setItem("fromPage", location.pathname);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // 預設日漫'manga' || 其他'another' || 韓漫'hanman'
  useEffect(() => {
    dispatch(FETCH_WEEK_THUNK());
  }, [dispatch]);

  const handleTypeOrEpisodeChange = (updates: any) => {
    setSelected((prev) => {
      const updatedSelected = { ...prev, ...updates };
      return updatedSelected;
    });
  };

  useEffect(() => {
    if (selected.categoriesId && selected.selectType) {
      dispatch(
        FETCH_WEEK_FILTER_THUNK({
          id: selected.categoriesId,
          type: selected.selectType,
        })
      );
    }
  }, [selected, dispatch]);

  useEffect(() => {
    if (weekList.type && weekList.categories) {
      const selectedType = weekList.type[2].id;
      const selectedCategory = weekList.categories[0];

      handleTypeOrEpisodeChange({
        selectType: selectedType,
        episode: selectedCategory.time,
        categoriesId: selectedCategory.id,
      });
    }
  }, [weekList]);

  return (
    <div className="min-h-screen">
      {isLoading && <Loading />}
      <div className="sticky top-0 z-50">
        <div className="sticky top-0 h-20 bg-bbk text-white flex items-end p-2 py-3">
          <GoBack back={sessionStorage.getItem("fromPage") || "/"} />
          <p className="ml-4 text-2xl text-og">{t("comic.must_watch")}</p>
          <span className="ml-5">{t("comic.update_time")}</span>
        </div>
        <div className="bg-defaultBg py-1 dark:bg-nbk">
          <Button
            className="w-full flex justify-between bg-transparent text-lg text-gy py-4"
            id="demo-customized-button"
            aria-controls={Boolean(anchorEl) ? "demo-customized-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={Boolean(anchorEl) ? "true" : undefined}
            variant="contained"
            disableElevation
            onClick={(event) => setAnchorEl(event.currentTarget)}
            endIcon={<ArrowDropDownIcon className="text-og text-3xl" />}
          >
            {selected.episode}
          </Button>
          <Menu
            id="demo-customized-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            sx={(theme) => ({
              "& .MuiPaper-root": {
                marginTop: theme.spacing(-2),
                marginLeft: theme.spacing(-2),
                width: "80%",
                color: darkMode ? "#d1d1d1" : "#323232",
                backgroundColor: darkMode ? "#121212" : "",
              },
            })}
          >
            {weekList.categories?.length > 0 &&
              weekList.categories.map((d: any) => (
                <MenuItem
                  key={d.id}
                  onClick={() => {
                    setAnchorEl(null);
                    handleTypeOrEpisodeChange({ categoriesId: d.id, episode: d.time });
                  }}
                >
                  {d.time}
                </MenuItem>
              ))}
          </Menu>
          <div className="w-full flex px-2">
            {weekList.type?.length > 0 &&
              weekList.type.map((d: any) => (
                <div
                  key={d.id}
                  className="flex flex-col items-center mx-6"
                  onClick={() => handleTypeOrEpisodeChange({ selectType: d.id })}
                >
                  <p
                    className={`transition-colors duration-300 ${
                      selected.selectType === d.id ? "text-og pb-2" : "pb-3"
                    }`}
                  >
                    {d.title}
                  </p>
                  {selected.selectType === d.id && (
                    <motion.div
                      layoutId="tab-underline"
                      className="h-1 bg-og rounded"
                      style={{ width: "100%" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
      <ComicList
        t={t}
        cols={6}
        link={true}
        listName={"weekFilterList"}
        list={weekFilterList.list}
        logined={logined}
        setting={setting}
        comicTags={true}
        comicMark={true}
        comicCheck={false}
        editFolder={editFolder}
        setEditFolder={setEditFolder}
        setDialogOpen={setDialogOpen}
        showSnackbar={showSnackbar}
        dialogOpen={dialogOpen}
      />
      <TopBtn />
      <PositionedSnackbar snackbars={snackbars} setSnackbars={setSnackbars} />
    </div>
  );
};

export default Week;
