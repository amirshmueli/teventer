const ROOT = "https://0cd0-79-178-120-199.eu.ngrok.io/";
const API = ROOT + "api/";
//const TICKET_CHECKIN = `${ROOT}/tickets/check-in/`;
import * as ActionTypes from "./store/actionTypes";

async function r_get_data(URL) {
  const timeout = 5000;
  console.log(
    `>>> ${URL[0]} ${URL[1]} ${URL[2] ? JSON.stringify(URL[2]) : ""}`
  );
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
    console.log("\t >>> Got Answer");
    const json = await req.json();
    console.log(json);

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
  const url = [
    "GET",
    `${ROOT}gen/login?username=${userID}&password=${password}`,
  ];
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
    `${API}tickets/${userID}?token=${token}&eventID=${eventID}&offset=${offset}&limit=${range}&status=${state}&search=`,
  ];
  if (search != "") {
    url[1] += `${search}`;
  }
  console.log(`>>> Requesting Events For 🕴️ ${userID}`);
  return await get_data(url);
}

export async function scan_ticket(userID, token, eventID, ticketID) {
  if (eventID === undefined) {
    return [null, "URL error"];
  }
  const url = [
    "POST",
    `${ROOT}live/check-in/${userID}?token=${token}`,
    {
      eventID: eventID,
      ticketID: ticketID,
    },
  ];
  console.log(`>>> Ticket Scan For 🎫 ${userID}`);
  return get_data(url);
}

export async function make_scan(userID, token, data_url, eventId) {
  try {
    console.log(`GOT URL TO SCAN: ${data_url}`);
    let reg = String(data_url).split("ticket")[1].split("/");
    if (reg === null) {
      console.log("NOT FOUND");
      return await scan_ticket(userID, token);
    }
    console.log(`make scan: [${reg[1] === eventId}]`);
    if (reg[1] !== eventId) throw "URL error";

    return await scan_ticket(userID, token, reg[1], reg[2]);
  } catch {
    return [null, "URL error"];
  }
}

export async function get_params(userID, token) {
  const url = `${ROOT}params?userId=${userID}&token=${token}`;
  console.log(`>>> Requesting params 📉`);
  return get_data(url);
}

export async function remove_ticket(userID, token, eventID, ticketID) {
  const url = [
    "POST",
    `${ROOT}live/check-out/${userID}?token=${token}`,
    {
      eventID: eventID,
      ticketID: ticketID,
    },
  ];
  console.log(`>>> Ticket Remove For 🎟️ ${userID}`);
  return get_data(url);
}
