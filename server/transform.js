var { CHALLONGE } = require('./keys');
var unirest = require('unirest');
const {
  pluck,
  normalizeTag,
  idMatched,
  findAndReplace
} = require('./utils/utils');

const playerObj = require('./player')

const {
  getTournementName,
  getID,
  getTag,
  getPlace,
  getWinner,
  getLoser
} = require('./utils/pluckers')

const getURL = (tournamentID) => `https://${CHALLONGE.USERNAME}:${CHALLONGE.API_KEY}@api.challonge.com/v1/tournaments/${tournamentID}`


var state = (startTournements) => {
  var tournements = {};

  const getPlayerFromID = (tnmt,id) => tournements[tnmt].players.find(idMatched(id))

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
            console.log(url+" sucessfully added")
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
          tournementName: tname,
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
      const matchingPlayer = getPlayerFromID(tnmt,getID(player));
      return matchingPlayer
        ? matchingPlayer.addTag(normalizeTag(getTag(player)))
        : playerObj.challongePlayertoPlayer(player)
    });
  }

  const addMatchResults = (tnmt,matches) => {
    if(!matches.length || matches.length === 0){
      console.error(`Import Error: ${tnmt} has no matches`)
      return
    }
    tournements[tnmt].players = matches
      .reduce((acc,match) => {
        const winningPlayer = getPlayerFromID(tnmt,getWinner(match));
        const lossingPlayer = getPlayerFromID(tnmt,getLoser(match));
        winningPlayer.addWin(lossingPlayer.tag)
        lossingPlayer.addLoss(winningPlayer.tag)
        acc = findAndReplace(acc)(idMatched(winningPlayer.id),winningPlayer)
        acc = findAndReplace(acc)(idMatched(lossingPlayer.id),lossingPlayer)
        return acc;
      },[]);
  };

  const getPlayersRaw = () => {
    playerResults = {}
    Object.keys(tournements)
      .map(tnmt =>
        tournements[tnmt].players.forEach(player => {
          const tag = player.tag
          if(player.id === 'null'){ return }
          playerResults[tag] = playerResults[tag]
            ? Object.assign(
                playerResults[tag],
                {
                  wins:[...playerResults[tag].wins,...player.wins],
                  losses:[...playerResults[tag].losses,...player.losses]
                }
              )
            : {
                wins: player.wins,
                losses: player.losses
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
