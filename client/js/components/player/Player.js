import React,
{
  Component
} from 'react';
import axios from 'axios';

import SearchBar from './SearchBar';
import PlayerStats from './PlayerStats';

const URIEncode = (str) => encodeURIComponent(str);

const attentedEvents = (tnmts,player) => objFilter(tnmts,(x=>{
  const find = x.players.find(y=>{
    return y.tag===player;
  });
  return find;})
);

const objFilter = (o,comparison) =>
  Object.keys(o)
    .filter(key => comparison(o[key]))
    .reduce((acc,key) => {
      return acc = Object.assign(
        acc,
        {[key]:o[key]}
      )
    }
    ,{});

class Player extends Component{
  constructor(props){
    super(props);
    this.state={
      tag:props.match.params.tag,
      display:'All',
    };
    this.getPlayer(props.match.params.tag)
    this.getTournements();
  }

  componentWillReceiveProps(nextProps){
    if(this.state.tag !== nextProps.match.params.tag){
      console.log('change')
      this.getPlayer(nextProps.match.params.tag)
      this.setState({tag:nextProps.match.params.tag})
    }
  }
  getPlayer(str){
    axios.get("http://localhost:1337/players/"+URIEncode(str.toLowerCase()),
    { headers: {
        crossdomain:true
      },
    })
    .then(res => {
      console.log(res);
      if (res.status === 200) {
        this.setState({player:res.data});
      }
      else {
        console.log(res.error);
      }
    });
  };

  getTournements(){
    axios.get("http://localhost:1337/tournements",
    { headers: {
        crossdomain:true
      },
    })
    .then(res => {
      console.log(res);
      if (res.status === 200) {
        this.setState({tournements:res.data});
      }
      else {
        console.log(res.error);
      }
    });
  }

  onDisplayChange(o){
    this.setState({display:o});
  };

  render() {
    const tag = this.props.match.params.tag
    return (
      <div className = "player">
        <SearchBar />
        {this.state.player && this.state.tournements &&<PlayerStats
          tournements= {attentedEvents(this.state.tournements,tag)}
          player = {this.state.player}
          tag = {tag}
          getPlayer = {this.getPlayer.bind(this)}
          onDisplayChange = {this.onDisplayChange.bind(this)}
          activeDisplay = {this.state.display}
        />
      }
      </div>
    );
  };
}

export default Player;
