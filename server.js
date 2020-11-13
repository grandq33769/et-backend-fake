// server.js
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const isAuthorized = (req) => {
  console.log(req.headers);
  return req.headers.authorization === 'Bearer OXBiogjCfdKb7m9CEOPhpbjjv0n5OtfltzgMJbSxbP7jVFY8XUNzHqkGidDumQSR';
};

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use("/login", function (req, res, next) {
  const { account, password } = req.body;
  if (req.method === "POST" && account == "NCKU" && password == "test") {
    res.status(200).jsonp({
      id: "03f87a5a-a4e6-4536-ba6c-265c03ebd317",
      bearer:
        "OXBiogjCfdKb7m9CEOPhpbjjv0n5OtfltzgMJbSxbP7jVFY8XUNzHqkGidDumQSR",
    });
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
