from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import asyncio
import json
from datetime import datetime
import uuid
from pydantic import BaseModel

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Keep track of active WebSocket connections
active_connections: List[WebSocket] = []

# Keep track of active tasks
active_tasks: Dict[str, dict] = {}

class TaskCreate(BaseModel):
    description: str

async def simulate_task_progress(task_id: str):
    """Simulate an AI task processing with progress updates."""
    try:
        progress = 0
        while progress < 100:
            await asyncio.sleep(10)  # Update every 10 seconds
            progress += 10
            
            update = {
                "taskId": task_id,
                "status": "PROCESSING" if progress < 100 else "COMPLETED",
                "progress": progress,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            active_tasks[task_id].update(update)
            
            # Broadcast update to all connected clients
            for connection in active_connections:
                try:
                    await connection.send_json(update)
                except:
                    pass
                    
    except Exception as e:
        print(f"Error processing task {task_id}: {str(e)}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        # Handle WebSocket connection with CORS
        origin = websocket.headers.get('origin')
        if origin == "http://localhost:3000":
            await websocket.accept()
            active_connections.append(websocket)
            try:
                while True:
                    data = await websocket.receive_text()
                    print(f"Received message: {data}")
            except WebSocketDisconnect:
                active_connections.remove(websocket)
            except Exception as e:
                print(f"WebSocket error: {str(e)}")
                if websocket in active_connections:
                    active_connections.remove(websocket)
        else:
            await websocket.close(1008)  # Policy violation
    except Exception as e:
        print(f"WebSocket connection error: {str(e)}")
        if websocket in active_connections:
            active_connections.remove(websocket)

@app.post("/tasks")
async def create_task(task: TaskCreate):
    task_id = str(uuid.uuid4())
    task_data = {
        "id": task_id,
        "status": "PENDING",
        "progress": 0,
        "description": task.description,
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    active_tasks[task_id] = task_data
    
    # Start task processing in background
    asyncio.create_task(simulate_task_progress(task_id))
    
    return task_data

@app.get("/tasks")
async def get_tasks():
    return list(active_tasks.values())

@app.get("/tasks/{task_id}")
async def get_task(task_id: str):
    if task_id not in active_tasks:
        return {"error": "Task not found"}
    return active_tasks[task_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 