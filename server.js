const http = require("http");
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mssql = require("mssql");

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

//MSMSSQL config
const dbConfig = {
  server: "server.malthelarsen.dk",
  port: 1433,
  user: "sw2",
  password: "b221",
  database: "nodejsdatabasa",
};

//SQL connection
mssql
  .connect(dbConfig)
  .then((pool) => {
    if (pool.connecting) {
      console.log("Connecting to the database.");
    }
    if (pool.connected) {
      app.listen(port, () => {
        console.log("Server listening at port %d", port);
        var mssql_request = new mssql.Request();
        mssql_request
          .query("select * from dbo.usertable")
          .then(function (dataset) {
            if (dataset && dataset.recordset && dataset.recordset.length > 0) {
              dataset.recordset.forEach((element) => {
                console.log(element);
              });
            }
          });
      });
    }
    return pool;
  })
  .catch(function (err) {
    console.log("Failed to open a connection to the database." + err);
  });

//Register route (POST)
app.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    var newUser = {
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, salt),
    };

    var mssql_req = new mssql.Request();
    mssql_req
      .query(
        "INSERT INTO dbo.usertable(username, password) VALUES('" +
          newUser.username +
          "','" +
          newUser.password +
          "')"
      )
      .then(function (dataset) {
        if (dataset.rowsAffected > 0) {
          console.log(
            "Successfully created new user: " +
              newUser.username +
              " with password " +
              req.body.password
          );
          res.status(201).send();
        }
      })
      .catch((e) => console.log(e));
  } catch {
    res.status(500).send();
  }
});

//Login route (POST)
app.post("/login", async (req, res) => {
  console.log("Login request began");

  req.accepts("application/json");

  let user = {
    username: req.body.username,
    password: req.body.password,
  };

  mssql
    .query(
      "SELECT password from dbo.usertable where username='" +
        user.username +
        "'"
    )
    .then(function (dataset) {
      if (dataset && dataset.recordset) {
        const tablePass = dataset.recordset[0].password;

        console.log("TablePass: " + tablePass);
        console.log("User password: " + user.password);

        bcrypt.compare(user.password, tablePass, (e, s) => {
          console.log("Error: " + e);
          console.log("Compare bool: " + s);
          if (s) {
            console.log("Login ok");
            res.status(201).send();
          } else {
            console.log("Login denied");
            res.status(500).send();
          }
        });
      }
    })
    .catch((e) => console.log(e));
});

//Getuserprofile route (GET)
app.get("/getuserprofile", async (req, res) => {
  let user = req.query.user;
  console.log("Get user profile requested for user: " + user);

  mssql
    .query("SELECT * from dbo.usertable where username='" + user + "'")
    .then(function (dataset) {
      if (dataset.recordset) {
        let responseJson = JSON.stringify(dataset.recordset[0]);
        console.log(responseJson);
        res.status(200).send(responseJson);
      }
    })
    .catch((e) => {
      console.log("Error: " + e);
    });
});

//GRC Route (POST)
let GRCArray = [];
let ARCArray = [];
app.post("/ARCGRC", function (req, res) {
  console.log(req.body);

  switch (req.body.arc) {
    case value:
      
      break;
  
    default:
      break;
  }

  GRCArray.push(req.body);
  res.status(200).send("GRC tilføjet!");
});

function calculateSail(ARC, GRC) {
  let SAILMatrix = [
    [6, 6, 6, 6, 6, 6],
    [4, 4, 4, 4, 5, 6],
    [2, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
  ];
  return SAILMatrix[ARC][GRC];
}
let SAIL = calculateSail(1, GRCArray[0]);
console.log(SAIL);
