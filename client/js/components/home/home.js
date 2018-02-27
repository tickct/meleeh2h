import React,
  {
    Component
} from 'react';

import {
  SearchBar
} from '../player/SearchBar';

class Home extends Component {
  render(){
    return (
      <div className="home">
        <SearchBar />
      </div>
    );
  }
}



export default Home;
