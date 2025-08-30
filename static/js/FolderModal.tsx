import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Fade from "@mui/material/Fade";
import Menu from "@mui/material/Menu";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FolderModal = (props: any) => {
  const { dialogOpen, setDialogOpen, editFolder, setEditFolder, handleEditFolder, folderList, tagsList } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { t } = useTranslation();
  const isSelectedAll = tagsList?.length > 0 && editFolder.tags_select === tagsList.toString();

  const handleClose = (_event: React.SyntheticEvent, reason?: string): void => {
    // 檢查背景點擊 (backdropClick) 時不關閉視窗
    if (reason === "backdropClick") {
      return;
    }
    setDialogOpen({ ...dialogOpen, folder: false });
  };
  return (
    <>
      {dialogOpen.folder && (
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen.folder}
          TransitionComponent={Transition}
          className="text-white"
          slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.3)" } } }}
          sx={() => ({
            "& .MuiPaper-root": {
              paddingY: "1rem",
              width: "90%",
            },
          })}
        >
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[700],
              stroke: theme.palette.grey[700],
              strokeWidth: 2,
            })}
          >
            <CloseIcon />
          </IconButton>
          {editFolder.type === "add" && (
            <DialogTitle className="text-center" id="customized-dialog-title">
              {t("member.add_folder")}
            </DialogTitle>
          )}
          {editFolder.type === "edit" && (
            <DialogTitle className="text-center" id="customized-dialog-title">
              {t("member.rename_folder")}
            </DialogTitle>
          )}
          {editFolder.type === "move" && (
            <DialogTitle id="customized-dialog-title">{t("member.Select_favorite_folder")}</DialogTitle>
          )}
          <DialogContent className="">
            {(editFolder.type === "add" || editFolder.type === "edit") && (
              <input
                type="text"
                placeholder={t("member.enter_folder_name")}
                className="w-11/12 h-10 p-4 border border-solid border-gy"
                onChange={(e) => setEditFolder({ ...editFolder, folder_name: e.target.value })}
              />
            )}
            {editFolder.type === "move" && (
              <div>
                <Button
                  id="fade-button"
                  aria-controls={open ? "fade-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  className="flex justify-between p-0 w-8/12 text-[#aaa] text-lg"
                >
                  <span className="pr-10">{editFolder.folder_name || t("member.select_folder")}</span>
                  <ArrowDropDownIcon sx={{ color: "#ff6f00", fontSize: 24 }} />
                </Button>
                <Menu
                  id="fade-menu"
                  MenuListProps={{
                    "aria-labelledby": "fade-button",
                  }}
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => setAnchorEl(null)}
                  TransitionComponent={Fade}
                  sx={(theme) => ({
                    "& .MuiPaper-root": {
                      marginTop: theme.spacing(0),
                      marginLeft: theme.spacing(-2),
                      width: "50%",
                      color: "#757575",
                    },
                  })}
                >
                  {folderList?.length > 0 &&
                    folderList.map((d: any, i: number) => (
                      <MenuItem
                        key={d.FID}
                        onClick={() => {
                          setAnchorEl(null);
                          setEditFolder({
                            ...editFolder,
                            folder_name: d.name,
                            folder_id: d.FID,
                          });
                        }}
                      >
                        {d.name}
                      </MenuItem>
                    ))}
                </Menu>
              </div>
            )}
            {tagsList?.length > 0 && (
              <>
                <hr className="border-2 border-tgy my-4" />
                <div className="text-left">
                  <div className="flex items-center">
                    <p
                      className="border-2 border-solid border-og w-5 h-5 flex justify-center items-center overflow-hidden mr-2"
                      onClick={() => {
                        const newTags = isSelectedAll ? "" : tagsList.toString();
                        setEditFolder((prev: any) => ({
                          ...prev,
                          tags_select: newTags,
                        }));
                      }}
                    >
                      {isSelectedAll && (
                        <CheckIcon sx={{ fontSize: 14, color: "#ff6f00", stroke: "#ff6f00", strokeWidth: 2 }} />
                      )}
                    </p>
                    <span>收藏全部標籤</span>
                  </div>
                  <div className="flex flex-wrap items-center text-gy mt-4 dark:text-tgy">
                    {tagsList.map((d: any) => (
                      <span
                        key={d}
                        className={`border-[1px] border-solid border-gy rounded-md p-1 m-1 dark:bg-nbk
                         ${editFolder.tags_select?.split(",").includes(d) ? "bg-og text-white border-og" : ""}`}
                        onClick={() => {
                          const selectArray = editFolder.tags_select?.split(",") || [];
                          const isSelected = selectArray.includes(d);

                          const newSelect = isSelected ? selectArray.filter((s: any) => s !== d) : [...selectArray, d];

                          setEditFolder((prev: any) => ({
                            ...prev,
                            tags_select: newSelect.join(",").replace(/^,/, ""),
                          }));
                        }}
                      >
                        {"#" + d}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
          <DialogActions className="flex justify-center">
            <Button
              className="bg-og text-white rounded border-solid border-2 border-og w-8/12"
              onClick={(e) => {
                handleClose(e);
                editFolder.type === "add" && handleEditFolder("add");
                editFolder.type === "edit" && handleEditFolder("edit");
                editFolder.type === "move" && handleEditFolder("move");
              }}
            >
              {t("member.confirm")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default FolderModal;
