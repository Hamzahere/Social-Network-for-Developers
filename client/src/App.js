import React, { Fragment } from 'react';
// import {BrowserRouter as Router}
import './App.css';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';

const App = () => (
  <Fragment>
    <h1>App</h1>
    <Navbar />
    <Landing />
  </Fragment>
);

export default App;
