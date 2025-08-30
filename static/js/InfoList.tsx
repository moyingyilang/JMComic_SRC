import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { FETCH_GET_INFO_LIST_THUNK, FETCH_EDIT_INFO_LIST_THUNK } from "../../actions/memberAction";
import { CLEAR_MEMBER_LIST, LOAD_MEMBER_LIST, RESET_MEMBER_STATE } from "../../reducers/memberReducer";
import InfoModal from "../Modal/InfoModal";
import { infoInputData } from "../../assets/JsonData";

const InfoList = (props: any) => {
  const { t, memberInfo, logined, showSnackbar } = props;
  const dispatch = useAppDispatch();
  const { infoList, isLoading } = useAppSelector((state) => state.member);
  const [dialogOpen, setDialogOpen] = useState({ editInfo: false });
  const [formData, setFormData] = useState({});

  const handleFetchData = async () => {
    const res = await dispatch(FETCH_GET_INFO_LIST_THUNK(memberInfo.uid)).unwrap();
    setFormData(res);
  };

  useEffect(() => {
    if (logined && Object.keys(infoList).length === 0) handleFetchData();
  }, [logined, Object.keys(infoList).length]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    dispatch(CLEAR_MEMBER_LIST("infoList"));
    const result = await dispatch(FETCH_EDIT_INFO_LIST_THUNK({ uid: memberInfo.uid, formData })).unwrap();
    const { errorMsg, code } = result;
    if (code === 200) {
      const message = errorMsg;
      const type = errorMsg?.includes("failed") ? "error" : "success";
      showSnackbar(message, type);
    }
    handleFetchData();
    // setDialogOpen({ ...dialogOpen, editInfo: false });
  };

  return (
    <>
      <div className="w-full bg-defaultBg text-bbk dark:bg-bk dark:text-tgy">
        {isLoading ? (
          <div className="w-full flex justify-center pb-48">
            <img src="/images/loading.gif" alt="loading" width="80px" />
          </div>
        ) : (
          <ul className="pt-4 text-lg">
            <li className="bg-white dark:bg-bbk flex justify-between px-4 py-2 my-1">
              <span>{t("info.account")}</span>
              <span>{memberInfo.username}</span>
            </li>
            <li className="bg-white dark:bg-bbk flex justify-between px-4 py-2 my-1">
              <span>EMAIL</span>
              <span>{memberInfo.email}</span>
            </li>
            <li className="bg-white dark:bg-bbk flex justify-between px-4 py-2 my-1">
              <span>{t("info.password")}</span>
              <span className="text-og" onClick={() => setDialogOpen({ ...dialogOpen, editInfo: true })}>
                {t("member.modify")}
              </span>
            </li>
          </ul>
        )}
      </div>
      {dialogOpen.editInfo && (
        <InfoModal
          memberInfo={memberInfo}
          infoList={infoList}
          formData={formData}
          setFormData={setFormData}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          handleSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default InfoList;
