import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiEndpoint } from "../api/ApiEndpointUtil";
import HttpUtil from "../api/HttpUtil";
import { GET_SEARCH_LIST, LOAD_SEARCH_LIST } from "../reducers/searchReducer";

export const FETCH_SEARCH_THUNK = createAsyncThunk(
    "search/fetch",
    async (params: { search_query: string, o?: string; page?: number; search_type?: string; y?: string; m?: string; }, { dispatch, rejectWithValue }) => {
        try {
            let res: Record<string, any> = {};

            const url = getApiEndpoint("API_COMIC_SEARCH");

            await HttpUtil.fetchGet(url, params,

                (response: any) => {
                    if (response.code === 200) {
                        res = response.data;
                        dispatch(GET_SEARCH_LIST(response.data));
                    } else {
                        // code 非 200 時原本沒有任何地方會把 isLoading 收回去，畫面會卡在 Loading
                        dispatch(LOAD_SEARCH_LIST({ isLoading: false, isLoadMore: false, isRefreshing: false }));
                    }
                },
                (error: any) => {
                    return new Error(error);
                }
            );
            return res;
        } catch (error) {
            // 請求本身拋例外時同樣要收回 isLoading，避免卡在 Loading 畫面
            dispatch(LOAD_SEARCH_LIST({ isLoading: false, isLoadMore: false, isRefreshing: false }));
            return rejectWithValue(error instanceof Error ? error.message : "數據獲取失敗");
        }
    }
);

export const FETCH_HOT_TAGS_THUNK = createAsyncThunk(
    "hot_tags/fetch",
    async (_, { rejectWithValue }) => {
        try {
            let res: Record<string, any> = {};

            const url = getApiEndpoint("API_COMIC_HOT_TAGS");

            await HttpUtil.fetchGet(url, {},
                (response: any) => {
                    if (response.code === 200) {
                        res = response;
                    }
                },
                (error: any) => {
                    return new Error(error);
                }
            );
            return res.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "數據獲取失敗");
        }
    }
);

export const FETCH_RECOMMEND_THUNK = createAsyncThunk(
    "recommend/fetch",
    async (_, { rejectWithValue }) => {
        try {
            let res: Record<string, any> = {};

            const url = getApiEndpoint("API_COMIC_RANDOM_RECOMMEND");

            await HttpUtil.fetchGet(url, {},
                (response: any) => {
                    if (response.code === 200) {
                        res = response;
                    }
                },
                (error: any) => {
                    return new Error(error);
                }
            );
            return res.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "數據獲取失敗");
        }
    }
);
