import Rx from 'rxjs';
import 'rxjs';

import {
  pluck
} from '../utils';
const getPlayersURL = (tournement) => window.encodeURI(`http://localhost:1337/${tournement}/players`);
const getMatchesURL = (tournement) => window.encodeURI(`http://localhost:1337/${tournement}/matches`);

export const challongeEpicPlayers = action$ =>
  action$.ofType('FETCH_TOURNEMENT')
    .map(action =>
      getPlayersURL(action.tournement))
    .mergeMap(playersURL =>
      Rx.Observable.ajax(playersURL)
        .map(response => fetchPlayerResultSucess(tournement,response.response.items))
        .catch(({message}) => Rx.Observable.of(fetchPlayerFailure(message)))
    );

export const challongeEpicMatches = action$ =>
  action$.ofType('FETCH_TOURNEMENT')
    .map(action =>
      getMatchesURL(action.tournement))
    .mergeMap(matchURL =>
      Rx.Observable.ajax(matchURL)
        .map(response => fetchMatchResultSucess(tournement,response.response.items))
        .catch(({message}) => Rx.Observable.of(fetchMatchFailure(message)))
    );

export const fetchTournement = (tournement) => {
  return {
    type: 'FETCH_TOURNEMENT',
    tournement
  };
};
const fetchPlayerResultSucess = (tname,players) => {
  return {
    type: 'UPDATE_PLAYER_INFO',
    tname,
    players,
  };
};
const fetchPlayerFailure = (error) => {
  console.log(error)
  return {
    type: 'UPDATE_PLAYER_INFO_FAILURE',
    error,
  };
};

const fetchMatchResultSucess = (tname,matches) => {
  return {
    type: 'UPDATE_MATCH_INFO',
    tname,
    matches,
  };
};
const fetchMatchFailure = (error) => {
  console.log(error);
  return {
    type: 'UPDATE_MATCH_INFO_FAILURE',
    error,
  };
};

const getTournementName = pluck('name');
const getID = pluck('participant','id');
const getTag = pluck('participant','name');
const getPlace = pluck('participant','final_rank');
const getWinner = pluck('match','winner_id');
const getLoser = pluck('match','loser_id');

const tournementExists = (tournement,arr)=>arr.filter(x=>x===tournement).length;

const addPlayerNames = (tnmt,players) =>
  players.map(player => {
    const matchingPlayer = tnmt.players.find((pl)=>pl.id===getID(player));
    return matchingPlayer
      ? Object.assign(
        matchingPlayer,
        { tag:getTag(player) }
      )
      : {
          tag:getTag(player),
          id:getID(player),
          place:getPlace(player),
          wins:[],
          losses:[]
        };
  });

const addMatchResults = (tnmt,matches) => {
  const rotatedResults = matches
    .reduce(acc,match => {
      const winID = acc.getWinner(match);
      const loseID = acc.getLoser(match);
      acc.winID = Object.assign(
        acc.winID,
        {wins:[...acc.winID.wins,loseID]}
      );
      acc.loseID = Object.assign(
        acc.losID,
        {losses:[...acc.loseID.losses,winID]}
      );
      return acc;
    },{});
  return rotatedResults.keys()
    .map( id => {
      const matchingPlayer = tnmt.players.find((pl)=>pl.id===id);
      return matchingPlayer
        ? Object.assign(
          matchingPlayer,
          { wins:rotatedResults.id.wins,
            losses:rotatedResults.id.losses }
        )
        : {
            id:id,
            wins:rotatedResults.id.wins,
            losses:rotatedResults.id.losses
          };
    }
  );
};

const replaceAtName = (tname,val,arr,fn) =>
  arr.map(tnmt =>
    getTournementName(tnmt) === tname
      ? fn(tnmt,val)
      : tnmt
  );

const initialState = {
  tournements:[]
};

export default function tournements (state = initialState, action) {
  console.log(state.tournements)
  switch (action.type) {
    case 'FETCH_TOURNEMENT' :
      return tournementExists(action.tournement,state.tournements)
        && [...state.tournements,
           {
             name:action.tournement,
             players: []
           }
         ];
    case 'UPDATE_PLAYER_INFO' :
      return {
        tournements: replaceAtName(action.tname,action.players,state.tournements,addPlayerNames)
      };
    case 'UPDATE_MATCH_INFO' :
      return {
        tournements: replaceAtName(action.tname,action.matches,state.tournements,addMatchResults)
      };
    default:
      return state;
  }
};
