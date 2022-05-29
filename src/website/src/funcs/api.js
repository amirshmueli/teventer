export const PROXY = "127.0.0.1:443";
export const API = PROXY + "/api";
export const GENERAL = PROXY + "/gen";
export const TIMEOUT = 5000;

export const errors = {
  token_error: "token_error",
  connection_error: "connection_error",
  general_error: "general_error",
};

const TIMES = 3;

export async function MakeFetch({ method, url, body }, times = TIMES) {
  if (!method) method = "GET";
  console.log(`MAKE FETCH ON ${method}:${url}`);
  for (let i = 0; i < times; i++) {
    const res = await requestTimeout({ method, url, body });
    if (res[1] !== errors.connection_error) return res;
  }
}

async function requestTimeout({ method, url, body }) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);

  const response = await fetch(url, {
    method: method,
    body: body,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}

export async function get(url) {
  return await MakeFetch({ method: "POST", url: url, body: null });
}

export async function post(url, body) {
  return await MakeFetch({ method: "POST", url: url, body: body });
}

export function urlBuilder(dict) {
  let params = [];
  for (let key in dict) {
    params.push(String(key) + "=" + String(dict[key]));
  }
  return params.join("&");
}

export async function get_token(username, password) {
  const params = urlBuilder({
    username: username,
    password: password,
  });

  return await get(PROXY + `/login?` + params);
}

export async function get_events(username, token) {}

export async function post_register() {}

export async function post_admin() {}

export async function get_pagination_search() {}
