const dayjs = require("dayjs");
// server.js
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const isAuthorized = (req) => {
  return (
    req.headers.authorization ===
    "Bearer OXBiogjCfdKb7m9CEOPhpbjjv0n5OtfltzgMJbSxbP7jVFY8XUNzHqkGidDumQSR"
  );
};

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use("/login", (req, res, next) => {
  const { account, password } = req.body;
  if (req.method === "POST" && account == "NCKU" && password == "test") {
    res.status(200).jsonp({
      id: "03f87a5a-a4e6-4536-ba6c-265c03ebd317",
      bearer:
        "OXBiogjCfdKb7m9CEOPhpbjjv0n5OtfltzgMJbSxbP7jVFY8XUNzHqkGidDumQSR",
    });
  }
});
server.use("/DR_bid", (req, res, next) => {
  if (req.method === "POST") {
    const neededArgs = ["start_time", "end_time", "volume", "price"];
    const pass = neededArgs.every((key) => Object.keys(req.body).includes(key));
    res.status(pass ? 200 : 500).send(pass ? "OK" : "Failed");
  } else {
    const neededArgs = ["start_time", "end_time"];
    const checkKeys = neededArgs.every((key) =>
      Object.keys(req.query).includes(key)
    );
    const allDates = Object.values(req.query);
    const reducer = (result, dateStr) => {
      const check =
        dayjs(dateStr, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss") ===
        dateStr;
      return result && check;
    };
    const checkDates = allDates.reduce(reducer, true);
    const pass = checkKeys && checkDates;
    console.log(
      `pass:${pass} checkKeys: ${checkKeys} checkDates: ${checkDates}`
    );
    req.query = {};
    pass ? next() : res.status(500).send("Failed. Check Args.");
  }
});
server.use((req, res, next) => {
  if (isAuthorized(req)) {
    // add your authorization logic here
    next(); // continue to JSON Server router
  } else {
    res.sendStatus(401);
  }
});

server.use(router);
server.listen(3000, () => {
  console.log("JSON Server is running");
});
