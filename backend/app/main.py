from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Set
import asyncio
import json
from datetime import datetime
import uuid
from pydantic import BaseModel
import aiohttp
from asyncio import Lock

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Shared state with locks
class SharedState:
    def __init__(self):
        self.active_tasks: Dict[str, dict] = {}
        self.tasks_lock = Lock()
        self.active_connections: Set[WebSocket] = set()
        self.connections_lock = Lock()

state = SharedState()

class TaskCreate(BaseModel):
    description: str

async def process_task_with_api(task_id: str):
    """Simulates API calls with proper error handling and rate limiting"""
    try:
        progress = 0
        retries = 3
        
        async with aiohttp.ClientSession() as session:
            while progress < 100:
                try:
                    # Simulate API call with timeout
                    async with session.post(
                        'https://api.openai.com/v1/...',
                        timeout=5,
                        headers={'Authorization': 'Bearer YOUR_API_KEY'}
                    ) as response:
                        if response.status == 429:  # Rate limit hit
                            await asyncio.sleep(20)  # Back off
                            continue
                            
                        progress += 10
                        
                        update = {
                            "taskId": task_id,
                            "status": "PROCESSING" if progress < 100 else "COMPLETED",
                            "progress": progress,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        
                        # Thread-safe update of task state
                        async with state.tasks_lock:
                            if task_id in state.active_tasks:
                                state.active_tasks[task_id].update(update)
                        
                        # Broadcast update to all connected clients
                        async with state.connections_lock:
                            dead_connections = set()
                            for connection in state.active_connections:
                                try:
                                    await connection.send_json(update)
                                except:
                                    dead_connections.add(connection)
                            
                            # Clean up dead connections
                            state.active_connections -= dead_connections
                        
                        await asyncio.sleep(10)  # Rate limiting
                        
                except asyncio.TimeoutError:
                    if retries > 0:
                        retries -= 1
                        await asyncio.sleep(2)
                        continue
                    raise
                    
    except Exception as e:
        # Update task status to ERROR
        error_update = {
            "taskId": task_id,
            "status": "ERROR",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        async with state.tasks_lock:
            if task_id in state.active_tasks:
                state.active_tasks[task_id].update(error_update)
        
        # Broadcast error
        async with state.connections_lock:
            for connection in state.active_connections:
                try:
                    await connection.send_json(error_update)
                except:
                    pass

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await websocket.accept()
        
        async with state.connections_lock:
            state.active_connections.add(websocket)
        
        try:
            while True:
                data = await websocket.receive_text()
                print(f"Received message: {data}")
        except WebSocketDisconnect:
            async with state.connections_lock:
                state.active_connections.remove(websocket)
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        async with state.connections_lock:
            if websocket in state.active_connections:
                state.active_connections.remove(websocket)

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
    
    # Thread-safe task creation
    async with state.tasks_lock:
        state.active_tasks[task_id] = task_data
    
    # Start task processing in background
    asyncio.create_task(process_task_with_api(task_id))
    
    return task_data

@app.get("/tasks")
async def get_tasks():
    async with state.tasks_lock:
        return list(state.active_tasks.values())

@app.get("/tasks/{task_id}")
async def get_task(task_id: str):
    async with state.tasks_lock:
        if task_id not in state.active_tasks:
            raise HTTPException(status_code=404, detail="Task not found")
        return state.active_tasks[task_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 