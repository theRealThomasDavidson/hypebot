import React, { useState, useEffect } from 'react';
import '../App.css';

// Import any needed functionality from your original ohmni-control.js
// or recreate the essential parts directly in this component

const RobotControl = () => {
  const [robotIp, setRobotIp] = useState('');
  const [robotStatus, setRobotStatus] = useState('Disconnected');
  const [cameraActive, setCameraActive] = useState(false);
  
  // Configuration - can be moved to environment variables
  const BACKEND_URL = 'http://localhost:8000'; // Local backend
  
  useEffect(() => {
    // Fetch robot status on component mount
    fetchRobotStatus();
    
    // Set up polling for status updates
    const intervalId = setInterval(fetchRobotStatus, 10000);
    return () => clearInterval(intervalId);
  }, []);
  
  const fetchRobotStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/robot/status`);
      const data = await response.json();
      
      setRobotIp(data.ip);
      setRobotStatus(data.status);
    } catch (error) {
      console.error('Error fetching robot status:', error);
      setRobotStatus('Connection Error');
    }
  };
  
  const toggleCamera = async () => {
    setCameraActive(!cameraActive);
    
    // Add actual API call to the backend
    try {
      const response = await fetch(`${BACKEND_URL}/commands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command_type: cameraActive ? 'camera_off' : 'camera_on',
          parameters: {},
          priority: 1
        }),
      });
      
      console.log('Camera toggle response:', await response.json());
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };
  
  // Add more robot control functions as needed
  
  return (
    <div className="robot-control-panel">
      <div className="status-section">
        <h2>Robot Status</h2>
        <div className="info-row">
          <span>IP Address:</span>
          <span>{robotIp || 'Unknown'}</span>
        </div>
        <div className="info-row">
          <span>Status:</span>
          <span className={`status-${robotStatus.toLowerCase()}`}>{robotStatus}</span>
        </div>
      </div>
      
      <div className="camera-section">
        <h2>Camera Control</h2>
        <button 
          className={`camera-toggle ${cameraActive ? 'active' : ''}`} 
          onClick={toggleCamera}
        >
          {cameraActive ? 'Disable Camera' : 'Enable Camera'}
        </button>
        
        {cameraActive && (
          <div className="camera-feed">
            {/* Camera feed display */}
            <img src={`${BACKEND_URL}/camera/stream`} alt="Robot Camera Feed" />
          </div>
        )}
      </div>
      
      {/* More control panels as needed */}
    </div>
  );
};

export default RobotControl; 