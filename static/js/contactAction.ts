import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiEndpoint } from "../api/ApiEndpointUtil";
import HttpUtil from "../api/HttpUtil";
import { GET_SUPPORT_REPORT_CATEGORIES_LIST, GET_SUPPORT_REPORT_LIST } from "../reducers/contactReducer";

export const FETCH_SUPPORT_REPORT_THUNK = createAsyncThunk(
    "support_report_list/fetch",
    async (params: { action: string; feedback_id?: string; srid?: string; page?: number; }, { dispatch, rejectWithValue }) => {
        const { action } = params;
        try {
            let res: Record<string, any> = {};

            const url = getApiEndpoint("API_SUPPORT_REPORT");

            await HttpUtil.fetchGet(url, params,
                (response: any) => {
                    res = response;
                    if (response.code === 200 && action === "form") {
                        dispatch(GET_SUPPORT_REPORT_CATEGORIES_LIST(response.data));
                    } else if (response.code === 200 && action !== "detail" && action !== "image") {
                        dispatch(GET_SUPPORT_REPORT_LIST(response.data));
                    }
                },
                (error: any) => {
                    return new Error(error);
                }
            );

            return res;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "數據獲取失敗");
        }
    }
);

export const FETCH_SUPPORT_REPORT＿IMAGE_THUNK = createAsyncThunk(
    "support_report_img/fetch",
    async (params: { action: string; srid?: string; }, { rejectWithValue }) => {
        const { action, srid } = params;
        try {
            let res: Record<string, any> = {};

            const url = getApiEndpoint("API_SUPPORT_REPORT");

            await HttpUtil.fetchImage(url, { action, srid },
                (result: string | Record<string, any>) => {
                    res = typeof result === "string" ? { data: result } : result;
                },
                (error: any) => {
                    return new Error(error);
                }
            );
            return res;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "數據獲取失敗");
        }
    }
);

export const FETCH_SEND_SUPPORT_REPORT_THUNK = createAsyncThunk(
    "support_report/fetch",
    async (params: {
        category_id: string | number;
        sub_category_id: string | number;
        carrier_name: string;
        device_model: string;
        description: string;
        image?: File | null;
    }, { rejectWithValue }) => {
        try {
            let res: Record<string, any> = {};
            let errMsg: string | null = null;

            const url = getApiEndpoint("API_SUPPORT_REPORT");

            await HttpUtil.fetchPost(url, params,
                (response: any) => {
                    res = response;
                },
                (error: any) => {
                    return new Error(error);
                }
            );
            // if (errMsg) {
            //     return rejectWithValue(errMsg);
            // }
            return res;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "數據獲取失敗");
        }
    }
);

