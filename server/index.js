var express = require("express");
var http = require("http");
var cors = require('cors')
var app = express();

app.options('*', cors())
app.use(cors({origin:true,credentials: true}));

var State = require('./transform');

const startTournements = require('./testTournements')
const state = State(startTournements)

require('./routes/routes')(app,state);

http.createServer(app).listen(1337);
console.log("Server Started")
console.log("Server listening on port: 1337")
