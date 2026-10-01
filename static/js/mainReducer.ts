import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import createAsyncReducer from "./AsyncReducer";


interface MainState {
    mainList: any[];
    latestList: { list: any[]; total: number; };
    moreList: { total: number, list: any[]; error: string; };
    coverAds: Record<string, any>,
    adsScript: Record<string, any>;
    isLoading: boolean;
    isLoadMore: boolean;
    isLastLoading: boolean;
    isLastLoadMore: boolean;
    isLastLoadMoreLoading: boolean;
    isRefreshing: boolean;
    isMoreListLoadMore: boolean;
    isMoreListLoading: boolean;
    isMoreListRefreshing: boolean;
    error: string;
}
const initialState: MainState = {
    mainList: [],
    latestList: { list: [], total: 0 },
    moreList: { total: 0, list: [], error: "" },
    coverAds: {},
    adsScript: {},
    isLoading: true,
    isLoadMore: false,
    isLastLoading: true,
    isLastLoadMore: false,
    isLastLoadMoreLoading: false,
    isRefreshing: false,
    isMoreListLoadMore: false,
    isMoreListLoading: true,
    isMoreListRefreshing: false,
    error: ""
};

const MainSlice = createSlice({
    name: "main",
    initialState,
    reducers: {
        LOAD_MAIN_LIST: (state, action: PayloadAction<any>) => {
            const { isLoading = false, isLoadMore = false, isRefreshing = false } = action.payload || {};
            return {
                ...state,
                isLoading,
                isLoadMore,
                isRefreshing
            };
        },
        GET_MAIN_LIST: (state, action: PayloadAction<any>) => {
            const { mainList, isLoadMore } = state;
            const { data } = action.payload;
            let currentList = isLoadMore ? [...mainList, ...data] : data;
            return {
                ...state,
                mainList: currentList,
                isLoading: false,
                isLoadMore: false,
                isRefreshing: false,
            };
        },
        LOAD_LATEST_LIST: (state, action: PayloadAction<any>) => {
            const { isLastLoading = false, isLastLoadMore = false, isLastLoadMoreLoading = false, isRefreshing = false } = action.payload || {};
            return {
                ...state,
                isLastLoading,
                isLastLoadMore,
                isLastLoadMoreLoading,
                isRefreshing
            };
        },
        GET_LATEST_LIST: (state, action: PayloadAction<any>) => {
            const { latestList, isLastLoadMore } = state;
            const data = action.payload.data;
            // 目前 API 只回傳純陣列，之後 API 補上 total 後會變成 { list, total }
            const list = Array.isArray(data) ? data : data?.list ?? [];
            const total = Array.isArray(data) ? 0 : Number(data?.total) || 0;
            let currentList = isLastLoadMore ? [...latestList.list, ...list] : list;
            return {
                ...state,
                latestList: { list: currentList, total },
                isLastLoading: false,
                isLastLoadMore: false,
                isRefreshing: false,
            };
        },
        LOAD_MORE_LIST: (state, action: PayloadAction<any>) => {
            const { isMoreListLoadMore = false, isMoreListLoading = false, isMoreListRefreshing = false } = action.payload || {};
            return {
                ...state,
                isMoreListLoadMore,
                isMoreListLoading,
                isMoreListRefreshing
            };
        },
        GET_MORE_LIST: (state, action: PayloadAction<any>) => {
            const { moreList, isMoreListLoadMore } = state;
            const { list, total, error } = action.payload;
            let currentList = { ...state.moreList };
            if (error) {
                currentList.error = error;
            } else {
                currentList.list = isMoreListLoadMore ? [...moreList.list, ...list] : list;
                currentList.total = Number(total) || 0;
                currentList.error = "";
            }
            return {
                ...state,
                moreList: currentList,
                isMoreListLoading: false,
                isMoreListLoadMore: false,
                isMoreListRefreshing: false,
            };
        },
        GET_COVER_LIST: (state, action: PayloadAction<any>) => {
            state.coverAds = action.payload;
            state.isLoading = false;
        },
        GET_ADS: (state, action: PayloadAction<any>) => {
            state.adsScript = action.payload;
        },
        CLEAR_MAIN_LIST(state, action: PayloadAction<keyof typeof initialState>) {
            const listName = action.payload;
            const target = state[listName];
            if (Array.isArray(target)) {
                target.length = 0;
            } else if (target && Array.isArray((target as any).list)) {
                (target as any).list.length = 0;
            } else if (target && typeof target === 'object') {
                Object.keys(target).forEach(key => {
                    delete (target as Record<string, any>)[key];
                });
            }
        },
        RESET_MAIN_STATE: () => initialState,
    },
    extraReducers: (builder) => {

    }
});

export const { LOAD_MAIN_LIST, GET_MAIN_LIST, LOAD_LATEST_LIST, GET_LATEST_LIST, LOAD_MORE_LIST, GET_MORE_LIST, GET_COVER_LIST, GET_ADS, CLEAR_MAIN_LIST, RESET_MAIN_STATE } = MainSlice.actions;
export default MainSlice.reducer;
