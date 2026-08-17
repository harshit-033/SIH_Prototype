from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

clients = {}


@app.get("/")
def home():
    return {
        "server": "running",
        "clients": len(clients)
    }


@app.get("/clients")
def get_clients():
    result = []

    for client_id, data in clients.items():
        result.append({
            "id": client_id,
            "hostname": data["hostname"],
            "ip": data["ip"],
            "last_seen": data["last_seen"],
            "cpu": data.get("cpu", "--"),
            "ram": data.get("ram", "--")
        })

    return result


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    client_id = None

    try:
        # First message from client
        data = await websocket.receive_json()

        client_id = data["id"]

        clients[client_id] = {
            "hostname": data["hostname"],
            "ip": websocket.client.host,
            "last_seen": datetime.now().isoformat(),
            "websocket": websocket
        }

        print(f"[+] Client connected: {client_id}")

        while True:
            data = await websocket.receive_json()

            clients[client_id]["last_seen"] = datetime.now().isoformat()
            if "cpu" in data:
                clients[client_id]["cpu"] = data["cpu"]
            if "ram" in data:
                clients[client_id]["ram"] = data["ram"]

            print(f"[{client_id}] {data}")

    except WebSocketDisconnect:

        if client_id in clients:
            del clients[client_id]

        print(f"[-] Client disconnected: {client_id}")