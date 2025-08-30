import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Backdrop from "@mui/material/Backdrop";

import {
  FacebookMessengerShareButton,
  FacebookShareButton,
  EmailShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookMessengerIcon,
  FacebookIcon,
  TelegramIcon,
  WhatsappIcon,
} from "react-share";

const Share = (props: any) => {
  const { setting, queryId, share, setShare, showSnackbar, type } = props;

  const shareUrl = `http://${setting.main_web_host}/${type || "album"}/${queryId}`;
  const title = "分享这篇漫畫！";

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        showSnackbar("copied", "info");
        setTimeout(() => {
          setShare(false);
        }, 1000);
      })
      .catch((error) => {
        console.error("Failed to copy text: ", error);
      });
  };

  return (
    <>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={share}
        onClick={() => setShare(!share)}
      >
        <div
          className={`text-gy rounded-t-3xl w-full bg-[#fafafa] fixed bottom-0 z-[1401] overflow-y-auto transition-all duration-700 h-[50vh] ${
            share ? "animate-move-up" : "animate-move-down"
          }`}
        >
          <div className="py-4 z-20">
            <hr className="w-8 border-[1px] border-[#bbb] mx-auto" />
            <div className="flex items-center justify-center h-20">
              <p>{shareUrl}</p>
            </div>
            <div className="w-8/12 flex justify-around items-center mx-auto font-bold text-sm">
              <button
                className="border border-solid border-blue-800 rounded-lg px-6 py-1 flex items-center"
                onClick={copyToClipboard}
              >
                <ContentCopyIcon sx={{ fontSize: 16, marginRight: 1 }} />
                <span>Copy</span>
              </button>
              {/* <button
                className="border border-solid border-blue-800 rounded-lg px-6 py-1 flex items-center text-nowrap"
                onClick={copyToClipboard}
              >
                <SendToMobileIcon sx={{ fontSize: 16, marginRight: 1 }} />
                <span>Quick Share</span>
              </button> */}
            </div>
            <div className="h-40 flex justify-center items-end">
              <p className="">No recommended people to share with</p>
            </div>
            <div className="w-full fixed bottom-10 left-0 right-0 flex justify-around">
              <FacebookMessengerShareButton url={shareUrl} appId={title} className="flex flex-col items-center">
                <FacebookMessengerIcon size={42} round />
                <span>Messenger</span>
              </FacebookMessengerShareButton>

              <EmailShareButton url={shareUrl} subject={title} className="flex flex-col items-center">
                <EmailIcon size={42} round />
                <span>Email</span>
              </EmailShareButton>

              <FacebookShareButton url={shareUrl} title={title} className="flex flex-col items-center">
                <FacebookIcon size={42} round />
                <span>Facebook</span>
              </FacebookShareButton>

              <TelegramShareButton url={shareUrl} title={title} className="flex flex-col items-center">
                <TelegramIcon size={42} round />
                <span>Telegram</span>
              </TelegramShareButton>

              <WhatsappShareButton url={shareUrl} title={title} className="flex flex-col items-center">
                <WhatsappIcon size={42} round />
                <span>Whatsapp</span>
              </WhatsappShareButton>
            </div>
          </div>
        </div>
      </Backdrop>
    </>
  );
};

export default Share;
