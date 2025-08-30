import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SearchIcon from "@mui/icons-material/Search";
import DialogModal from "../Modal/DialogModal";
import { useGlobalConfig } from "../../GlobalContext";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { ForumTabItems } from "../../assets/JsonData";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const Header = (props: any) => {
  const { setTabChange, filter, setFilter, currentPage, catList, subList, mode, setMode } = props;
  const { config } = useGlobalConfig();
  const { setting } = config;
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState({ catMore: false, imageSource: false });
  const styled = { fontSize: 20, stroke: "white", strokeWidth: 1 };
  const tabItems = ForumTabItems();

  const icons = [
    { icon: <FlashOnIcon sx={{ ...styled }} />, onClick: () => setDialogOpen({ ...dialogOpen, imageSource: true }) },
    { icon: <RestaurantIcon sx={{ ...styled }} />, link: "/blogs" },
    { icon: <CalendarTodayIcon sx={{ ...styled }} />, link: "/week" },
    { icon: <SearchIcon sx={{ ...styled }} />, link: "/search" },
  ];

  return (
    <header className="sticky top-0 w-full bg-bbk text-white z-30">
      <div className="h-14 flex items-center">
        <div className="flex w-6/12 pl-3">
          <Link to="/">
            <img src="/images/new_logo.webp" alt="logo" width="100px" height="20px" className="animation-click-item" />
          </Link>
        </div>
        <div className="text-white top-bar-icon flex w-6/12 justify-around">
          {icons.map((item, index) => (
            <Link to={item.link || "#"} key={index} onClick={item.onClick}>
              <button className="animation-click-item">{item.icon}</button>
            </Link>
          ))}
        </div>
      </div>
      {currentPage === "categories" && catList.cat?.length > 0 && (
        <div className="text-tgy relative bg-nbk">
          <div
            className="h-10 w-11/12 flex items-center overflow-x-auto whitespace-nowrap pr-8"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {catList.cat.map((d: any, i: number) => (
              <div key={d.slug}>
                <span
                  title={d.name}
                  className={`pl-4 ${filter.slug === d.slug ? "text-og" : ""}`}
                  onClick={() => {
                    setFilter({ ...filter, tabChange: true, slug: d.slug, sub_slug: "", sort: "" });
                    setTabChange(true);
                  }}
                >
                  {d.name}
                </span>
                {i === 0 && (
                  <Link to="/library?from=categories" className="pl-4">
                    {t("library.forbidden_comic_library")}
                  </Link>
                )}
              </div>
            ))}
            <div className="bg-bbk p-1 absolute top-0 right-0">
              <MoreHorizIcon
                sx={{ fontSize: 28, stroke: "#ff6f00", strokeWidth: 1, color: "#ff6f00" }}
                onClick={() => setDialogOpen({ ...dialogOpen, catMore: true })}
              />
            </div>
          </div>
          <div className="h-10 flex items-center">
            {catList.ranking.map((d: any) => (
              <span
                key={d.key}
                className={`pl-4 ${filter.sort === d.key ? "text-og" : ""}`}
                onClick={() => {
                  setFilter({ ...filter, sort: d.key });
                  setTabChange(true);
                }}
              >
                {d.title}
              </span>
            ))}
          </div>
          {subList.length > 0 && (
            <div className="h-10 flex items-center">
              {subList.map((d: any) => (
                <span
                  key={d.slug}
                  className={`pl-4 ${filter.sub_slug === d.slug ? "text-og" : ""}`}
                  onClick={() => {
                    setTabChange(true);
                    setFilter({ ...filter, sub_slug: d.slug });
                  }}
                >
                  {d.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {currentPage === "forum" && (
        <div className="h-20 w-full text-tgy flex items-end py-2 bg-nbk z-50">
          {tabItems.map((d) => (
            <div
              key={d.mode}
              className="relative px-4 text-lg cursor-pointer"
              onClick={() => {
                setTabChange(true);
                setMode(d.mode);
              }}
            >
              <p className={`transition-colors duration-300 ${mode === d.mode ? "text-og pb-2" : "pb-3"}`}>
                {d.tabName}
              </p>
              {mode === d.mode && (
                <motion.div
                  className="h-1 bg-og rounded"
                  animate={{ width: mode === d.mode ? "100%" : "0%" }}
                  initial={{ width: "0%" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ transformOrigin: "left" }}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {dialogOpen.imageSource && (
        <DialogModal setDialogOpen={setDialogOpen} dialogOpen={dialogOpen} setting={setting} />
      )}
      {dialogOpen.catMore && (
        <DialogModal
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
          catList={dialogOpen.catMore ? catList : {}}
          setFilter={setFilter}
          filter={filter}
        />
      )}
    </header>
  );
};
export default Header;
