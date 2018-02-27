import React,
  {
    Component
} from 'react';

import
  Home
from './components/home/home';

import
  Player
from './components/player/Player';
import
  Contact
from './components/Contact/Contact';
import
  Browse
from './components/Browse/Browse';
import {
  Header
} from './components/header';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import {
  bindActionCreators
} from 'redux';
import {
  connect
} from 'react-redux';

export class App extends Component {
  render (){
    return (
      <Router>
      <div className='container'>
        <Header />
        <Switch>
          <Route
            exact path='/'
            component={Home}
          />
          <Route
            path='/player/:tag'
            component={Player}
          />
          <Route
            path='/browse'
            component={Browse}
          />
          <Route
            path='/contact'
            component={Contact}
          />
          <Route
            render={ () => <p>Not Found</p>}
          />
        </Switch>
      </div>
      </Router>
    );
  }
}
