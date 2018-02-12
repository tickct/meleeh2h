var { CHALLONGE } = require('./keys');
var unirest = require('unirest');
const utils = require('./utils/utils');
console.log(utils)
const pluck = utils.pluck;
const normalizeTag = utils.normalizeTag;
const idMatched = utils.idMatched;
const getTournementName = pluck('name');
const getID = pluck('participant','id');
const getTag = pluck('participant','name');
const getPlace = pluck('participant','final_rank');
const getWinner = pluck('match','winner_id');
const getLoser = pluck('match','loser_id');

const getURL = (tournamentID) => `https://${CHALLONGE.USERNAME}:${CHALLONGE.API_KEY}@api.challonge.com/v1/tournaments/${tournamentID}`

var state = (startTournements) => {
  var tournements = {};

  const challongeAdd = (tid) => {
    const url = getURL(tid)
    addTournement(tid)
    unirest.get(url+"/participants.json")
    .send()
    .end(res=> {
      if (res.ok) {
        addPlayerNames(tid,res.body)
        unirest.get(url+"/matches.json")
        .send()
        .end(res2 => {
          if(res2.ok) {
            addMatchResults(tid,res2.body)
          } else {
            console.error("Error fetching matches: ", res.error)
          }
        })
      } else {
        console.error("Error fetching players: ", res.error.Error, url)
      }
    })
  }

  const addTournement = (tname) => {
    tournements = Object.assign(
      tournements,
      {
        [tname]:{
          players: []
        }
      })
  }

  const addPlayerNames = (tnmt,players) => {
    if(!players.length || players.length === 0){
      console.error(`Import Error: ${tnmt} has no participants`)
      return
    }
    tPlayers = tournements[tnmt].players
    tournements[tnmt].players = players.map(player => {
      const matchingPlayer = tPlayers.find((pl)=>pl.id===getID(player));
      return matchingPlayer
        ? Object.assign(
            matchingPlayer,
            {
              tag:normalizeTag(getTag(player))
            }
          )
        : {
            tag:normalizeTag(getTag(player)),
            id:getID(player),
            place:getPlace(player),
            wins:[],
            losses:[]
          };
    });
  }

  const addMatchResults = (tnmt,matches) => {
    if(!matches.length || matches.length === 0){
      console.error(`Import Error: ${tnmt} has no matches`)
      return
    }
    const rotatedResults = matches
      .reduce((acc,match) => {
        const winID = getWinner(match);
        const loseID = getLoser(match);
        acc[winID] = acc[winID]
          ? Object.assign(
              acc[winID],
              {
                wins:[...acc[winID].wins,loseID]
              }
            )
          : {
              wins:[loseID],
              losses: []
            }
        acc[loseID] = acc[loseID]
          ? Object.assign(
              acc[loseID],
              {losses:[...acc[loseID].losses,winID]}
            )
          : {
              wins:[],
              losses:[winID]
            }
        return acc;
      },{});
    tournements[tnmt].players = Object.keys(rotatedResults)
      .map( id => {
        const matchingPlayer = tournements[tnmt].players
          .find(idMatched(id));
        //console.log(rotatedResults[id].wins)
        return matchingPlayer
          ? Object.assign(
            matchingPlayer,
            { wins:rotatedResults[id].wins.map(idToTag(tnmt)),
              losses:rotatedResults[id].losses.map(idToTag(tnmt)) }
          )
          : {
              id:id,
              wins:rotatedResults[id].wins.map(idToTag(tnmt)),
              losses:rotatedResults[id].losses.map(idToTag(tnmt))
            };
      }
    );
  };

  const idToTag = tnmt => id => {
    const find = tournements[tnmt].players
      .find(idMatched(id))
    return (find && find.tag) || id;
  }

  const getPlayersRaw = () => {
    playerResults = {}
    Object.keys(tournements)
      .map(tnmt =>
        tournements[tnmt].players.forEach(player => {
          const tag = player.tag
          if(player.id === 'null'){return}
          playerResults[tag] = playerResults[tag]
            ? Object.assign(
                playerResults[tag],
                {
                  wins:[...playerResults[tag].wins,...player.wins.map(idToTag(tnmt))],
                  losses:[...playerResults[tag].losses,...player.losses.map(idToTag(tnmt))]
                }
              )
            : {
                wins:[...player.wins.map(idToTag(tnmt))],
                losses:[...player.losses.map(idToTag(tnmt))]
              }
          })
        )
    return playerResults
  }

  const countArray = arr => arr.reduce((acc,val)=> {
    if(!val || (typeof val !== 'string') || val.indexOf("bye") !== -1) { return acc }
      const index = acc.findIndex(x=>x[val])
      return index === -1
        ? [...acc,{[val]:1}]
        : [...acc.slice(0,index),{[val]:acc[index][val]+1},...acc.slice(index+1)]
    },[]
  )
  const getPlayersTotals = () => {
    const rawStats = getPlayersRaw()
    return Object.keys(rawStats)
      .map(player => {
        return {[player]:
          {
            wins:countArray(rawStats[player].wins),
            losses:countArray(rawStats[player].losses)
          }
        }
      }
      )

  }

  const count = (arr) => arr.reduce(
    (acc,val) => {
      return acc+Object.keys(val).reduce(
        (acc2,x)=>(acc2+val[x]),
        0)
      },
    0)

  const eventsAttended = (tag) =>
    Object.keys(tournements).filter(tnmt =>
      tournements[tnmt].players.filter(pl => pl.tag === tag).length)

  const getPlayer = (tag) => {
    const allPlayers = getPlayersTotals()
    const player = allPlayers.find(obj => obj[tag])
    if (!player) { return null};
    return Object.assign(
      player[tag],
      {
        events:eventsAttended(tag),
        totalEvents:eventsAttended(tag).length,
        totalWins:count(player[tag].wins),
        totalLosses:count(player[tag].losses)
      }
    )
  }

  (function init (startTournements){
    startTournements.forEach(challongeAdd)
  })(startTournements);

  return {
    challongeAdd,
    tournements,
    addTournement,
    addPlayerNames,
    addMatchResults,
    getPlayersTotals,
    getPlayer
  }

}

module.exports = state;
