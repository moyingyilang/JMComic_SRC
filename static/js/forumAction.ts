import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiEndpoint } from "../api/ApiEndpointUtil";
import HttpUtil from "../api/HttpUtil";
import { GET_FORUM_LIST } from "../reducers/forumReducer";

export const FETCH_FORUM_THUNK = createAsyncThunk(
  "forum/fetch",
  async (params: { mode?: string; page?: number; aid?: string; bid?: string; uid?: string; nid?: string; ncid?: string; recommendBN?: []; }, { dispatch, rejectWithValue }) => {
    try {
      let res: Record<string, any> = {};

      const url = getApiEndpoint("API_FORUM_LIST");

      await HttpUtil.fetchGet(url, params,
        (response: any) => {
          if (response.code === 200) {
            res = response;
            dispatch(GET_FORUM_LIST(response.data));
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

export const FETCH_FORUM_SEND_THUNK = createAsyncThunk(
  "forumSend/fetch",
  async (params: { comment: string; aid: string; bid?: string; comment_id?: string; }, { rejectWithValue }) => {
    try {
      let res: Record<string, any> = {};

      const url = getApiEndpoint("API_COMMENT_SEND");

      await HttpUtil.fetchPost(url, params,
        (response: any) => {
          if (response.code === 200) {
            res = response;
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

export const FETCH_FORUM_DELETE_THUNK = createAsyncThunk(
  "commentDelete/fetch",
  async (params: { comment_id: string, aid?: string; bid?: string; uid?: string; nid?: string; gid?: string; }, { dispatch, rejectWithValue }) => {
    try {
      let res: Record<string, any> = {};

      const url = getApiEndpoint("API_COMMENT_DETELE");

      await HttpUtil.fetchPost(url, params,
        (response: any) => {
          if (response.code === 200) {
            res = response;
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

export const FETCH_CHECK_RECOMMEND_BN_THUNK = createAsyncThunk(
  "checkRecommendBN/fetch",
  async (aid: string, { rejectWithValue }) => {
    try {
      let res: Record<string, any> = {};

      const url = getApiEndpoint("API_CHECK_RECOMMEND_BN");

      await HttpUtil.fetchPost(url, { aid },
        (response: any) => {
          if (response.code === 200) {
            res = response;
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
