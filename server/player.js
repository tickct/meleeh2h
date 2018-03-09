const {
  normalizeTag
} = require('./utils/utils');

const {
  getID,
  getTag,
  getPlace
} = require('./utils/pluckers');

function Player(){
  this.tag = ''
  this.id = 0
  this.place = 0
  this.wins = []
  this.losses = []

  function addTag(tag){
    this.tag = tag;
  }
  function addWin(winID){
    this.wins = [...this.wins,winID]
  }
  function addLoss(loseID){
    this.losses = [...this.losses,loseID]
  }
  return {
    tag:this.tag,
    id:this.id,
    place:this.place,
    wins:this.wins,
    losses:this.losses,
    addTag,
    addWin,
    addLoss
  }
}

const challongePlayertoPlayer = (player) => {
  const newPlayer = new Player();
  newPlayer.addTag(normalizeTag(getTag(player)));
  newPlayer.id = getID(player);
  newPlayer.place = getPlace(player);
  return newPlayer
}

const overallPlayer = (tag,wins,losses) => {
  const newPlayer = new Player();
  newPlayer.addTag(tag)
  newPlayer.wins = wins;
  newPlayer.losses = losses
  return newPlayer
}
module.exports = {
  Player,
  challongePlayertoPlayer,
  overallPlayer
}
