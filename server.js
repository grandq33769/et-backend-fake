const dayjs = require("dayjs");
// server.js
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const dateReducer = (result, dateStr) => {
  const check =
    dayjs(dateStr, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss") ===
    dateStr;
  return result && check;
};
const checkDateArgs = (req, res, next) => {
  const neededArgs = ["start_time", "end_time"];
  const checkKeys = neededArgs.every((key) =>
    Object.keys(req.query).includes(key)
  );
  const allDates = Object.values(req.query);
  const checkDates = allDates.reduce(dateReducer, true);
  const pass = checkKeys && checkDates;
  console.log(`pass:${pass} checkKeys: ${checkKeys} checkDates: ${checkDates}`);
  req.query = {};
  pass ? next() : res.status(400).send("Failed. Check Args.");
};

const isAuthorized = (req) => {
  let result = { auth: false, role: "" };
  if (
    req.headers.authorization ===
    "Bearer OXBiogjCfdKb7m9CEOPhpbjjv0n5OtfltzgMJbSxbP7jVFY8XUNzHqkGidDumQSR"
  ) {
    result = { auth: true, role: "aggregator" };
  } else if (
    req.headers.authorization ===
    "Bearer 3S6t0TGMPhm7cJeVaHbBB7HkAQEVAyBcYtVAKDm0pdBiHOscrcNI1CcjkerRLSlA"
  ) {
    result = { auth: true, role: "user" };
  }
  return result;
};

const getRole = (token) => {
  let role = "";
  if (
    token ===
    "Bearer OXBiogjCfdKb7m9CEOPhpbjjv0n5OtfltzgMJbSxbP7jVFY8XUNzHqkGidDumQSR"
  ) {
    role = "aggregator";
  } else if (
    token ===
    "Bearer 3S6t0TGMPhm7cJeVaHbBB7HkAQEVAyBcYtVAKDm0pdBiHOscrcNI1CcjkerRLSlA"
  ) {
    role = "user";
  }
  return role;
};

const checkAttribute = (body, attributes) => {
  return attributes.every((key) => Object.keys(body).includes(key));
};

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use("/login", (req, res, next) => {
  const { account, password } = req.body;
  let token = {};
  if (req.method === "POST") {
    if (account === "NCKU" && password === "test") {
      token = {
        id: "03f87a5a-a4e6-4536-ba6c-265c03ebd317",
        bearer:
          "OXBiogjCfdKb7m9CEOPhpbjjv0n5OtfltzgMJbSxbP7jVFY8XUNzHqkGidDumQSR",
      };
    } else if (account === "Carlab_BEMS" && password === "test") {
      token = {
        id: "3b816117-b8e4-4635-9061-9b9dbb3ec96d",
        bearer:
          "3S6t0TGMPhm7cJeVaHbBB7HkAQEVAyBcYtVAKDm0pdBiHOscrcNI1CcjkerRLSlA",
      };
      return res.status(200).jsonp(token);
    }
  }

  token === {}
    ? res.status(401).send("Auth Failed")
    : res.status(200).jsonp(token);
});

server.use("/DR_bid", (req, res, next) => {
  if (req.method === "POST") {
    let pass = false;
    let neededArgs = [];
    let role = getRole(req.headers.authorization);
    if (role === "user") {
      neededArgs = ["volume", "price"];
      try {
        pass = checkAttribute(req.body, neededArgs);
      } catch (err) {
        pass = false;
      }
    } else if (role === "aggregator") {
      neededArgs = ["uuid", "start_time", "end_time"];
      const checkListReducer = (result, bid) => {
        const check = checkAttribute(bid, neededArgs);
        return result && check;
      };
      try {
        pass = req.body.reduce(checkListReducer, true);
      } catch (err) {
        pass = false;
      }
    }

    res.status(pass ? 200 : 400).send(pass ? "OK" : "Failed");
  } else {
    checkDateArgs(req, res, next);
  }
});
server.use("/DR_result", (req, res, next) => {
  if (req.method === "GET") {
    checkDateArgs(req, res, next);
  } else {
    res.status(500).send("Failed");
  }
});
server.use((req, res, next) => {
  let auth = isAuthorized(req);
  if (auth.auth) {
    // add your authorization logic here
    req.body.role = auth.role;
    next(); // continue to JSON Server router
  } else {
    res.sendStatus(401);
  }
});

server.use(router);
server.listen(3000, () => {
  console.log("JSON Server is running");
});
