const http = require("http");
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

const mssql = require("mssql");

const dbConfig = {
  server: "server.malthelarsen.dk",
  port: 1433,
  user: "sw2",
  password: "b221",
  database: "nodejsdatabasa",
};

mssql
  .connect(dbConfig)
  .then((pool) =>
  {
    if (pool.connecting)
    {
      console.log("Connecting to the database.");
    }
    if (pool.connected)
    {
      app.listen(port, () =>
      {
        console.log("Server listening at port %d", port);
        var mssql_request = new mssql.Request();
        mssql_request
          .query("select * from dbo.usertable")
          .then(function (dataset)
          {
            if (dataset && dataset.recordset && dataset.recordset.length > 0)
            {
              dataset.recordset.forEach((element) =>
              {
                console.log(element);
              });
            }
          });
      });
    }
    return pool;
  })
  .catch(function (err)
  {
    console.log("Failed to open a connection to the database." + err);
  });

app.post("/register", async (req, res) =>
{
  try
  {
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
      .then(function (dataset)
      {
        if (dataset.rowsAffected > 0)
        {
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

app.post("/login", async (req, res) =>
{
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
    .then(function (dataset)
    {
      if (dataset && dataset.recordset)
      {
        const tablePass = dataset.recordset[0].password;

        console.log("TablePass: " + tablePass);
        console.log("User password: " + user.password);

        bcrypt.compare(user.password, tablePass, (e, s) =>
        {
          console.log("Error: " + e);
          console.log("Compare bool: " + s);
          if (s)
          {
            console.log("Login ok");
            res.status(201).send();
          } else
          {
            console.log("Login denied");
            res.status(500).send();
          }
        });
      }
    })
    .catch((e) => console.log(e));
});

app.get("/getuserprofile", async (req, res) =>
{
  let user = req.query.user;
  console.log("Get user profile requested for user: " + user);

  mssql
    .query("SELECT * from dbo.usertable where username='" + user + "'")
    .then(function (dataset)
    {
      if (dataset.recordset)
      {
        let responseJson = JSON.stringify(dataset.recordset[0]);
        console.log(responseJson);
        res.status(200).send(responseJson);
      }
    })
    .catch((e) =>
    {
      console.log("Error: " + e);
    });
});

/* do not use this calcGRC 

app.post("/calcgrc", async (req, res) =>
{
  //console.log(req.body);

  let dronelength = req.body.question1.userInput;
  let lostype = req.body.question2.userInput;
  let flyingarea = req.body.question3.userInput;
  let droneanchor = req.body.question4.userInput;
  let robustness = req.body.question5.userInput;
  let parachute = req.body.question6.userInput;

  let erp = req.body.question7.userInput;


  let intrinsicGRC = 0;

  switch (dronelength)
  {
    case A1:
      switch (lostype)
      {
        case A2: //VLOS
          break;
        case B2: //EVLOS
          break;
        case C2: //BVLOS
          break;
      }

      break;
    case B1:
      break;
    case C1:
      break;
    case D1:
      break;
    default:
      res.sendStatus(500);
      break;
  }
});
 */ 

/* 
app.get("/SAIL", async (req, res) =>
{
  console.log("Sending SAIL");

}); */

var GRCArray = [];
var ARCArray = [];

app.post('/GRC', function (req, res) {
  var GRC = req.body;
  console.log(GRC);
  GRCArray.push(GRC);
  res.status(200).send("GRC tilføjet!");
});