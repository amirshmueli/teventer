import { createContext } from "react";
import { createStore } from "redux";
const Store = createContext();

export const StoreActions = {
  setUsername: "setUsername",
  setToken: "setToken",
  setEvent: "setEvent",
  setXT: "setXT",
};

const initalReduxState = {
  username: "",
  token: "",
  event: "",
  tokenExpiresAt: "",
};

const AppStoreReducer = (state = initalReduxState, action) => {
  console.log(`Redux Logger: ${action.type} with ${action.payload}`);
  const { type, payload } = action;
  switch (type) {
    case StoreActions.setUsername:
      return { ...state, username: payload };
    case StoreActions.setToken:
      return { ...state, token: payload };
    case StoreActions.setEvent: {
      return { ...state, event: payload };
    }
    case StoreActions.setXT: {
      return { ...state, tokenExpiresAt: payload };
    }
    default:
      console.log(`unkown redux command: [${type}]`);
      return state;
  }
};

export const AppStore = createStore(AppStoreReducer);

export default Store;
