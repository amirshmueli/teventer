export function ParseDate(date, options) {
  return new Date(date).toLocaleString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    minute: "2-digit",
    hour: "2-digit",
  });
}
