const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const ejs = require("ejs");
const https = require("https");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", function (req, res) {
  // res.sendFile(__dirname + "/index.html");
  res.render("index", { show: false });
});

app.post("/", function (req, res) {
  const query = req.body.cityName;
  const apikey = "d0d63469c7738d9ab6b690d59c84d697";
  const unit = "metric";
  const url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    query +
    "&appid=" +
    apikey +
    "&units=" +
    unit;
  https.get(url, function (respond) {
    console.log(respond.statusCode);
    let body = [];
    const getdata = (next) => {
      respond.on("data", function (data) {
        const weatherData = JSON.parse(data);
        if (weatherData.message === "city not found"){
          return res.render("error")
        }
        const temp = weatherData.main.temp;
        const desc = weatherData.weather[0].description;
        const icon = weatherData.weather[0].icon;
        const imgURL = "http://openweathermap.org/img/wn/"+icon+"@2x.png";
        body.push(temp);
        body.push(desc);
        body.push(imgURL);
        next(body);
      });
    };
    getdata((body) => {
      return respond.on("end", () => {
        ejs.renderFile(
          __dirname + "/views/index.ejs",
          {
            show: true,
            city: query,
            temperature: body[0],
            description: body[1],
            imageUrl: body[2],
          },
          (err, str) => {
            if (err) {
              console.log(err);
            } else {
              res.render("index", {
                show: true,
                city: query,
                temperature: body[0],
                description: body[1],
                imageUrl: body[2],
              });
            }
          }
        );
      });
    });
  });
});

app.listen( process.env.PORT || 3000, function () {
  console.log("Server is Running");
});
