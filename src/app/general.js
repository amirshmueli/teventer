let a = {
  result: {
    status: 200,
    message: {
      guest: "Amir Shmueli",
      res: {
        tickets: [
          {
            name: "GOLD",
          },
          2,
        ],
      },
    },
  },
};

console.log(a.result.message.res.tickets[0].name);
//console.log(JSON.parse(a.message.res).tickets[0].name);
