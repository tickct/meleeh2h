module.exports = (app,state) => {

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
}
