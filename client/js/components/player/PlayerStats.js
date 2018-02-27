import React from 'react';
import { Link } from 'react-router-dom';
import DisplayBar from './DisplayBar';

const toCapitalized = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const uniquePlayers = arr => arr.reduce((acc,player)=> {
    const index = acc.find(p => p === Object.keys(player)[0]);
    return index
      ? acc
      : [...acc,...Object.keys(player)];
    }
  ,[]
);

const sumReduction = (acc,x) => acc+x;
const recordZip = player => {
  const uPlayers = uniquePlayers([...player.wins,...player.losses]);
  return uPlayers.map(uPlayer=> {
    const wins = player.wins.filter(win => Object.keys(win)[0] === uPlayer)[0] || {[uPlayer]:0};
    const losses = player.losses.filter(lose => Object.keys(lose)[0] === uPlayer)[0] || {[uPlayer]:0};
    return ({
      name:uPlayer,
      wins: wins[uPlayer],
      losses: losses[uPlayer]
    });
  })
  .sort((a,b)=>
    a.name > b.name
  );
};

const countArray = arr => arr.reduce((acc,val)=> {
  if(!val || (typeof val !== 'string') || val.indexOf("bye") !== -1) { return acc;}
    const index = acc.findIndex(x=>x[val]);
    return index === -1
      ? [...acc,{[val]:1}]
      : [...acc.slice(0,index),{[val]:acc[index][val]+1},...acc.slice(index+1)];
  },[]
);

const tournementToStats = player =>
({
  wins:countArray(player.wins),
  losses:countArray(player.losses)
});

const ResultSquare = props => {
 return <div
    className={"result_square flex-column "+getRecordClass(props.result.wins,props.result.losses)}
    key={props.result.name}
    onClick={props.onClick}
  >
    <Link to={"/player/"+props.result.name}>
      <span className="result_name">{props.result.name}</span>
      <div>
        <span>
          {props.result.wins} - {props.result.losses}
        </span>
      </div>
    </Link>
  </div>;

};

const StatBlock = (props) =>
  <div className = "statCount">
    <div className="total_wins">Total Wins:{props.player.totalWins}</div>
    <div className="total_losses">Total Losses:{props.player.totalLosses}</div>
    <div className="total_events">Total Events: {props.player.totalEvents}</div>
  </div>;

const getRecordClass = (wins,losses) =>{
  if(wins>losses){return "winning";};
  if(wins<losses){return "lossing";};
  return "tied";
};

export const PlayerStats = (props) =>
  <div className="player_profile">
    <div className = "playerSummary">
      <div className= "playerHeader"> {toCapitalized(props.tag)} </div>
      <StatBlock
        player = {props.player}
        tag = {props.tag}
    />
    </div>
    <DisplayBar
      active = {props.activeDisplay}
      onClick = {props.onDisplayChange}
    />
    <div className="results flex">
      {props.activeDisplay === 'All' && recordZip(props.player).map(result =>
        <ResultSquare
          result={result}
         />
       )}
       {props.activeDisplay === 'By Tournement'&& Object.keys(props.tournements).map(tnmtName => {
         const player = props.tournements[tnmtName].players.filter(x=>x.tag === props.tag)[0];
          return <div className="result_tournement flex-column">
             <span>{tnmtName} Place: {player.place}</span>
             {console.log(props.tournements[tnmtName].players.filter(x=>x.tag === props.tag)[0])}
             {console.log(props.player)}
             <div className = "stat_blocks flex">
             {recordZip(tournementToStats(player)).map(result =>
               <ResultSquare
                 result={result}
                 key={result.name}
                />
             )}
            </div>
         </div>;
       }
       )
       }
    </div>
  </div>;

export default PlayerStats;
