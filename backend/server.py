from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Union, Any, Generator
import uvicorn
import io
import asyncio
import base64
from PIL import Image
import socket
from fastapi.responses import StreamingResponse
import cv2
import threading
import numpy as np
# You'll need to install appropriate AI libraries based on your choice
# import tensorflow as tf  # For local model
# from transformers import pipeline  # For local Hugging Face models
# import openai  # For OpenAI API

app = FastAPI()

# Add CORS middleware to allow requests from your Amplify frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add a camera handler
camera = None
camera_lock = threading.Lock()

class RobotCommand(BaseModel):
    command_type: str
    parameters: Dict[str, Union[str, int, float, bool]]
    priority: Optional[int] = 0

class ImageAnalysisRequest(BaseModel):
    image_data: Optional[str] = None  # Base64 encoded image if not using multipart
    analysis_type: str = "general"  # What kind of analysis to perform
    additional_context: Optional[str] = None  # Any extra context for the AI

class AIResponse(BaseModel):
    success: bool
    message: str
    analysis: Optional[Dict[str, Any]] = None
    suggested_actions: Optional[List[Dict[str, Any]]] = None

@app.post("/commands")
async def process_command(command: RobotCommand) -> Dict[str, Union[str, bool]]:
    # Process robot commands with minimal latency
    # Implementation depends on Ohmni robot's API
    return {"success": True, "message": "Command processed"}

@app.post("/analyze-image", response_model=AIResponse)
async def analyze_image(
    analysis_request: Optional[ImageAnalysisRequest] = None,
    image: Optional[UploadFile] = File(None)
) -> AIResponse:
    """
    Analyze an image using AI. The image can be provided either as a multipart upload
    or as base64-encoded data in the request body.
    """
    try:
        # Get image data from either source
        if image:
            image_data = await image.read()
            img = Image.open(io.BytesIO(image_data))
        elif analysis_request and analysis_request.image_data:
            image_bytes = base64.b64decode(analysis_request.image_data)
            img = Image.open(io.BytesIO(image_bytes))
        else:
            raise HTTPException(status_code=400, detail="No image provided")
        
        # Process with AI - this is where you'd integrate your chosen AI solution
        # Option 1: Local AI model (lowest latency)
        analysis_result = await process_with_local_ai(
            img, 
            analysis_type=analysis_request.analysis_type if analysis_request else "general",
            context=analysis_request.additional_context if analysis_request else None
        )
        
        # Option 2: External API but called from local server
        # analysis_result = await process_with_external_ai(img)
        
        return AIResponse(
            success=True,
            message="Image analyzed successfully",
            analysis=analysis_result,
            suggested_actions=[
                {"action": "move", "parameters": {"direction": "forward"}} 
                # Example action - would be derived from AI analysis
            ]
        )
    
    except Exception as e:
        return AIResponse(
            success=False,
            message=f"Error processing image: {str(e)}"
        )

async def process_with_local_ai(
    image: Image.Image, 
    analysis_type: str = "general",
    context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Process image with a local AI model for minimum latency.
    This is a placeholder - implement with your preferred local model.
    """
    # Example implementation with a local model
    # Simulate processing time
    await asyncio.sleep(0.1)
    
    # TODO: Replace with actual AI processing
    # For example with a local Hugging Face model:
    # classifier = pipeline("image-classification")
    # result = classifier(image)
    
    # Placeholder result
    return {
        "objects_detected": ["person", "chair"],
        "scene_description": "A person sitting in a room",
        "confidence": 0.92
    }

@app.get("/robot/status")
async def get_robot_status() -> Dict[str, Any]:
    """
    Get the robot's IP address and status.
    """
    try:
        # Get the IP address
        ip_address = get_ip_address()
        
        # In a real implementation, you would check the actual robot status
        # This is a placeholder
        return {
            "ip": ip_address,
            "status": "Online",
            "battery": "87%",
            "uptime": "2h 34m"
        }
    except Exception as e:
        return {
            "ip": "Unknown",
            "status": f"Error: {str(e)}",
            "error": True
        }

def get_ip_address() -> str:
    """Get the robot's local IP address"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Doesn't need to be reachable
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

@app.get("/camera/stream")
async def stream_camera():
    """
    Stream the robot's camera feed as MJPEG.
    """
    return StreamingResponse(
        generate_camera_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

def generate_camera_frames() -> Generator[bytes, None, None]:
    """Generate camera frames as JPEG images."""
    # In a real implementation, this would connect to the Ohmni camera
    # For demonstration, we're using a local webcam or placeholder
    global camera
    
    try:
        # Initialize camera if needed
        with camera_lock:
            if camera is None:
                # Try to connect to robot camera - replace with actual robot camera code
                try:
                    # For testing, using local webcam
                    camera = cv2.VideoCapture(0)
                except Exception as e:
                    print(f"Error initializing camera: {e}")
                    # Use a blank image as fallback
                    camera = None
        
        while True:
            if camera is not None:
                success, frame = camera.read()
                if not success:
                    break
                    
                # Encode frame as JPEG
                _, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()
                
                # Yield the frame in the expected format
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            else:
                # Generate a placeholder image
                blank_image = np.zeros((480, 640, 3), np.uint8)
                cv2.putText(blank_image, "Camera Unavailable", (150, 240), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                
                _, buffer = cv2.imencode('.jpg', blank_image)
                frame_bytes = buffer.tobytes()
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                
                # Don't loop as rapidly for the placeholder
                await asyncio.sleep(1.0)
    
    except Exception as e:
        print(f"Error in camera stream: {e}")
    finally:
        # Keep the camera open for other requests
        pass

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 