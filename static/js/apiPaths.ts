const apiPaths = {
    token: "185Hcomic3PAPP7R",

    // APP 設定
    API_APP_SETTING: "setting", // 取得 APP 設定

    // 新廣告
    API_ADVERTISE_ALL: "ad_content_all", // 取得全部廣告內容
    API_ADVERTISE_CONTENT_COVER: "advertise_all", // 取得封面廣告內容

    //小說
    API_NOVEL_LIST: "novels", // 小說列表
    API_NOVEL_DETAIL: "novel", // 小說詳情
    API_NOVEL_CHAPTERS: "novelchapters", // 小說章節列表
    API_NOVEL_SEARCH: "search_novels", // 搜尋小說
    API_NOVEL_LIKE: "like", // 小說按讚
    API_NOVEL_COMMENT: "comment", // 小說留言
    API_NOVEL_FAVORITES: "novel_favorites", // 小說收藏列表
    API_EDIT_NOVEL_FAVORITES: "novel_favorites_folder", // 編輯小說收藏資料夾
    API_NOVEL_COIN_BUY: "coin_buy_nc", // 購買小說章節

    // 搜尋
    API_COMIC_SEARCH: "search", // 搜尋漫畫
    API_COMIC_HOT_TAGS: "hot_tags", // 熱門標籤
    API_COMIC_RANDOM_RECOMMEND: "random_recommend", // 隨機推薦

    // 首頁
    API_COMIC_PROMOTE: "promote", // 首頁主推薦列表
    API_COMIC_LATEST: "latest", // 首頁最新漫畫列表

    // 首頁 -> 更多
    API_COMIC_PROMOTE_LIST: "promote_list", // 首頁推薦分類更多列表
    API_COMIC_SER_MORE_LIST: "serialization", // 首頁連載更多列表

    // 漫畫章節
    API_COMIC_CHAPTER: "chapter", // 漫畫章節列表
    API_COMIC_DETAIL: "album", // 漫畫詳情
    API_COMIC_READ: "comic_read", // 漫畫閱讀內容

    // 會員資料
    API_MEMBER_LOGIN: "login", // 會員登入
    API_MEMBER_LOOUT: "logout", // 會員登出
    API_MEMBER_REGISTER: "register", // 會員註冊
    API_MEMBER_FORGOT: "forgot", // 忘記密碼

    // 分類
    API_CATEGORIES_LIST: "categories", // 分類列表
    API_CATEGORIES_FILTER_LIST: "categories/filter", // 分類篩選列表

    // 論壇留言
    API_FORUM_LIST: "forum", // 論壇列表
    API_COMMENT_SEND: "comment", // 送出留言
    API_COMMENT_VOTE: "comment_vote", // 留言投票
    API_COMMENT_DETELE: "comment_delete", // 刪除留言
    API_CHECK_RECOMMEND_BN: "check_recommend_book", // 檢查推薦書籍

    // 我的收藏
    API_FAVORITE_LIST: "favorite", // 收藏列表
    API_LIKE_DATA: "like", // 按讚資料

    // 觀看歷史
    API_HISTORY_LIST: "watch_list", // 觀看歷史列表

    // 遊戲
    API_GAMES_LIST: "allgames", // 遊戲列表

    // 影片
    API_VIDEOS_LIST: "videos", // 影片列表
    API_LATEST_HANIME: "latest_hanime", // 最新動畫列表
    API_VIDEO_INFO: "video", // 影片詳情
    API_BAITU_CREATE_TOKEN: "baitu-create-token", // 建立播放 token

    // 部落格
    API_BLOGS_LIST: "blogs", // 部落格文章列表
    API_BLOG_INFO: "blog", // 部落格文章詳情
    API_GAME_INFO: "game", // 遊戲詳情

    // 收藏資料夾編輯
    API_FAVORITE_FOLDER: "favorite_folder", // 收藏資料夾編輯

    // 成就系統
    API_TASKS_LIST: "tasks", // 任務列表
    API_TASKS_BUY_LIST: "coin", // 任務金幣購買列表

    // 回傳錯誤資訊
    API_ERROR_LOG: "error_log", // 上報錯誤紀錄

    // 每週必看
    API_WEEK: "week", // 每週必看列表
    API_WEEK__FILTER_LIST: "week/filter", // 每週必看篩選列表

    // 下載頁
    API_ALBUM_DOWNLOAD: "album_download_2", // 漫畫下載

    // 使用者編輯
    API_USEREDIT: "useredit", // 使用者資料編輯

    // 廣告banner
    API_ADVERTISE: "advertise", // 廣告 banner
    API_ADVERTISE_CONTENT: "ad_content", // 廣告內容

    // 簽到
    API_DAILY: "daily", // 每日簽到
    API_DAILY_CHECK: "daily_chk", // 每日簽到打卡
    API_DAILY_LIST: "daily_list", // 簽到列表
    API_DAILY_LIST_FILTER: "daily_list/filter", // 簽到篩選列表

    // tag 收藏
    API_TAGS_FAVORITE: "tags_favorite", // 標籤收藏列表
    API_TAGS_FAVORITE_UPDATE: "tags_favorite_update", // 更新標籤收藏

    // 購買ai漫畫
    API_COIN_BUY_COMICS: "coin_buy_comics", // 金幣購買漫畫

    // 購買充能
    API_COIN_BUY_CHARGE: "coin_buy_charge", // 金幣儲值

    // 開啟去廣告
    API_AD_FREE: "ad_free", // 去廣告設定
    API_AD_FREE_PAY: "payment", // 去廣告付款

    // 通知
    API_NOTIFICATIONS: "notifications", // 通知列表
    API_NOTIFICATIONS_UNREAD: "notifications/unreadCount", // 未讀通知數量
    API_NOTIFICATIONS_SERTRACK: "album_sertracking", // 連載追蹤設定
    API_NOTIFICATIONS_TRACK_LIST: "album_tracking", // 追蹤列表

    // 書庫
    API_CREATOR_AUTHOR: "creator_author", // 作者列表
    API_CREATOR_WORK: "creator_work", // 作品列表
    API_CREATOR_WORK_DETAIL: "creator_author_work", // 作者作品詳情
    API_CREATOR_WORK_INFO: "creator_work_info", // 作品資訊
    API_CREATOR_WORK_INFO_DETAIL: "creator_work_info_detail", // 作品資訊詳情

    // 贊助客服
    API_SUPPORT_REPORT: "support_report", // 客服回報

    //標籤隱屏蔽
    API_TAG_BLOCK_SETTING: "tag_block", // 標籤隱藏設定
};

export default apiPaths;
