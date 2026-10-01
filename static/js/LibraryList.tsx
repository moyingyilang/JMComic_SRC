import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { FETCH_CREATOR_AUTHOR_WORK_THUNK } from "../../actions/creatorAction";
import HeaderAds from "../../components/Common/HeaderAds";
import Loading from "../../components/Common/Loading";
import TopBtn from "../../components/Common/TopBtn";
import CreatorList from "../../components/Library/CreatorList";
import SelectMenu from "../../components/Library/SelectMenu";
import { useGlobalConfig } from "../../GlobalContext";
import { GoBack, useScrollToTop } from "../../Hooks";
import { LOAD_CREATOR_LIST } from "../../reducers/creatorReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const LibraryList = () => {
  const { config } = useGlobalConfig();
  const { setting, logined } = config;
  const scrollToTop = useScrollToTop();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { creatorAuthorWorkList, isLoading } = useAppSelector((state) => state.creator);
  const searchParams = new URLSearchParams(location.search);
  const creatorId = searchParams.get("creatorId") as string;
  const libCreatorId = sessionStorage.getItem("libCreatorId") || "";
  const libListSource = sessionStorage.getItem("libListSource") || "";
  const list = creatorAuthorWorkList.list;
  const [filter, setFilter] = useState<any>({ start: false, language: "", source: libListSource });

  // GetList
  const loadList = (isLoadMore: boolean = false, isRefreshing: boolean = false, id: string = creatorId) => {
    dispatch(LOAD_CREATOR_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    dispatch(FETCH_CREATOR_AUTHOR_WORK_THUNK({ id, lang: filter.language, source: filter.source }));
    sessionStorage.setItem("libListSource", filter.source);
    setFilter({ ...filter, start: false });
  };

  useEffect(() => {
    if (creatorId !== libCreatorId || filter.start) {
      scrollToTop();
      sessionStorage.setItem("libCreatorId", creatorId);
      loadList();
    } else {
      dispatch(LOAD_CREATOR_LIST({ isLoading: false }));
    }
  }, [dispatch, creatorId, filter.start]);

  return (
    <>
      {isLoading && <Loading />}
      <div className="h-full bg-defaultBg dark:bg-bk dark:text-tgy">
        <div className="sticky top-safe z-50">
          <HeaderAds />
          <div className="h-14 bg-bbk flex items-end p-2 py-3">
            <GoBack back="/library" />
          </div>
        </div>
        {list && setting && (
          <div
            className="bg-cover bg-top overflow-hidden px-4 py-2 relative"
            style={{
              backgroundImage: `url(${
                setting?.img_host && list?.background_image
                  ? `${setting.img_host}${list.background_image}`
                  : "/images/chapter_default.jpg"
              })`,
            }}
          >
            <div className="absolute inset-0 bg-gray-800 bg-opacity-70 z-0"></div>
            <div className="flex items-center text-wrap relative z-10">
              <div className="w-2/6">
                <img
                  src={setting?.img_host && list?.author_avatar && `${setting.img_host}${list.author_avatar}`}
                  alt={list.author_name}
                  loading="lazy"
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = "1";
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/ic_head.png";
                  }}
                  style={{
                    opacity: "0",
                    transition: "opacity 0.5s ease-in-out",
                  }}
                  className="w-32 rounded-xl"
                />
              </div>
              <div className="w-4/6">
                <p className="absolute top-5 text-og text-3xl">{list.author_name}</p>
              </div>
            </div>
            <SelectMenu
              t={t}
              title="creatorAuthorWorkList"
              filtersList={creatorAuthorWorkList.filters}
              filter={filter}
              setFilter={setFilter}
            />
          </div>
        )}
        {list?.sponsor?.length > 0 &&
          list.sponsor.map((d: any, i: number) => (
            <a
              key={i}
              href={d.platform_url.startsWith("http") ? d.platform_url : setting.main_web_host}
              target="_blank"
              className="flex justify-center mt-5"
              rel="noreferrer"
            >
              <button className="w-11/12 bg-og rounded p-3 text-left">
                {t("library.support_author")} → {d.platform_name}
              </button>
            </a>
          ))}
        <div className="py-8">
          {!isLoading && (
            <CreatorList
              title="creatorAuthorWorkList"
              creatorId={creatorId}
              list={list.related_works}
              setting={setting}
            />
          )}
        </div>
        <TopBtn />
      </div>
    </>
  );
};

export default LibraryList;
