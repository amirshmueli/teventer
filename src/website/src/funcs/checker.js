function urlBuilder(dict) {
  let params = [];
  for (let key in dict) {
    params.push(String(key) + "=" + String(dict[key]));
  }
  return params.join("&");
}

console.log(
  urlBuilder({
    amir: "shmueli",
    age: 18,
    data: "asdas",
  })
);
