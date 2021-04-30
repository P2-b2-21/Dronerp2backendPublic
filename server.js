const http = require("http");
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const mssql = require("mssql");
//const cookieParser = require('cookie-parser'); /*     Til cookies */

const app = express();
app.use(express.json());
app.use(cors());
//app.use(cookieParser()); // Til cookies

const port = process.env.PORT || 3000;

/* TEST OM DET VIRKER - COOKIES 
// Cookie middleware, assigner cookie ID så snart du besøger siden 
app.use(function (req, res, next) {
  // checker om klienten har sendt en cookie
  var cookie = req.cookies.cookieName;
  if (cookie === undefined) {
    // hvis ikke, laver ny cookie her 
    var randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    res.cookie('cookieName',randomNumber, { maxAge: 3360 * 60 * 60 * 1000, httpOnly: true }); // Cookies udløber om 20 uger, d. 16 September
    console.log('cookie created successfully');
  } else {
    // hvis cookie er oprettet hos klient, gør intet  
    console.log('cookie exists', cookie);
  } 
  next(); 
});
*/ 

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

  let SAILRes = 0;
  switch (req.body.arc) {
    case 'ARC-a':
      SAILRes = calculateSail(0, req.body.grc <= 2 ? 1 : req.body.grc);
      break;
    case 'ARC-b':
      SAILRes = calculateSail(1, req.body.grc <= 2 ? 1 : req.body.grc);
      break;
    case 'ARC-c':
      SAILRes = calculateSail(2, req.body.grc <= 2 ? 1 : req.body.grc);
      break;
    case 'ARC-d':
      SAILRes = calculateSail(3, req.body.grc <= 2 ? 1 : req.body.grc);
      break;
    default:
      break;
  }

  let newObj =
  {
    SAIL: SAILRes,
    ARC: req.body.arc,
    GRC: req.body.grc,
    user: req.body.user
  }

  GRCArray.push();
  console.log(SAILRes);

  mssql_req = new mssql.Request();
  mssql_req.query(`INSERT INTO dbo.ansoegninger (SAIL, ARC, GRC, username) OUTPUT Inserted.UID VALUES(${newObj.SAIL}, '${newObj.ARC}', ${newObj.GRC}, '${newObj.user}')`)
  .then(recordset => {
    console.log(recordset.recordset[0]);
    res.status(200).send(JSON.stringify(recordset.recordset[0]));
  }).catch(err => {
    console.log(err)
    res.status(500).send("Error" + err);
  });

  
});

function calculateSail(ARC, GRC) {
  let SAILMatrix =
  [
    [6, 6, 6, 6, 6, 6],
    [4, 4, 4, 4, 5, 6],
    [2, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
  ];
  return SAILMatrix[ARC][GRC-1];
}


app.get("/sail", function(req, res) {
  let uid = req.query.uid;
  console.log("UID: " + uid);

  let request = new mssql.Request();


  request.query(`SELECT * from dbo.ansoegninger WHERE UID = '${uid}'`)
  .then(response => {
    console.log(response.recordset[0])
    res.status(200).send(JSON.stringify(response.recordset[0]))
  })
  .catch(err => {res.status(500).send(err)})
})