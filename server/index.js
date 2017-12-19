var express = require("express");
var http = require("http");
var app = express();
var State = require('./transform');

const startTournements = require('./tournements')
const state = State(startTournements)

app.all("*", function(request, response, next) {
  response.writeHead(200, { "Content-Type": "json" });
  next();
});

app.get("/add/:tid", function(request, response) {
  const tid = request.params.tid
  state.challongeAdd(tid)
});

app.get("/tournements", function(request,response) {
  response.end(JSON.stringify(state.tournements))
})

app.get("/players", function(request,response) {
  const players = state.getPlayersTotals()
  response.end(JSON.stringify(players))
})

app.get("/players/:tag", function(request,response) {
  const player = state.getPlayer(request.params.tag)
  response.end(JSON.stringify(player))
})

app.get("*", function(request, response) {
  console.log(request.params)
  response.end("404!");
});

http.createServer(app).listen(1337);
console.log("Server Started")
console.log("Server listening on port: 1337")
