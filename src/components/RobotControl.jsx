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
    // Check if Ohmni API is available
    if (window.Ohmni) {
      console.log("Ohmni API detected - initializing...");
      
      // Define event listeners for Ohmni API events
      window.addEventListener('botInfoUpdate', handleBotInfo);
      window.addEventListener('connectionStateChange', handleConnectionState);
      
      // Check if robot is already connected via the API
      if (window.Ohmni.getConnectionState() === 'connected') {
        setConnected(true);
        window.Ohmni.requestBotInfo(); // Get current robot info
      }
    } else {
      console.warn("Ohmni API not available - running in simulation mode");
    }
    
    // Clean up event listeners
    return () => {
      if (window.Ohmni) {
        window.removeEventListener('botInfoUpdate', handleBotInfo);
        window.removeEventListener('connectionStateChange', handleConnectionState);
      }
    };
  }, []);
  
  // Add these handler functions
  const handleBotInfo = (event) => {
    console.log("Bot info received:", event.detail);
    // Update robot data with real information
    if (event.detail) {
      setRobotIp(event.detail.ip || '192.168.1.100');
      setRobotStatus('Connected');
      // You can extract more info from event.detail as needed
    }
  };
  
  const handleConnectionState = (event) => {
    console.log("Connection state changed:", event.detail);
    if (event.detail === 'connected') {
      setConnected(true);
      setRobotStatus('Connected');
    } else {
      setConnected(false);
      setRobotStatus('Disconnected');
    }
  };
  
  // Movement control functions
  const showButtonFeedback = (action) => {
    // Provide visual feedback even if API doesn't work
    console.log(`${action} action triggered (simulation only)`);
    
    // Create and show a temporary notification
    const notification = document.createElement('div');
    notification.textContent = `${action} command sent`;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '20px';
    notification.style.zIndex = '1000';
    
    document.body.appendChild(notification);
    
    // Remove after 2 seconds
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  };
  
  const moveForward = () => {
    console.log("Moving forward");
    showButtonFeedback("Forward");
    
    if (window.Ohmni) {
      try {
        if (window.Ohmni.getConnectionState() === 'connected') {
          // Forward at 700 speed for 2000ms (2 seconds)
          window.Ohmni.move(700, 700, 2000);
        } else {
          console.warn("Cannot move: Not connected to robot");
          showButtonFeedback("Not connected");
        }
      } catch (error) {
        console.error("Move forward error:", error);
        showButtonFeedback("Command failed");
      }
    }
  };
  
  const moveBackward = () => {
    console.log("Moving backward");
    showButtonFeedback("Backward");
    
    if (window.Ohmni) {
      try {
        if (window.Ohmni.getConnectionState() === 'connected') {
          window.Ohmni.move(-700, -700, 2000);
        } else {
          console.warn("Cannot move: Not connected to robot");
          showButtonFeedback("Not connected");
        }
      } catch (error) {
        console.error("Move backward error:", error);
        showButtonFeedback("Command failed");
      }
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
    console.log("Attempting connection to Ohmni robot...");
    
    if (window.Ohmni) {
      try {
        // Check if we already have a connection
        const connectionState = window.Ohmni.getConnectionState();
        console.log("Current connection state:", connectionState);
        
        if (connectionState !== 'connected') {
          // For real robot connection, you'd specify the robot's IP
          // This would typically be entered by the user
          const robotAddress = prompt("Enter robot IP address:", "192.168.1.100");
          if (robotAddress) {
            // Connect to the robot
            window.Ohmni.connect(robotAddress);
            
            // Show connecting status
            setRobotStatus('Connecting...');
            showButtonFeedback("Connecting to robot");
            
            // The connection state will be updated by the event listener
          }
        } else {
          console.log("Already connected to robot");
          setConnected(true);
          window.Ohmni.requestBotInfo();
        }
      } catch (error) {
        console.error("Connection error:", error);
        showButtonFeedback("Connection failed");
        setRobotStatus('Connection Error');
      }
    } else {
      // Fallback for demo mode
      console.log("Simulating connection (Ohmni API not available)");
      setConnected(true);
      setRobotStatus('Simulated');
      showButtonFeedback("Connected in simulation mode");
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
  
  const disconnectRobot = () => {
    console.log("Disconnecting from robot");
    
    if (window.Ohmni && window.Ohmni.getConnectionState() === 'connected') {
      try {
        window.Ohmni.disconnect();
        showButtonFeedback("Disconnected from robot");
      } catch (error) {
        console.error("Disconnect error:", error);
        showButtonFeedback("Disconnect failed");
      }
    }
    
    setConnected(false);
    setRobotStatus('Disconnected');
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
        
        {connected && (
          <button className="disconnect-button" onClick={disconnectRobot}>
            Disconnect from Robot
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