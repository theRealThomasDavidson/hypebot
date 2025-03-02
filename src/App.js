import React from 'react';
import './App.css';
import RobotControl from './components/RobotControl';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Ohmni Robot Control Interface</h1>
      </header>
      
      <main className="App-content">
        <RobotControl />
      </main>
      
      <footer className="App-footer">
        <p>Connected to your Ohmni robot</p>
      </footer>
    </div>
  );
}

export default App; 