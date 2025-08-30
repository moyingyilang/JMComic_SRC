import { t } from "i18next";
const version = process.env.REACT_APP_VERSION;

export const SearchHelpData = () => {
  return {
    title: t("search_help.searchBestPosture"),
    image: "images/help_cover_2.png",
    btn_text: t("search_help.iLearnedIt"),
    text_sections: [
      {
        title: t("search_help.includeSearch"),
        content: t("search_help.dreamOfBeingHero"),
        example: t("search_help.example1")
      },
      {
        title: t("search_help.includeSearch"),
        content: t("search_help.noSkillsStruggle"),
        example: t("search_help.example2"),
      },
      {
        title: t("search_help.includeSearch"),
        content: t("search_help.giveUpAdventurerPath"),
        example: t("search_help.example3"),
      },
    ],
  };
};

export const SearchSortData = () => {
  return [
    { title: t("cat_sort.latest"), key: "" },
    { title: t("cat_sort.mostViews"), key: "mv" },
    { title: t("cat_sort.mostImages"), key: "mp" },
    { title: t("cat_sort.mostHearts"), key: "tf" },
  ];
};

export const CatSortData = () => {
  return [
    { title: t("cat_sort.latest"), key: "" },
    { title: t("cat_sort.mostHearts"), key: "tf" },
    { title: t("cat_sort.totalRanking"), key: "mv" },
    { title: t("cat_sort.monthlyRanking"), key: "mv_m" },
    { title: t("cat_sort.weeklyRanking"), key: "mp_w" },
    { title: t("cat_sort.dailyRanking"), key: "mp_t" },
  ];
};

export const ForumTabItems = () => {
  return [
    { mode: "all", tabName: t("forum.showAll") },
    { mode: "manhua", tabName: t("forum.mangaComments") },
    { mode: "chat", tabName: t("forum.chatHall") },
  ];
};

export const DetailHelpData = () => {
  return {
    title: t("detail_help.title"),
    image: "/images/help_cover.png",
    btn_text: t("detail_help.btn_text"),
    text_sections: [
      {
        content: t("detail_help.section1"),
      },
      {
        content: t("detail_help.section2"),
      },
    ]
  };
};

export const CommonQData = () => {
  return [
    {
      title: t("common_q.title"),
      list: [
        { img: "/images/jJar.png", name: t("common_q.jJar"), desc: "", type: "Jar" },
        { img: "/images/jCharge.png", name: t("common_q.jCharge"), desc: "", type: "Charge" },
      ],
      text_section: [
        {
          FAQ: [t("common_q.jJarFAQ1"), t("common_q.jChargeFAQ1")],
          content: [t("common_q.jJarContent")],
        },
        {
          FAQ: [t("common_q.earnJJar1"), t("common_q.chargeFAQ1")],
          content: [t("common_q.earnJJarContent1"), t("common_q.earnJJarContent2"), t("common_q.earnJJarContent3")],
        },
        {
          FAQ: [t("common_q.notExpiredFAQ1")],
          content: [t("common_q.notExpiredContent")],
        },
        {
          FAQ: [t("common_q.appWebFAQ1")],
          content: [t("common_q.appWebContent")],
        },
      ],
    },
    {
      title: t("common_q.exchangeTitle"),
      list: [
        { img: "/images/adFree_month.png", name: t("common_q.noAds30Days"), desc: t("common_q.desc30Days"), type: "month" },
        { img: "/images/adFree_day.png", name: t("common_q.noAds1Day"), desc: t("common_q.desc1Day"), type: "day" },
      ],
      text_section: [
        {
          FAQ: [],
          content: [
            t("common_q.noAdsContent1"),
            t("common_q.noAdsContent2"),
            t("common_q.noAdsExample"),
          ],
        },
      ],
    },
    {
      title: t("common_q.announcementTitle"),
      list: [
        { img: "", name: t("common_q.permanentDomain"), desc: "http://google.com", type: t("common_q.domain") },
        { img: "", name: t("common_q.publishPage"), desc: "http://google.com", type: t("common_q.publishPage") },
        {
          img: "",
          name: t("common_q.chatRules"),
          desc: "http://google.com",
          type: t("common_q.chatRule"),
        },
      ],
      text_section: [
        {
          FAQ: [],
          content: [
            t("common_q.communityGuidelines"),
            t("common_q.communityGuidelines1"),
            t("common_q.communityGuidelines2"),
            t("common_q.communityGuidelines3"),
            t("common_q.communityGuidelines4"),
            t("common_q.communityGuidelines5"),
            t("common_q.communityGuidelines6"),
            t("common_q.communityGuidelines7"),
            t("common_q.communityGuidelines8"),
            t("common_q.communityGuidelines9"),
          ],
        },
      ],
    },
    {
      title: t("common_q.announcementTitle"),
      list: [
        { img: "", name: t("common_q.permanentDomain"), desc: "http://google.com", type: t("common_q.domain") },
        { img: "", name: t("common_q.publishPage"), desc: "http://google.com", type: t("common_q.publishPage") },
        {
          img: "",
          name: t("common_q.chatRules"),
          desc: "http://google.com",
          type: t("common_q.chatRule"),
        },
      ],
      text_section: [
        {
          FAQ: [],
          content: [
            t("common_q.communityGuidelines"),
            t("common_q.communityGuidelines1"),
            t("common_q.communityGuidelines2"),
            t("common_q.communityGuidelines3"),
            t("common_q.communityGuidelines4"),
            t("common_q.communityGuidelines5"),
            t("common_q.communityGuidelines6"),
            t("common_q.communityGuidelines7"),
            t("common_q.communityGuidelines8"),
            t("common_q.communityGuidelines9"),
          ],
        },
      ],
    },
  ];
};

export const MemberCardData = () => {
  return [
    { key: ["exp", "nextLevelExp"], title: t("member_card.experience") },
    { key: ["level"], title: "LV" },
    { key: ["coin"], title: "J Coins" },
    { key: ["album_favorites", "album_favorites_max"], title: t("member_card.collected") },
  ];
};

export const InfoInputData = () => {
  return [
    {
      title: t("info.account_info"),
      inputContnet: [
        { label: t("info.username"), name: "username" },
        { label: "EMAIL", name: "email" },
        { label: t("info.nick_name"), name: "nick_name" },
        { label: t("info.password"), name: "password" },
        { label: t("info.password_confirm"), name: "password_confirm" },
      ],
    },
    {
      title: t("info.personal_info"),
      inputContnet: [
        { label: t("info.first_name"), name: "first_name" },
        { label: t("info.last_name"), name: "last_name" },
        { label: t("info.birthday"), name: "birthday" },
        {
          label: t("info.relationship"),
          name: "relationship",
          options: [
            { val: "", option: "---" },
            { val: "single", option: t("info.single") },
            { val: "taken", option: t("info.taken") },
            { val: "open", option: t("info.open") },
          ],
        },
        {
          label: t("info.interest"),
          name: "interest",
          options: [
            { val: "", option: "---" },
            { val: "guys", option: t("info.guys") },
            { val: "girls", option: t("info.girls") },
            { val: "guys_and_girls", option: t("info.guys_and_girls") },
          ],
        },
        { label: t("info.website"), name: "website" },
      ],
    },
    {
      title: t("info.location_info"),
      inputContnet: [
        { label: t("info.birth_place"), name: "birth_place" },
        { label: t("info.city"), name: "city" },
        { label: t("info.country"), name: "country" },
        { label: t("info.occupation"), name: "occupation" },
        { label: t("info.company"), name: "company" },
        { label: t("info.school"), name: "school" },
      ],
    },
    {
      title: t("info.random_info"),
      inputContnet: [
        { label: t("info.about_me"), name: "about_me" },
        { label: t("info.info_here"), name: "info_here" },
        { label: t("info.collections"), name: "collections" },
        { label: t("info.ideal_partner"), name: "ideal_partner" },
        { label: t("info.erogenic_zone"), name: "erogenic_zone" },
        { label: t("info.favorite"), name: "favorite" },
        { label: t("info.hate"), name: "hate" },
      ],
    },
  ];
};

export const infoInputData = [
  {
    title: "帳戶信息",
    inputContnet: [
      { label: "用戶名", name: "username" },
      { label: "EMAIL", name: "email" },
      { label: "暱稱", name: "nickName" },
      { label: "密碼", name: "password" },
      { label: "重新輸入密碼", name: "password_confirm" },
    ],
  },
  {
    title: "個人信息",
    inputContnet: [
      { label: "名字", name: "lastName" },
      { label: "姓", name: "firstNam" },
      { label: "生日", name: "birthday" },
      {
        label: "關係",
        name: "relations",
        options: [
          { val: "", option: "---" },
          { val: "Single", option: "單身" },
          { val: "Taken", option: "非單身" },
          { val: "Open", option: "開放" },
        ],
      },
      {
        label: "興趣",
        name: "relations",
        options: [
          { val: "", option: "---" },
          { val: "Guys", option: "男" },
          { val: "Taken", option: "女" },
          { val: "Open", option: "男+女" },
        ],
      },
      { label: "網站", name: "website" },
    ],
  },
  {
    title: "位置信息",
    inputContnet: [
      { label: "出生地", name: "birthPlace" },
      { label: "城市", name: "city" },
      { label: "國家", name: "country" },
      { label: "職業", name: "occupation" },
      { label: "公司", name: "company" },
      { label: "學校", name: "school" },
    ],
  },
  {
    title: "隨機信息",
    inputContnet: [
      { label: "關於我", name: "aboutMe" },
      { label: "這裡的", name: "infoHere" },
      { label: "收藏性類別", name: "collections" },
      { label: "最喜歡的理想性伴侶", name: "ideal" },
      { label: "我的Erogenic區", name: "erogenic" },
      { label: "最喜歡", name: "favorite" },
      { label: "最討厭", name: "hate" },
    ],
  },
];

export const SettingLinkData = () => {
  return [
    {
      new: [
        { title: t("setting.latest_news"), name: t("setting.view_articles"), link: "" },
        { title: "", name: t("setting.view_jm_announcement"), link: "https://trello.com/b/McDZAm8C/" },
        { title: "", name: t("setting.view_url_page"), link: "https://jm365.work/AwNzE2" },
      ],
    },
    {
      links: [
        { title: t("setting.site_link"), name: t("setting.aphrodisiac"), link: "http://google.com" },
        { title: "", name: t("setting.free_video"), link: "http://google.com" },
        { title: "", name: t("setting.sugar_heart_break"), link: "http://google.com" },
        { title: "", name: t("setting.dating_friend"), link: "http://google.com" },
        { title: "", name: t("setting.free_porn"), link: "http://google.com" },
        { title: "", name: t("setting.banana_crack"), link: "http://google.com" },
        { title: "", name: t("setting.free_p_site"), link: "http://google.com" },
        { title: "", name: t("setting.cracked_91"), link: "http://google.com" },
        { title: "", name: t("setting.no_code_2d"), link: "http://google.com" },
      ],
    },
    {
      setting: [
        { title: t("setting.language"), name: t("setting.lang"), link: "#" },
        { title: t("setting.switch_image_source"), name: t("setting.switch_image_source"), link: "#" },
        { title: t("setting.night_mode"), name: "", link: "#" },
      ],
    },
    {
      sponsor: [
        { title: t("setting.donate"), name: t("setting.donate"), link: "http://google.com" },
        { title: "", name: t("setting.watch_ads"), link: "http://google.com" },
      ],
    },
    {
      contact: [{ title: t("setting.contact"), name: t("setting.advertising_inquiries"), link: "mailto:www18comic@gmail.com?subject=JMComic3_APP" }],
    },
    {
      logout: [{ title: "", name: t("login.logout"), link: "" }],
    },
  ];
};

export const AchievementSelectData = () => {
  return [
    {
      name: t("achievement.title"),
      type: "title",
      option: [
        { name: t("achievement.my_title"), filter: "my", type: "title" },
        { name: t("achievement.all_titles"), filter: "all", type: "title" },
      ],
    },
    {
      name: t("achievement.badge"),
      type: "badge",
      option: [
        { name: t("achievement.my_badge"), filter: "my", type: "badge" },
        { name: t("achievement.all_badges"), filter: "all", type: "badge" },
      ],
    },
  ];
};

export const ComicType = () => {
  return (
    [
      { type: "all", name: t("comic.tab_items.0") },
      { type: "manga", name: t("comic.tab_items.1") },
      { type: "hanman", name: t("comic.tab_items.2") }
    ]
  );

};

export const filterAdKey = [
  "board1",
  "app_home_float",
  "app_search_bottom",
  "app_detail_tab_bottom",
  "album_detail",
  "download1",
  "download2",
  "download3",
  "app_chapter_next",
  "app_chapter_last",
  "app_user_notice",
  "app_forum_middle",
  "app_forum_new_theme_bottom",
  "app_blogs_ten",
  "app_blogs_fixed_bottom",
  "app_blog_bottom_left_1",
  "app_blog_bottom_right_1",
  "app_blog_bottom_center",
  "app_blog_bottom_left_2",
  "app_blog_bottom_right_2",
  "app_blog_bottom",
  "app_blogs_fixed_bottom",
  "app_movies_bottom",
  "app_movie_bottom_left_1",
  "app_movie_bottom_right_1",
  "app_movie_bottom_center",
  "app_movie_bottom_left_2",
  "app_movie_bottom_right_2",
  "app_movie_bottom",
  "app_movie_fixed_bottom",
];

export const adjustAdHight = ["app_thewayhome"];

export const defaultErrorMsg = t(
  `發生錯誤，請回報管理員 \n\n現在時間：${new Date()} ,\nkey=${window.location.pathname.split("/")[1]
  }\n\n＊目前版本為 ${version}版，最新版本為 ${version}版\n\n若仍有問題請截圖到官方Discord群\nhttps://discord.gg/V74p7HM\n#網站與app問題回報\n\n即將跳轉回首頁`
);