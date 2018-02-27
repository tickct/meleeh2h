import React from 'react';

const options = ['All','By Tournement'];

const getClassName = (active,current) =>
  active === current
    ? "display_option active"
    : "display_option";

const DisplayBar = (props) =>
  <ul className="display_bar flex">
    {options.map(o=>
      <li key={o} onClick={()=>props.onClick(o)} className={getClassName(props.active,o)}>{o}</li>)
    }
  </ul>;



export default DisplayBar;
