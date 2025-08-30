export interface DataItem {
  id: number;
  name: string;
}

export interface FetchError {
  message: string;
}

//SettingApi
export interface SettingData {
  logo_path: string;
  main_web_host: string;
  img_host: string;
  base_url: string;
  is_cn: number;
  cn_base_url: string;
  version: string;
  test_version: string;
  store_link: string;
  ios_version: string;
  ios_test_version: string;
  ios_store_link: string;
  ad_cache_version: number;
  bundle_url: string;
  is_hot_update: boolean;
  api_banner_path: string;
  version_info: string;
  app_shunts: Array<{ key: number; title: string; }>;
  download_url: string;
  app_landing_page: string;
  float_ad: boolean;
  newYearEvent: boolean;
  foolsDayEvent: boolean;
  dateYmdHis: string;
}
export interface SettingResponse<T = SettingData> {
  code: number;
  data: T;
  dateYmdHis?: string;
}

// PromoteApi
export interface PromoteResponse {
  code: number;
  dateYmdHis: string;
  data: {
    id: string;
    title: string;
    slug: string;
    type: string;
    filter_val: string;
    content: {
      author: string;
      category: {
        id: string | null;
        title: string | null;
      };
      category_sub: {
        id: string | null;
        title: string | null;
      };
      id: string;
      image: string;
      is_favorite: boolean;
      liked: boolean;
      name: string;
      update_at: number;
    }[];
  }[];
}

// latestApi
export interface LatestResponse {
  code: number;
  data:
  | {
    id: string;
    author: string;
    description: string;
    name: string;
    image: string;
    category: {
      id: string;
      title: string;
    };
    category_sub: {
      id: string | null;
      title: string | null;
    };
    liked: boolean;
    is_favorite: boolean;
    update_at: number;
  }[];
  dateYmdHis: string;
}

// weekApi
export interface WeekRespons {
  code: number;
  data: {
    categories: { id: string; title: string; time: string; }[];
    type: { id: string; title: string; }[];
  };
  dateYmdHis: string;
}

// BannerApi
export interface BannerResponse {
  code: number;
  data: {
    adv: {
      link: string;
      image: string;
      adv_type: number;
    }[];
  };
  dateYmdHis: string;
}

// searchApi
export interface SearchResponse {
  code: number;
  data: {
    search_query: string;
    total: string;
    content: Array<{
      id: string;
      author: string;
      description: string | null;
      name: string;
      image: string;
      category: {
        id: string;
        title: string;
      };
      category_sub: {
        id: string | null;
        title: string | null;
      } | null;
      liked: boolean;
      is_favorite: boolean;
      update_at: number;
    }>;
  };
  dateYmdHis: string;
}

export interface MoreListResponse {
  code: number;
  data: {
    total: string;
    list: Array<{
      id: string;
      author: string;
      description: string;
      name: string;
      image: string;
      category: {
        id: string | null;
        title: string | null;
      };
      category_sub: {
        id: string | null;
        title: string | null;
      } | null;
      liked: boolean;
      is_favorite: boolean;
      update_at: number;
    }>;
  };
  dateYmdHis: string;
}

export interface GameResponse {
  code: number;
  data: {
    games: {
      gid: string;
      title: string;
      description: string;
      tags: string;
      link: string;
      photo: string;
      type: string[];
      categories: {
        name: string;
      };
    }[];
    hot_games: {
      gid: string;
      title: string;
      description: string;
      tags: string;
      link: string;
      photo: string;
      type: string[];
      categories: {
        name: string;
      };
    }[];
    categories: {
      name: string;
      slug: string;
      game_types: { name: string; slug: string; }[];
    }[];
  };
  dateYmdHis: string;
}

export interface MoviesResponse {
  code: number;
  data: {
    list: {
      id: string;
      photo: string;
      title: string;
      tags: string[];
      backlink: string;
    }[];
    total: string;
  };
  dateYmdHis: string;
}

export interface LatestHanimeResponse {
  code: number;
  data: {
    id: string;
    photo: string;
    title: string;
  }[];
  dateYmdHis: string;
}

export interface VideoDetailResponse {
  code: number;
  data: {
    video: {
      vid: string;
      title: string;
      description: string;
      video_src: string;
      channel: string;
      factory: string;
      view: string;
      date: string;
      photo: string;
      full_url: string;
      tags: string[];
      girls: string[];
      duration: string;
      backlink: string;
    };
    related_videos: {
      id: string;
      photo: string;
      title: string;
      tags: string[];
      backlink: string;
    }[];
    videoSeries: {
      id: string;
      photo: string;
      title: string;
      tags: string[];
      backlink: string;
      vid: string;
      view: string;
    }[];
  };
  dateYmdHis: string;
}

interface UserFormData {
  login: {
    username: string;
    password: string;
  };
  signUp: {
    username: string;
    password: string;
    password_confirm: string;
    email: string;
    gender: string;
    adult: boolean;
    PrivacyPolicy: boolean;
  };
  forgot: {
    email: string;
  };
}

export const defaultUserFormData: UserFormData = {
  login: { username: "", password: "" },
  signUp: {
    username: "",
    password: "",
    password_confirm: "",
    email: "",
    gender: "",
    adult: false,
    PrivacyPolicy: false,
  },
  forgot: { email: "" },
};

interface EditInitialState {
  edit: boolean,
  type: string,
  folder_id: string,
  folder_name: string,
  aid: string,
  o: string,
  select: string,
  alert: boolean,
  confirm: boolean,
  message: string,
  tags_select: string,
};


export const defaultEditInitialState: EditInitialState = {
  edit: false,
  type: "move",
  folder_id: "",
  folder_name: "",
  aid: "",
  o: "mr",
  select: "",
  alert: false,
  confirm: false,
  message: "",
  tags_select: "",
};