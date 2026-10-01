import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FETCH_CATEGORIES_LIST_THUNK } from "../actions/categoriesAction";
import createAsyncReducer from "./AsyncReducer";

interface ContactState {
    categoriesList: Record<string, any>;
    supportReportList: Record<string, any>;
    isLoading: boolean;
    isLoadMore: boolean;
    isRefreshing: boolean;
}

const initialState: ContactState = {
    categoriesList: {},
    supportReportList: {},
    isLoading: true,
    isLoadMore: false,
    isRefreshing: false,
};

const contactSlice = createSlice({
    name: "categories",
    initialState,
    reducers: {
        LOAD_CONTACT_LIST: (state, action: PayloadAction<any>) => {
            const { isLoading = false, isLoadMore = false, isRefreshing = false } = action.payload || {};
            return {
                ...state,
                isLoading,
                isLoadMore,
                isRefreshing
            };
        },
        GET_SUPPORT_REPORT_LIST: (state, action: PayloadAction<any>) => {
            const { supportReportList, isLoadMore } = state;
            const { items, pagination } = action.payload;
            let currentList = { ...supportReportList };
            currentList.list = isLoadMore ? [...supportReportList.list, ...items] : items;
            currentList.pagination = pagination;
            return {
                ...state,
                supportReportList: currentList,
                isLoading: false,
                isLoadMore: false,
                isRefreshing: false,
            };
        },
        GET_SUPPORT_REPORT_CATEGORIES_LIST: (state, action: PayloadAction<any>) => {
            return {
                ...state,
                categoriesList: action.payload,
                isLoading: false,
                isRefreshing: false,
                isLoadMore: false,
            };
        },
        CLEAR_CONTACT_LIST(state, action: PayloadAction<keyof typeof initialState>) {
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
        RESET_CATEGORIES_FILTER_STATE: () => initialState,
    },
    extraReducers: (builder) => {
        createAsyncReducer(FETCH_CATEGORIES_LIST_THUNK, "categoriesList")(builder);
    }
});

export const { LOAD_CONTACT_LIST, GET_SUPPORT_REPORT_LIST, GET_SUPPORT_REPORT_CATEGORIES_LIST, CLEAR_CONTACT_LIST, RESET_CATEGORIES_FILTER_STATE } = contactSlice.actions;
export default contactSlice.reducer;
