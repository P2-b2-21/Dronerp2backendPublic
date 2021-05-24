const http = require("http");
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const mssql = require("mssql");
const { resolveSoa } = require("dns");
// All necessary middleware/libraries loaded for use of backend */  

// Initializing express as "app" for use  
const app = express();
app.use(express.json());
app.use(cors());

// "app" is listening on port 3000 
const port = process.env.PORT || 3000; 

//MSMSSQL config (remove for public git) 
const dbConfig = {
  server: "server.malthelarsen.dk",
  port: 1433,
  user: "sw2",
  password: "b221",
  database: "nodejsdatabasa",
};

//SQL connection for database use 
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
    console.log("Failed to open a connection to the database." + err); // If connection is unsuccesfull, print error 
  });

//Register route (POST) - First encrypts password, then INSERT into SQL database, then console.log user + pass if correct
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

//Login route (POST) - Tries to look up username + password from SQL database, if found "status 201 login ok" otherwise "status 500 login denied" 
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

//Getuserprofile route (GET) - Loads user profile information if SELECT * matches username. 
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

//GRC Route (POST) - Switch case to find correct SAIL from ARC+GRC scores + insert values into SQL database
app.post("/ARCGRC", function (req, res) {
  console.log(`POST:/ARCGRC: <grc:${req.body.grc}, arc:${req.body.arc}>`);

  let SAILRes = 0;
  switch (req.body.arc) {
    case "ARC-a":
      SAILRes = calculateSail(3, req.body.grc <= 2 ? 1 : req.body.grc);
      break;
    case "ARC-b":
      SAILRes = calculateSail(2, req.body.grc <= 2 ? 1 : req.body.grc);
      break;
    case "ARC-c":
      SAILRes = calculateSail(1, req.body.grc <= 2 ? 1 : req.body.grc);
      break;
    case "ARC-d":
      SAILRes = calculateSail(0, req.body.grc <= 2 ? 1 : req.body.grc);
      break;
    default:
      break;
  }

  let newObj = {
    SAIL: SAILRes,
    ARC: req.body.arc,
    GRC: req.body.grc,
    user: req.body.user,
  };
  console.log(`new SAILRes: <${SAILRes}>`);

  mssql_req = new mssql.Request();
  mssql_req
    .query(
      `INSERT INTO dbo.ansoegninger (SAIL, ARC, GRC, username) OUTPUT Inserted.UID VALUES(${newObj.SAIL}, '${newObj.ARC}', ${newObj.GRC}, '${newObj.user}')`
    )
    .then((recordset) => {
      console.log(recordset.recordset[0]);
      res.status(200).send(JSON.stringify(recordset.recordset[0]));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error" + err);
    });
});

function calculateSail(ARC, GRC) {
  let SAILMatrix = [
    [6, 6, 6, 6, 6, 6],
    [4, 4, 4, 4, 5, 6],
    [2, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
  ];
  return SAILMatrix[ARC][GRC - 1];
}

//prevForms route (GET) - For loading previous filled applications from users. 
app.get("/prevForms", (req, res) => {
  const username = req.query.user;
  console.log(`Requesting previous forms by user: <${username}>`);

  const request = new mssql.Request();

  request
    .query(
      `
    SELECT uid
    FROM dbo.ansoegninger
    WHERE username = '${username}'
  `
    )
    .then((sqlres) => {
      console.log(`Previous forms from user: <${username}>`);
      console.table(sqlres.recordset);
      res.status(200).send(JSON.stringify(sqlres.recordset));
    });
});

//SAIL Route (GET) 
app.get("/sail", function (req, res) {
  let uid = req.query.uid;
  console.log("UID: " + uid);

  let request = new mssql.Request();

  request
    .query(`SELECT SAIL from dbo.ansoegninger WHERE uid = '${uid}'`)
    .then((response) => {
      console.log(response.recordset[0]);
      res.status(200).send(JSON.stringify(response.recordset[0]));
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});
