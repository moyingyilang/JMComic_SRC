import QrCodeIcon from "@mui/icons-material/QrCode";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { PullToRefreshify } from "react-pull-to-refreshify";
import { ReactNode } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { styled, keyframes } from "@mui/material/styles";
import type { PullStatus } from "react-pull-to-refreshify";

const CenterCard = (props: any) => {
  const {
    t,
    logined,
    setting,
    infoData,
    MemberCard,
    scrollUp,
    setDialogOpen,
    dialogOpen,
    memberProgress,
    memberProgressMax,
    setMsgOpen,
    msgOpen,
    isInfoRefreshing,
    handleRefresh,
  } = props;

  // 自定義旋轉動畫
  const spin = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

  const SpinningRefresh = styled(RefreshIcon)`
    animation: ${spin} 1s linear infinite;
  `;

  const colors = { color: "#aaa", fontSize: "2rem", marginTop: "2rem" };

  const renderIcon = (status: PullStatus): ReactNode => {
    switch (status) {
      case "normal":
        return <ArrowDownwardIcon style={colors} />;
      case "pulling":
        return <ArrowDownwardIcon style={colors} />;
      case "canRelease":
        return <RefreshIcon style={colors} />;
      case "refreshing":
        return <SpinningRefresh style={colors} />;
      case "complete":
        return <CheckCircleOutlineIcon style={colors} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-nbk sticky top-0 flex justify-center items-center text-xl h-28 z-50">
        {scrollUp ? (
          !logined ? (
            <span>{t("login.please_login")}</span>
          ) : (
            <div className="w-7/12 flex flex-wrap justify-around items-center text-base">
              <img
                src={`${setting?.img_host + "/media/users/" + infoData.photo}`}
                alt={infoData.username || "users-head"}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/ic_head.png";
                }}
                className="object-cover w-12 h-12"
              />
              <div className="flex flex-col">
                <p>
                  Hi! {infoData.username}&nbsp;·
                  <span className="text-og ml-1">{infoData.level_name}</span>
                </p>
                <p className="flex mt-1">
                  {infoData.badges?.length > 0 &&
                    setting &&
                    infoData.badges.map((d: any, i: number) => (
                      <img
                        key={i}
                        src={setting?.img_host + d.content}
                        alt={d.content}
                        loading="lazy"
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = "1";
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/loading.gif";
                        }}
                        style={{
                          opacity: "0",
                          transition: "opacity 0.5s ease-in-out",
                        }}
                        width={22}
                        height={22}
                        className="mr-1 object-cover"
                      />
                    ))}
                </p>
              </div>
            </div>
          )
        ) : null}
      </div>
      <PullToRefreshify
        completeDelay={1000}
        refreshing={isInfoRefreshing}
        onRefresh={handleRefresh}
        renderText={renderIcon}
      >
        <div className="flex flex-col mb-4">
          {logined ? (
            <div className="w-11/12 h-20 m-10 flex items-end">
              <div className="mr-6 relative" onClick={() => setDialogOpen({ ...dialogOpen, invite: true })}>
                <img
                  src={`${setting?.img_host}/media/users/${infoData.photo}`}
                  alt={infoData.username}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/ic_head.png";
                  }}
                  className="object-cover w-20 h-20"
                />
                <QrCodeIcon sx={{ fontSize: 22 }} className="absolute right-0 top-1/2 transform -translate-y-2" />
              </div>
              <div className="h-20 flex flex-col justify-around">
                <p>
                  Hi! {infoData.username}&nbsp;·<span className="text-og ml-1">{infoData.level_name}</span>
                </p>
                <p className="flex my-2">
                  {infoData.badges?.length > 0 &&
                    infoData.badges.map((d: any, i: number) => (
                      <img
                        key={i}
                        src={setting?.img_host + d.content}
                        alt={d.content}
                        loading="lazy"
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = "1";
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/loading.gif";
                        }}
                        style={{
                          opacity: "0",
                          transition: "opacity 0.5s ease-in-out",
                        }}
                        width={22}
                        height={22}
                        className="mr-1 object-cover"
                      />
                    ))}
                </p>
                <p>
                  {t("member_card.status")}：
                  <span className="text-og ml-2">
                    {infoData.ad_free ? t("member_card.super_JM_person") : t("member_card.JM_person")}
                  </span>
                  <span className="bg-bbk rounded-full ml-4 p-2 text-t08">{infoData.ad_free_before}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-xl pb-20 z-10">
              <button
                className="px-4 py-2 rounded-md border-2 border-solid border-stone-900 bg-og"
                onClick={() => setDialogOpen({ ...dialogOpen, login: true })}
              >
                {t("login.login_register")}
              </button>
            </div>
          )}
          <div className="w-11/12 bg-bbk rounded-md mx-auto text-[#bbb]">
            <ul className="flex justify-around items-center">
              {Array.isArray(MemberCard) &&
                MemberCard.map((d) => (
                  <li key={d.title} className="flex flex-col text-center p-2">
                    <p className="py-2">{d.title}</p>
                    {logined && !isInfoRefreshing ? (
                      <p className="text-og">
                        {`${infoData[d.key[0]]}${infoData[d.key[1]] ? `/${infoData[d.key[1]]}` : ""}`}
                      </p>
                    ) : (
                      <hr className="border border-solid border-og w-5 mx-auto" />
                    )}
                  </li>
                ))}
            </ul>
            <div className="w-full flex justify-between p-4 text-center">
              <div className="w-9/12">
                <p className="mb-2">{t("common_q.jCharge")}</p>
                <div className="relative flex items-center border-2 border-solid border-og bg-white rounded-full h-5">
                  <div
                    className="bg-og h-full rounded-full"
                    style={{
                      width: logined && !isInfoRefreshing ? `${memberProgress * (245 / memberProgressMax)}px` : "",
                    }}
                  ></div>
                  <div className="absolute top=0 left-[-5px] bg-white rounded-full p-0.5 px-1.5">
                    <img src="/images/jCharge.png" alt="jCharge" width={8} height={8} />
                  </div>
                  {logined && !isInfoRefreshing ? (
                    <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      {infoData.charge}
                    </p>
                  ) : (
                    <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">????</p>
                  )}
                </div>
              </div>
              <div className="w-3/12">
                <p className="mb-2">{t("common_q.jJar")}</p>
                <p className="text-og flex justify-center items-center">
                  <img src="images/jJar.png" alt="jJar" width={14} height={14} />
                  {logined && !isInfoRefreshing ? (
                    <span className="ml-1">{infoData.jar}</span>
                  ) : (
                    <span className="ml-1">??/??</span>
                  )}
                </p>
              </div>
            </div>
            <div className="w-full flex items-center justify-between p-4">
              <div className="">
                <button
                  className="rounded-md bg-og text-white p-1 px-2"
                  onClick={() => logined && setDialogOpen({ ...dialogOpen, charge: true })}
                >
                  {t("member_card.promote_charging")}
                </button>
                <button
                  className="rounded-md bg-og text-white p-1 px-2 ml-6"
                  onClick={() => logined && setDialogOpen({ ...dialogOpen, invincible: true })}
                >
                  {t("member_card.activate_invincibility")}
                </button>
              </div>
              <div className="flex text-og" onClick={() => setMsgOpen({ ...msgOpen, member: true })}>
                <HelpOutlineIcon />
                <span>{t("member_card.charging_and_J_cans")}</span>
              </div>
            </div>
          </div>
        </div>
      </PullToRefreshify>
    </>
  );
};

export default CenterCard;
