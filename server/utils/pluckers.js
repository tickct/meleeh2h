const {
  pluck
} = require('./utils');

const getTournementName = pluck('name');
const getID = pluck('participant','id');
const getTag = pluck('participant','name');
const getPlace = pluck('participant','final_rank');
const getWinner = pluck('match','winner_id');
const getLoser = pluck('match','loser_id');

module.exports = {
  getTournementName,
  getID,
  getTag,
  getPlace,
  getWinner,
  getLoser
}
