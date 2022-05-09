import { createStore } from "redux";
import * as ActionTypes from "./actionTypes";

const initial_state = {
  token: "",
  user: {
    username: "amirshmueli",
    password: "1234",
  },
  tickets: {
    current: "",
    capacity: "",
  },
  event: {
    title: "",
    eventId: "",
  },
  font: false,
  delay_interval: 2.5,
};

function reducer(state = initial_state, action) {
  switch (action.type) {
    case ActionTypes.setUsername:
      return {
        ...state,
        user: {
          ...state.user,
          username: action.payload,
        },
      };
    case ActionTypes.setPassword:
      return {
        ...state,
        user: {
          ...state.user,
          password: action.payload,
        },
      };
    case ActionTypes.setCredentials:
      return {
        ...state,
        user: { ...action.payload },
      };
    case ActionTypes.setEventData:
      return {
        ...state,
        event: action.payload,
      };
    case ActionTypes.setTicketsCapacity:
      return {
        ...state,
        tickets: {
          ...state.tickets,
          capacity: action.payload,
        },
      };
    case ActionTypes.setTicketsCurrent:
      let a = Math.max(action.payload, 0);
      return {
        ...state,
        tickets: {
          ...state.tickets,
          current: a,
        },
      };
    case ActionTypes.setToken:
      return {
        ...state,
        token: action.payload,
      };
    case ActionTypes.setTickets:
      return {
        ...state,
        tickets: action.payload,
      };
    case ActionTypes.setInterval:
      return {
        ...state,
        delay_interval: action.payload,
      };
    case ActionTypes.setDynamicTickets:
      return {
        ...state,
        tickets: {
          ...state.tickets,
          current: state.tickets.current + action.payload,
        },
      };
    default:
      console.log("uknown command: [" + action.type + "]");
      return state;
  }
}

const store = createStore(reducer);
export default store;
