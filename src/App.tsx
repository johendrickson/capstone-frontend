import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="main logo" />
        <span>Plant Pal</span>
      </header>
      <main>
        <h1>Welcome</h1>
        <p>
          Here's some starter text where I will welcome you wholeheartedly and with fun and cool design.
        </p>
      </main>
      <footer>
        <p>A project by Jamie</p>
      </footer>
    </div>
  );
}

export default App;
