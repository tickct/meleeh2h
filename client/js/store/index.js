import {
  combineReducers
} from 'redux';
import {
  combineEpics
} from 'redux-observable';

import
  tournements,
  {
    challongeEpicMatches,
    challongeEpicPlayers
  }
from './tournements';


export const reducer = combineReducers({
  tournements
});
export const rootEpic = combineEpics(
  challongeEpicMatches,
  challongeEpicPlayers
);
