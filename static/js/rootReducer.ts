import { combineReducers } from "redux";
import blogsReducer from "../reducers/blogsReducer";
import categoriesReducer from "../reducers/categoriesReducer";
import contactReducer from "../reducers/contactReducer";
import creatorReducer from "../reducers/creatorReducer";
import detailReducer from "../reducers/detailReducer";
import forumReducer from "../reducers/forumReducer";
import gamesReducer from "../reducers/gamesReducer";
import hotUpdateReducer from "../reducers/hotUpdateReducer";
import mainReducer from "../reducers/mainReducer";
import memberReducer from "../reducers/memberReducer";
import moviesPlayerReducer from "../reducers/moviesPlayerReducer";
import moviesReducer from "../reducers/moviesReducer";
import novelReducer from "../reducers/novelReducer";
import searchReducer from "../reducers/searchReducer";
import settingsReducer from "../reducers/settingsReducer";
import weekReducer from "../reducers/weekReducer";


const rootReducer = combineReducers({
  hotUpdate: hotUpdateReducer,
  settings: settingsReducer,
  main: mainReducer,
  detail: detailReducer,
  forum: forumReducer,
  search: searchReducer,
  week: weekReducer,
  blogs: blogsReducer,
  creator: creatorReducer,
  categories: categoriesReducer,
  member: memberReducer,
  games: gamesReducer,
  movies: moviesReducer,
  MoviesPlayer: moviesPlayerReducer,
  novel: novelReducer,
  contact: contactReducer,
});

export default rootReducer;
