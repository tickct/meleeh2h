var { CHALLONGE } = require('./keys');
var unirest = require('unirest');

const pluck = (...rest) => {
  if (!rest.length) { return undefined; }
  const head = rest[0];
  const tail = rest.slice(1);
  if (!tail.length) { return o => o[head]; }
  const recurse = pluck(...tail);
  return o => o[head] && recurse(o[head]);
};

const getTournementName = pluck('name');
const getID = pluck('participant','id');
const getTag = pluck('participant','name');
const getPlace = pluck('participant','final_rank');
const getWinner = pluck('match','winner_id');
const getLoser = pluck('match','loser_id');

const getURL = (tournamentID) => `https://${CHALLONGE.USERNAME}:${CHALLONGE.API_KEY}@api.challonge.com/v1/tournaments/${tournamentID}`

const normalizePlayer = (player) => {
  const temp = player.toLowerCase().replace(/\*/g,'')
  if(temp.indexOf('|') !== -1) { return temp.split('|')[1].trim()}
  return temp
}
const idMatched = id => pl => pl.id.toString()===id.toString();

var state = (startTournements) => {
  var tournements = {};

  const challongeAdd = (tid) => {
    const url = getURL(tid)
    console.log("Fetching:"+url)
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
    tPlayers = tournements[tnmt].players
    tournements[tnmt].players = players.map(player => {
      const matchingPlayer = tPlayers.find((pl)=>pl.id===getID(player));
      return matchingPlayer
        ? Object.assign(
            matchingPlayer,
            {
              tag:normalizePlayer(getTag(player))
            }
          )
        : {
            tag:normalizePlayer(getTag(player)),
            id:getID(player),
            place:getPlace(player),
            wins:[],
            losses:[]
          };
    });
  }

  const addMatchResults = (tnmt,matches) => {
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
        return matchingPlayer
          ? Object.assign(
            matchingPlayer,
            { wins:rotatedResults[id].wins,
              losses:rotatedResults[id].losses }
          )
          : {
              id:id,
              wins:rotatedResults[id].wins,
              losses:rotatedResults[id].losses
            };
      }
    );
  };

  const idToTag = tnmt => id =>
    tournements[tnmt].players
      .find(idMatched(id))
      .tag;


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
    if(!val || val.indexOf("bye") !== -1) { return acc }
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
    (acc,val) =>
      acc+Object.keys(val).reduce(
        (acc2,x)=>
          acc2+val[x],
        0),
    0)

  const getPlayer = (tag) => {
    const allPlayers = getPlayersTotals()
    const player = allPlayers.find(obj => obj[tag])
    console.log(player)
    return Object.assign(
      player[tag],
      {
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
