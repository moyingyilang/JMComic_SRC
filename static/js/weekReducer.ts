import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FETCH_WEEK_FILTER_THUNK, FETCH_WEEK_THUNK } from "../actions/weekAction";
import createAsyncReducer from "./AsyncReducer";

interface WeekState {
  list: Record<string, any>;
  weekList: Record<string, any>;
  weekFilterList: { list: any[]; total: number; };
  isLoading: boolean;
  isLoadMore: boolean;
  isRefreshing: boolean;
}

const initialState: WeekState = {
  list: {},
  weekList: {},
  weekFilterList: { list: [], total: 0 },
  isLoading: true,
  isLoadMore: false,
  isRefreshing: false,
};

const weekSlice = createSlice({
  name: "week",
  initialState,
  reducers: {
    LOAD_WEEK_LIST: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        isLoading: action.payload.isLoading,
        isLoadMore: action.payload.isLoadMore,
        isRefreshing: action.payload.isRefreshing,
      };
    },
    GET_WEEK_LIST: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        weekList: action.payload,
        isLoading: false,
      };
    },
    GET_WEEK_FILTER_LIST: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        weekFilterList: action.payload,
        total: action.payload.total,
        isLoading: false,
      };
    },
    CLEAR_WEEK_LIST(state, action: PayloadAction<keyof typeof initialState>) {
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
  },
  extraReducers: (builder) => {
    createAsyncReducer(FETCH_WEEK_THUNK, "weekList")(builder);
    createAsyncReducer(FETCH_WEEK_FILTER_THUNK, "weekFilterList")(builder);
  }
});

export const { LOAD_WEEK_LIST, GET_WEEK_LIST, GET_WEEK_FILTER_LIST, CLEAR_WEEK_LIST } = weekSlice.actions;
export default weekSlice.reducer;
