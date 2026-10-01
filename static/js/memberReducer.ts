import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FETCH_AD_FREE_THUNK, FETCH_ADD_FAVORITE_THUNK, FETCH_ADD_LIKE_THUNK, FETCH_CHANGE_TASKS_THUNK, FETCH_CHARGE_THUNK, FETCH_DAILY_CHECK_THUNK, FETCH_DAILY_LIST_FILTER_THUNK, FETCH_EDIT_FAVORITE_FOLDER_THUNK, FETCH_EDIT_INFO_LIST_THUNK, FETCH_FORGOT_THUNK, FETCH_GET_DAILY_OPTION_THUNK, FETCH_GET_DAILY_THUNK, FETCH_GET_INFO_LIST_THUNK, FETCH_LOGIN_THUNK, FETCH_LOGOUT_THUNK, FETCH_NOTIFICATIONS_SERTRACK_THUNK, FETCH_NOTIFICATIONS_UNREAD_THUNK, FETCH_POST_NOTIFICATIONS_THUNK, FETCH_SIGN_UP_THUNK, FETCH_TAGS_FAVORITE_LIST_THUNK, FETCH_TAGS_FAVORITE_UPDATE_THUNK, FETCH_TASKS_BUY_THUNK } from "../actions/memberAction";
import createAsyncReducer from "./AsyncReducer";

interface MemberState {
    info: Record<string, any>;
    favoriteList: { list: any[]; folder_list: any[]; total: number; count: number; };
    tagsList: { list: any[]; };
    tasksList: { all: any[]; coin: any[]; exp: any[]; msg: string; };
    dailyList: Record<string, any>;
    dailyOption: { list: any[]; };
    dailyFilter: Record<string, any>;
    watchList: { list: any[]; total: number; };
    trackedList: { list: any[]; total: number; };
    notificationList: { list: any[]; total: number; };
    adsPaymentList: { orders: any[]; checkout: string; pay_methods: any[]; plans: any[]; web_host: string; };
    unread: Record<string, any>;
    notifResult: Record<string, any>,
    infoList: Record<string, any>;
    memberResult: Record<string, any>;
    editResult: Record<string, any>,
    isLoading: boolean;
    isLoadMore: boolean;
    isInfoLoading: boolean;
    isInfoRefreshing: boolean;
    isRefreshing: boolean;
    error: string;
    chargeAdsLoading: boolean;
    tagBlockSetting: {
        confirm_next_preview: string;
        editable: number;
        last_confirm_at: string;
        level: number;
        level_ok: number;
        lock_reason: string;
        next_editable_at: string;
        saved_tags: string[];
        tag_list: {
            tag: string;
            tag_label: string;
            blocked: boolean;
        }[];
        unlocked: number;
        updated_at_display: string;
    };
}

const initialState: MemberState = {
    info: {},
    favoriteList: { list: [], folder_list: [], total: 0, count: 0 },
    tagsList: { list: [] },
    tasksList: { all: [], coin: [], exp: [], msg: "" },
    dailyList: {},
    dailyOption: { list: [] },
    dailyFilter: {},
    watchList: { list: [], total: 0 },
    trackedList: { list: [], total: 0 },
    notificationList: { list: [], total: 0 },
    adsPaymentList: { orders: [], checkout: "", pay_methods: [], plans: [], web_host: "" },
    unread: {},
    notifResult: {},
    infoList: {},
    memberResult: {},
    editResult: {},
    isLoading: false,
    isLoadMore: false,
    isRefreshing: false,
    isInfoLoading: false,
    isInfoRefreshing: false,
    error: "",
    chargeAdsLoading: false,
    tagBlockSetting: {
        confirm_next_preview: "",
        editable: 0,
        last_confirm_at: "",
        level: 0,
        level_ok: 0,
        lock_reason: "",
        next_editable_at: "",
        saved_tags: [],
        tag_list: [],
        unlocked: 0,
        updated_at_display: "",
    },
};

const memberSlice = createSlice({
    name: "member",
    initialState,
    reducers: {
        LOAD_MEMBER_INFO_LIST: (state, action: PayloadAction<any>) => {
            const { isInfoLoading = false, isInfoRefreshing = false } = action.payload || {};
            return {
                ...state,
                isInfoLoading,
                isInfoRefreshing
            };
        },
        LOAD_MEMBER_LIST: (state, action: PayloadAction<any>) => {
            const { isLoading = false, isLoadMore = false, isRefreshing = false } = action.payload || {};
            return {
                ...state,
                isLoading,
                isLoadMore,
                isRefreshing
            };
        },
        SET_ERROR: (state, action: PayloadAction<any>) => {
            return {
                ...state,
                errorMsg: action.payload.errorMsg,
                isLoading: false,
            };
        },
        GET_FAVORITE_LIST: (state, action: PayloadAction<any>) => {
            const { favoriteList, isLoadMore } = state;
            const { list, count, folder_list, total } = action.payload;
            let currentList = { ...favoriteList };
            currentList.list = isLoadMore ? [...favoriteList.list, ...list] : list;
            currentList.total = Number(total);
            currentList.count = Number(count);
            currentList.folder_list = folder_list;
            return {
                ...state,
                favoriteList: currentList,
                isLoading: false,
                isLoadMore: false,
                isRefreshing: false,
            };

        },
        GET_TASK_LIST: (state, action: PayloadAction<any>) => {
            const { tasksList } = state;
            const { list, msg } = action.payload.data;
            const { type } = action.payload;
            const currentList = { ...tasksList, msg };

            switch (type) {
                case "title":
                case "badge":
                    currentList.all = list;
                    break;
                case "coin":
                    currentList.coin = list;
                    break;
                case "exp":
                    currentList.exp = list;
                    break;
                default:
                    currentList.all = list;
                    break;
            }

            return {
                ...state,
                tasksList: currentList,
                isLoading: false,
                isLoadMore: false,
                isRefreshing: false,
            };
        },
        GET_TAG_BLOCK_SETTING: (state, action: PayloadAction<any>) => {
            return {
                ...state,
                tagBlockSetting: action.payload,
                isLoading: false,
                isLoadMore: false,
                isRefreshing: false,
            };
        },
        GET_WATCH_LIST: (state, action: PayloadAction<any>) => {
            const { watchList, isLoadMore } = state;
            const { list, total } = action.payload;

            let currentList = { ...watchList };
            currentList.list = isLoadMore ? [...watchList.list, ...list] : list;
            currentList.total = Number(total);
            return {
                ...state,
                watchList: currentList,
                isLoading: false,
                isLoadMore: false,
                isRefreshing: false,
            };
        },
        GET_TRACKED_LIST: (state, action: PayloadAction<any>) => {
            const { trackedList, isLoadMore } = state;
            const { item, totalCnt } = action.payload;

            let currentList = { ...trackedList };
            currentList.list = isLoadMore ? [...trackedList.list, ...item] : item;
            currentList.total = Number(totalCnt);
            return {
                ...state,
                trackedList: currentList,
                isLoading: false,
                isLoadMore: false,
                isRefreshing: false,
            };
        },
        GET_NOTIFICATION_LIST: (state, action: PayloadAction<any>) => {
            const { notificationList, isLoadMore } = state;
            const data = action.payload;
            const list = Array.isArray(data) ? data : data?.list ?? [];
            const total = Array.isArray(data) ? 0 : Number(data?.total) || 0;
            let currentList = isLoadMore ? [...notificationList.list, ...list] : list;
            return {
                ...state,
                notificationList: { list: currentList, total },
                isLoading: false,
                isLoadMore: false,
                isRefreshing: false,
            };
        },
        GET_ADS_PAYMENT: (state, action: PayloadAction<any>) => {
            const { adsPaymentList } = state;

            const { orders, checkout, pay_methods, plans, web_host } = action.payload;
            let currentList = { ...adsPaymentList };
            currentList.orders = orders;
            currentList.checkout = checkout;
            currentList.pay_methods = pay_methods;
            currentList.plans = plans;
            currentList.web_host = web_host;
            return {
                ...state,
                adsPaymentList: currentList,
                isLoading: false,
            };
        },
        CLEAR_MEMBER_LIST(state, action: PayloadAction<keyof typeof initialState>) {
            const listName = action.payload;
            const target = state[listName];

            if (Array.isArray(target)) {
                target.length = 0;
            } else if (target && Array.isArray((target as any).list)) {
                (target as any).list.length = 0;
            } else if (target && typeof target === 'object') {
                Object.assign(target, initialState[listName]);
            }
        },
        RESET_MEMBER_STATE: () => initialState,
    },
    extraReducers: (builder) => {
        createAsyncReducer(FETCH_LOGIN_THUNK, "info")(builder);
        createAsyncReducer(FETCH_SIGN_UP_THUNK, "memberResult")(builder);
        createAsyncReducer(FETCH_FORGOT_THUNK, "memberResult")(builder);
        createAsyncReducer(FETCH_LOGOUT_THUNK, "memberResult")(builder);
        createAsyncReducer(FETCH_CHARGE_THUNK, "memberResult", "chargeAdsLoading")(builder);
        createAsyncReducer(FETCH_AD_FREE_THUNK, "memberResult", "chargeAdsLoading")(builder);
        createAsyncReducer(FETCH_EDIT_FAVORITE_FOLDER_THUNK, "editResult")(builder);
        createAsyncReducer(FETCH_TAGS_FAVORITE_LIST_THUNK, "tagsList")(builder);
        createAsyncReducer(FETCH_TAGS_FAVORITE_UPDATE_THUNK, "editResult")(builder);
        // createAsyncReducer(FETCH_TASKS_LIST_THUNK, "tasksList")(builder);
        createAsyncReducer(FETCH_CHANGE_TASKS_THUNK, "editResult")(builder);
        createAsyncReducer(FETCH_TASKS_BUY_THUNK, "editResult")(builder);
        createAsyncReducer(FETCH_GET_DAILY_THUNK, "dailyList")(builder);
        createAsyncReducer(FETCH_DAILY_CHECK_THUNK, "memberResult")(builder);
        createAsyncReducer(FETCH_GET_DAILY_OPTION_THUNK, "dailyOption")(builder);
        createAsyncReducer(FETCH_DAILY_LIST_FILTER_THUNK, "dailyFilter")(builder);
        createAsyncReducer(FETCH_GET_INFO_LIST_THUNK, "infoList")(builder);
        createAsyncReducer(FETCH_EDIT_INFO_LIST_THUNK, "editResult")(builder);
        createAsyncReducer(FETCH_ADD_LIKE_THUNK, "editResult")(builder);
        createAsyncReducer(FETCH_ADD_FAVORITE_THUNK, "editResult")(builder);
        createAsyncReducer(FETCH_NOTIFICATIONS_UNREAD_THUNK, "unread")(builder);
        createAsyncReducer(FETCH_POST_NOTIFICATIONS_THUNK, "notifResult")(builder);
        createAsyncReducer(FETCH_NOTIFICATIONS_SERTRACK_THUNK, "notifResult")(builder);
    }
});

export const { LOAD_MEMBER_INFO_LIST, LOAD_MEMBER_LIST, SET_ERROR, GET_FAVORITE_LIST, GET_TASK_LIST, GET_TAG_BLOCK_SETTING, GET_WATCH_LIST, GET_TRACKED_LIST, GET_NOTIFICATION_LIST, GET_ADS_PAYMENT, CLEAR_MEMBER_LIST, RESET_MEMBER_STATE } = memberSlice.actions;
export default memberSlice.reducer;
