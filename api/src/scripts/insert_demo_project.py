import requests
import json

def insert_demo_project():
    url = "http://localhost:3000/api/projects"
    
    project_data = {
        "title": "Project Demo",
        "description": "This is a demonstration project...",
        "video_url": "https://example.com/video.mp4",
        "screenshot_url": "https://example.com/screenshot.jpg",
        "techs": ["JavaScript", "React", "Node.js"],
        "keywords": ["web", "demo", "portfolio"],
        "github_url": "https://github.com/user/project",
        "deploy_url": "https://project-demo.com",
        "profile_id": "ea02fbef-1985-4a61-8c97-d62c9a70243d"
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=project_data, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        print("Success! Project created:")
        print(json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error creating project: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print("Response:", e.response.text)

if __name__ == "__main__":
    insert_demo_project() 