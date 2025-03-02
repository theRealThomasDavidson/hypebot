import React, { useState, useEffect } from 'react';
import '../App.css';

// Import any needed functionality from your original ohmni-control.js
// or recreate the essential parts directly in this component

const RobotControl = () => {
  const [robotIp, setRobotIp] = useState('192.168.1.100');
  const [robotStatus, setRobotStatus] = useState('Simulated');
  const [cameraActive, setCameraActive] = useState(false);
  const [connected, setConnected] = useState(false);
  
  // Mock data for demonstration
  const MOCK_ROBOT_DATA = {
    ip: '192.168.1.100',
    status: 'Simulated',
    battery: '87%',
    uptime: '2h 34m'
  };
  
  useEffect(() => {
    // Initialize Ohmni API if available
    if (window.Ohmni) {
      console.log("Ohmni API available");
      // Add initialization code here
    }
    
    // Simulate fetching robot data
    const intervalId = setInterval(() => {
      setRobotIp(MOCK_ROBOT_DATA.ip);
      setRobotStatus(MOCK_ROBOT_DATA.status);
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Movement control functions
  const moveForward = () => {
    console.log("Moving forward");
    if (window.Ohmni && connected) {
      window.Ohmni.move(0.5, 0); // Forward at 0.5 speed
    }
  };
  
  const moveBackward = () => {
    console.log("Moving backward");
    if (window.Ohmni && connected) {
      window.Ohmni.move(-0.5, 0); // Backward at 0.5 speed
    }
  };
  
  const turnLeft = () => {
    console.log("Turning left");
    if (window.Ohmni && connected) {
      window.Ohmni.move(0, 0.5); // Left turn at 0.5 speed
    }
  };
  
  const turnRight = () => {
    console.log("Turning right");
    if (window.Ohmni && connected) {
      window.Ohmni.move(0, -0.5); // Right turn at 0.5 speed
    }
  };
  
  const stopMovement = () => {
    console.log("Stopping movement");
    if (window.Ohmni && connected) {
      window.Ohmni.move(0, 0); // Stop all movement
    }
  };
  
  const attemptConnection = () => {
    console.log("Attempting connection to Ohmni");
    if (window.Ohmni) {
      // Replace with actual connection code
      setConnected(true);
    }
  };
  
  const toggleCamera = () => {
    setCameraActive(!cameraActive);
    console.log(`Camera ${cameraActive ? 'disabled' : 'enabled'} (simulated)`);
  };
  
  // Add more robot control functions as needed
  
  return (
    <div className="robot-control-panel">
      <div className="status-section">
        <h2>Robot Status (Simulated)</h2>
        <div className="info-row">
          <span>IP Address:</span>
          <span>{robotIp}</span>
        </div>
        <div className="info-row">
          <span>Status:</span>
          <span className="status-simulated">{robotStatus}</span>
        </div>
        <div className="info-row">
          <span>Battery:</span>
          <span>{MOCK_ROBOT_DATA.battery}</span>
        </div>
        <div className="info-row">
          <span>Connection:</span>
          <span className={connected ? "status-online" : "status-disconnected"}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
        
        {!connected && (
          <button className="connect-button" onClick={attemptConnection}>
            Connect to Robot
          </button>
        )}
      </div>
      
      <div className="movement-section">
        <h2>Movement Controls</h2>
        <div className="movement-controls">
          <div className="control-row">
            <button className="movement-button"></button>
            <button className="movement-button forward" onClick={moveForward}>Forward</button>
            <button className="movement-button"></button>
          </div>
          <div className="control-row">
            <button className="movement-button left" onClick={turnLeft}>Left</button>
            <button className="movement-button stop" onClick={stopMovement}>Stop</button>
            <button className="movement-button right" onClick={turnRight}>Right</button>
          </div>
          <div className="control-row">
            <button className="movement-button"></button>
            <button className="movement-button backward" onClick={moveBackward}>Back</button>
            <button className="movement-button"></button>
          </div>
        </div>
      </div>
      
      <div className="camera-section">
        <h2>Camera Control (Simulated)</h2>
        <button 
          className={`camera-toggle ${cameraActive ? 'active' : ''}`} 
          onClick={toggleCamera}
        >
          {cameraActive ? 'Disable Camera' : 'Enable Camera'}
        </button>
        
        {cameraActive && (
          <div className="camera-feed">
            <div className="placeholder-camera">
              <p>Camera Feed Simulation</p>
              <p>Backend not required for this demo</p>
            </div>
          </div>
        )}
      </div>
      
      {/* More control panels as needed */}
    </div>
  );
};

export default RobotControl; 