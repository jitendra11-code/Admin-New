import { applyMiddleware, compose } from "redux";
import { legacy_createStore as createStore } from 'redux'
import thunk from "redux-thunk";
import reducers from "../reducers";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { composeWithDevTools } from 'redux-devtools-extension';
const createBrowserHistory = require("history").createBrowserHistory;
const history = createBrowserHistory({basename : "/admin-erp-fe"});

const persistConfig = {
  key: "root",
  debug: true,
  storage,
  whitelist: ['menu', 'user'],
}
const persistedReducer = persistReducer(persistConfig, reducers)
const enhancers: any[] = [];

let store = createStore(
  persistedReducer,
  applyMiddleware(thunk),
)
export type AppState = ReturnType<typeof reducers>;

export { history, store };
