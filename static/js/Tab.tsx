import { useEffect, useRef } from "react";
import { useAppDispatch } from "../../store/hooks";
import { FETCH_NOTIFICATIONS_UNREAD_THUNK, FETCH_TAGS_FAVORITE_LIST_THUNK } from "../../actions/memberAction";
import { motion } from "framer-motion";
import { CLEAR_MEMBER_LIST, LOAD_MEMBER_LIST } from "../../reducers/memberReducer";

const Tab = (props: any) => {
  const { logined, tabItems, tab, setTab, unread, openIndex, notifResult } = props;
  const dispatch = useAppDispatch();
  const tabRefs = useRef<(HTMLUListElement | null)[]>([]);
  const tabContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logined && Object.keys(unread).length === 0 && Object.keys(notifResult).length > 0) {
      dispatch(FETCH_NOTIFICATIONS_UNREAD_THUNK());
    }
  }, [logined, openIndex, notifResult]);

  useEffect(() => {
    const container = tabContainerRef.current;
    const el = tabRefs.current[tab - 1];
    if (container && el) {
      setTimeout(() => {
        const containerWidth = container.offsetWidth;
        const elLeft = el.offsetLeft;
        const elWidth = el.offsetWidth;

        const scrollTo = elLeft - containerWidth / 2 + elWidth / 2;

        container.scrollTo({
          left: scrollTo,
          // behavior: "smooth", // 可加或省略
        });
      }, 0);
    }
  }, []);

  const loadList = (isLoadMore: boolean = false, isRefreshing: boolean = false) => {
    dispatch(LOAD_MEMBER_LIST({ isLoading: true, isLoadMore, isRefreshing }));
    if (isRefreshing) {
      dispatch(CLEAR_MEMBER_LIST("tagsList"));
    }
    dispatch(FETCH_TAGS_FAVORITE_LIST_THUNK());
  };

  return (
    <>
      <nav
        ref={tabContainerRef}
        className="bg-nbk sticky top-28 w-full mx-auto flex items-center overflow-x-auto whitespace-nowrap pt-4 px-3 z-50"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {Array.isArray(tabItems) &&
          tabItems.map((d: any, i: number) => (
            <ul
              key={d}
              ref={(el) => (tabRefs.current[i] = el)}
              className={`pt-2 ${tab === i + 1 ? "bg-bbk rounded-t-lg" : ""}`}
            >
              <li
                className="animation-click-item mx-4 pt-1 flex items-center space-x-2"
                onClick={() => {
                  setTab(i + 1);
                  sessionStorage.setItem("memberTab", JSON.stringify(i + 1));
                }}
              >
                <span className="py-1">{d}</span>
                {i === 2 && unread.comic_follow + unread.site_notice > 0 && (
                  <span className="bg-red-600 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center">
                    {unread.comic_follow + unread.site_notice}
                  </span>
                )}
              </li>
              {tab === i + 1 && (
                <motion.div
                  className="border-b-4 border-solid border-og"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ transformOrigin: "center" }}
                />
              )}
            </ul>
          ))}
      </nav>
    </>
  );
};
export default Tab;
