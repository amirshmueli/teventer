const ROOT = "https://a9d7-217-138-192-101.eu.ngrok.io/";
const API = ROOT + "api/";
//const TICKET_CHECKIN = `${ROOT}/tickets/check-in/`;
import * as ActionTypes from "./store/actionTypes";

async function r_get_data(URL) {
  const timeout = 5000;
  console.log(`>>> ${URL[0]} ${URL[1]} ${URL[2] ? URL[2] : ""}`);
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(URL[1], {
    method: URL[0],
    body: URL[2] ? JSON.stringify(URL[2]) : null,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}

async function get_data(URL) {
  try {
    const req = await r_get_data(URL);
    const json = await req.json();
    //console.log(json);

    if (json["error"]) return [null, "Token Error"];
    return [json, null];
  } catch (error) {
    console.log(`\t GOT ERROR: ${error.message}`);
    return [null, "Connection Error"];
  }
}

function build_query(URL, query) {
  if (query == null) {
    return URL;
  }
  URL += "?";
  for (const [key, value] of Object.entries(object)) {
    URL += `${key}=${value}&`;
  }
  return URL;
}
// gets username and password
// returns an error or a token
export async function get_token(userID, password) {
  const url = ["GET", `${ROOT}login?username=${userID}&password=${password}`];
  console.log(`\n>>> Requesting Token For 🔑 ${userID} | ${password}`);
  return await get_data(url);
}

export async function get_events(userID, token) {
  const url = ["GET", `${API}events/${userID}?token=${token}`];
  console.log(`>>> Requesting Events For 🔥 ${userID}`);
  return await get_data(url);
}

export async function get_stats(userID, token, eventID) {
  return null;
  const url = [
    "GET",
    `${API}/events/stats/${userID}?token=${token}&eventID=${eventID}`,
  ];
  console.log(`>>> Requesting Stats 🔢`);
  return get_data(url);
}
export async function get_total(userID, token, eventID) {
  const url = `${ROOT}TotalTickets?userId=${userID}&token=${token}&eventId=${eventID}`;
  // console.log(`>>> Requesting data 🈚`);
  return null;
}

export const getStats = async ({ user, event }, dispatch, token) => {
  console.log(">>> Requesting Stats 🙃");
  if (event.eventId == "") return;
  const { username, password } = user;
  //console.log("STATS: fetching stats...");
  let [stats, st_error] = await get_stats(username, token, event.eventId);
  let count = st_error ? 0 : stats.count;

  let [current, cr_error] = await get_total(username, token, event.eventId);
  let max = cr_error
    ? 0
    : JSON.parse(JSON.parse(current.stats).message).sales[0].totalTickets;
  dispatch({
    type: ActionTypes.setTickets,
    payload: {
      current: count,
      capacity: max,
    },
  });

  console.log(`>>> GOT STATS 🤑 ${count} / ${max}`);
};

export async function get_gstlst(
  userID,
  token,
  eventID,
  offset = 0,
  range = 1,
  state = 0,
  search = ""
) {
  let url = [
    "GET",
    `${API}tickets/${userID}?token=${token}&eventID=${eventID}&offset=${offset}&limit=${range}&status=${state}`,
  ];
  search != "" ? (url += `&search=${search}`) : null;
  console.log(`>>> Requesting Events For 🕴️ ${userID}`);
  return await get_data(url);
}

export async function scan_ticket(userID, token, eventID, ticketID) {
  const url = [
    "POST",
    `${API}check-in/${userID}?token=${token}`,
    {
      eventID: eventID,
      ticketID: ticketID,
    },
  ];
  console.log(`>>> Ticket Scan For 🎫 ${userID}`);
  return get_data(url);
}

export async function get_params(userID, token) {
  const url = `${ROOT}params?userId=${userID}&token=${token}`;
  console.log(`>>> Requesting params 📉`);
  return get_data(url);
}

export function parseUrl(urlStr) {
  //https://www.wixevents.com/check-in/G2OH-CH59-MY021,a499860c-fb2e-4662-96f3-ba02d24364a2
  console.log(urlStr);
  if (0 > String(urlStr).indexOf(TICKET_CHECKIN)) {
    return { status: "error", message: "wrong ticket" };
  }
  let prms = urlStr.replace(TICKET_CHECKIN, "").split(",");
  let ticket = prms[0];
  let eventId = prms[1];
  return { status: "valid", url: [ticket, eventId] };
}

export async function remove_ticket(userID, token, eventID, ticketID) {
  const url = [
    "POST",
    `${API}check-out/${userID}?token=${token}`,
    {
      eventID: eventID,
      ticketID: ticketID,
    },
  ];
  console.log(`>>> Ticket Remove For 🎟️ ${userID}`);
  return get_data(url);
}
