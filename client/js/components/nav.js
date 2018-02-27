import React from 'react';
import {
  Link
} from 'react-router-dom';
const Nav = () =>
  <div className='header-nav'>
    <Link to='/' className = "nav-item" activeClassName="active">Search</Link>
    <Link to='/Browse' className = "nav-item" activeClassName="active">Browse</Link>
    <Link to='/Contact' className = "nav-item" activeClassName="active">Contact</Link>
  </div>;

export default Nav;
