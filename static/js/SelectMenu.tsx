import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const SelectMenu = (props: any) => {
  const { t, title, filtersList, filter, setFilter } = props;
  const [menuOpen, setMenuOpen] = useState<Record<string, boolean>>({});
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>, dropdownId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen((prev: any) => ({ ...prev, [dropdownId]: true }));
  };

  const handleClose = (dropdownId: string) => {
    setMenuOpen((prev: any) => ({ ...prev, [dropdownId]: false }));
    setAnchorEl(null);
  };

  return (
    <>
      <div className={`flex justify-start py-4 ${title && "text-white"}`}>
        {[{ id: "language" }, { id: "source" }].map((dropdown) => (
          <div key={dropdown.id} className="w-1/2 pl-2 flex justify-between items-center">
            <div className="w-full z-20">
              <span className="font-bold">
                {dropdown.id === "language" ? t("library.language") : t("library.source")}：
              </span>
              <Button
                className="w-9/12 bg-transparent text-lg text-[#918987] py-4"
                id={`demo-customized-button-${dropdown.id}`}
                aria-controls={menuOpen[dropdown.id] ? `demo-customized-menu-${dropdown.id}` : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen[dropdown.id] ? "true" : undefined}
                variant="contained"
                disableElevation
                onClick={(e) => handleClick(e, dropdown.id)}
                endIcon={<ArrowDropDownIcon className="absolute top-0 right-0 text-og text-3xl" />}
              >
                <div className="absolute left-2 top-0">{filter[dropdown.id] === "" ? "All" : filter[dropdown.id]}</div>
              </Button>
            </div>
            <Menu
              id={`demo-customized-menu-${dropdown.id}`}
              anchorEl={anchorEl}
              open={menuOpen[dropdown.id] || false}
              onClose={() => handleClose(dropdown.id)}
              sx={(theme) => ({
                "& .MuiPaper-root": {
                  marginTop: theme.spacing(-3),
                  marginLeft: theme.spacing(2),
                  width: "30%",
                  padding: "0",
                  position: "absolute",
                  color: "#757575",
                },
              })}
            >
              {Array.isArray(filtersList[dropdown.id] || []) && filtersList[dropdown.id]?.length > 0 ? (
                filtersList[dropdown.id]?.map((option: any) => (
                  <MenuItem
                    key={option.service || option}
                    onClick={() => {
                      handleClose(dropdown.id);
                      setFilter({ ...filter, [dropdown.id]: option.service || (option !== "All" ? option : "") });
                    }}
                  >
                    {option.name || option}
                  </MenuItem>
                ))
              ) : (
                <MenuItem
                  onClick={() => {
                    handleClose(dropdown.id);
                  }}
                >
                  ALL
                </MenuItem>
              )}
            </Menu>
          </div>
        ))}
      </div>
    </>
  );
};

export default SelectMenu;
