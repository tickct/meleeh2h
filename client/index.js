import React,
 {
   Component
} from 'react';
import ReactDOM from 'react-dom';
import {
  createStore,
  applyMiddleware
} from 'redux';
import {
  Provider
} from 'react-redux';
require('./index.css');
import {
  composeWithDevTools
} from 'redux-devtools-extension';
import {
  App
} from './js/App';
import {
  createEpicMiddleware
} from 'redux-observable';
import {
  reducer,
  rootEpic
} from './js/store';
import Rx from 'rxjs';
import 'rxjs';

const epicMiddleware = createEpicMiddleware(rootEpic);
const store = createStore(reducer,
  composeWithDevTools(applyMiddleware(epicMiddleware)));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);
