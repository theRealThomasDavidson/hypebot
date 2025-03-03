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
    if (window.Ohmni) {
      // Forward at 700 speed for 2000ms (2 seconds)
      window.Ohmni.move(700, 700, 2000);
    }
  };
  
  const moveBackward = () => {
    console.log("Moving backward");
    if (window.Ohmni) {
      // Backward at 700 speed for 2000ms
      window.Ohmni.move(-700, -700, 2000);
    }
  };
  
  const turnLeft = () => {
    console.log("Turning left");
    if (window.Ohmni) {
      // Turn left - negative left wheel, positive right wheel
      window.Ohmni.move(-700, 700, 1500);
    }
  };
  
  const turnRight = () => {
    console.log("Turning right");
    if (window.Ohmni) {
      // Turn right - positive left wheel, negative right wheel
      window.Ohmni.move(700, -700, 1500);
    }
  };
  
  const stopMovement = () => {
    console.log("Stopping movement");
    if (window.Ohmni) {
      // Stop all movement
      window.Ohmni.move(0, 0, 0);
    }
  };
  
  const attemptConnection = () => {
    console.log("Attempting connection to Ohmni");
    
    // Check if Ohmni API is available
    if (window.Ohmni) {
      // Request bot info to verify connection
      window.Ohmni.requestBotInfo();
      
      // Add listener for bot info response
      window.addEventListener('botInfoUpdate', (event) => {
        console.log("Bot info received:", event.detail);
        setConnected(true);
        // You could also update robot status with real data here
      });
      
      // For simulation purposes:
      setConnected(true);
    } else {
      console.error("Ohmni API not available");
    }
  };
  
  const toggleCamera = () => {
    setCameraActive(!cameraActive);
    console.log(`Camera ${cameraActive ? 'disabled' : 'enabled'} (simulated)`);
  };
  
  // Add neck control functions
  const lookUp = () => {
    if (window.Ohmni) {
      window.Ohmni.setNeckTorqueEnabled(1);
      window.Ohmni.setNeckPosition(650, 100); // Look up
    }
  };
  
  const lookDown = () => {
    if (window.Ohmni) {
      window.Ohmni.setNeckTorqueEnabled(1);
      window.Ohmni.setNeckPosition(350, 100); // Look down
    }
  };
  
  const lookStraight = () => {
    if (window.Ohmni) {
      window.Ohmni.setNeckTorqueEnabled(1);
      window.Ohmni.setNeckPosition(512, 100); // Look straight
    }
  };
  
  // Add a greeting function with text-to-speech
  const sayGreeting = () => {
    if (window.Ohmni) {
      window.Ohmni.setSpeechLanguage("en-US");
      window.Ohmni.say("Hello! I am your Ohmni robot assistant.", () => {
        console.log("Finished speaking");
      });
    }
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
      
      <div className="neck-section">
        <h2>Neck Controls</h2>
        <div className="control-row">
          <button className="movement-button" onClick={lookUp}>Look Up</button>
          <button className="movement-button" onClick={lookStraight}>Look Straight</button>
          <button className="movement-button" onClick={lookDown}>Look Down</button>
        </div>
      </div>
      
      <div className="speech-section">
        <h2>Voice Controls</h2>
        <button className="speech-button" onClick={sayGreeting}>Say Greeting</button>
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