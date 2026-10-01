import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import TextsmsIcon from "@mui/icons-material/Textsms";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const NovelReadBottom = (props: any) => {
  const {
    t,
    nid,
    ncid,
    setTab,
    commentRef,
    dialogOpen,
    setDialogOpen,
    favoriteSave,
    handleEngagementAction,
    handleNextChapter,
  } = props;
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-20">
      <div className="flex justify-around items-start bg-bbk text-white z-50 min-h-[6rem] pt-3 overflow-hidden">
        {[
          {
            icon: <TextFieldsIcon className="text-3xl" />,
            text: t("setting.font"),
            click: () => setDialogOpen({ ...dialogOpen, textFields: true }),
          },
          {
            icon: <KeyboardDoubleArrowRightIcon className="text-3xl" />,
            text: t("novel.next_chapter"),
            click: () => handleNextChapter(),
          },
          {
            icon: <TextsmsIcon className="text-3xl" />,
            text: t("nav.forum"),
            click: () => {
              if (commentRef.current) {
                commentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
              setTab(2);
            },
          },
          {
            icon: favoriteSave.mark.includes(nid) ? (
              <BookmarkIcon className="text-3xl text-og" />
            ) : (
              <BookmarkBorderIcon className="text-3xl" />
            ),
            text: t("detail.favorites"),
            click: () => handleEngagementAction("mark", nid),
          },
          {
            icon: <MoreVertIcon className="text-3xl" />,
            text: t("novel.more"),
            click: () => setDialogOpen({ ...dialogOpen, moreElse: !dialogOpen.moreElse }),
          },
        ].map((d, i) => (
          <div
            key={d.text}
            onClick={() => d.click()}
            className="flex flex-col items-center justify-between w-full max-w-[20%] text-gy"
          >
            <div>{d.icon}</div>
            <span className="text-center text-sm">{d.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NovelReadBottom;
