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
inventory = {}  # Persistent store — survives client disconnects


def upsert_inventory(ip, hostname, system_info=None, seen_at=None):
    """Create or refresh a PC inventory record."""
    now = seen_at or datetime.now().isoformat()
    if ip not in inventory:
        inventory[ip] = {
            "hostname": hostname or "Unknown",
            "first_seen": now,
            "last_seen": now,
            "system_info": system_info or {}
        }
        print(f"[inventory] New inventory entry: {ip} ({hostname})")
    else:
        inventory[ip]["hostname"] = hostname or inventory[ip].get("hostname", "Unknown")
        inventory[ip]["last_seen"] = now
        if system_info:
            inventory[ip]["system_info"] = system_info


@app.get("/")
def home():
    return {
        "server": "running",
        "clients": len(clients),
        "inventory_count": len(inventory)
    }


@app.get("/inventory")
def get_inventory():
    """Returns all known PCs that have ever connected, with their static system info."""
    for data in clients.values():
        upsert_inventory(
            data["ip"],
            data.get("hostname", "Unknown"),
            data.get("system_info", {}),
            data.get("last_seen")
        )

    result = []
    online_ips = {v["ip"] for v in clients.values()}
    for ip, data in inventory.items():
        result.append({
            "ip": ip,
            "hostname": data.get("hostname", "Unknown"),
            "first_seen": data.get("first_seen"),
            "last_seen": data.get("last_seen"),
            "is_online": ip in online_ips,
            "system_info": data.get("system_info", {})
        })
    return result


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
            "ram": data.get("ram", "--"),
            "net_sent": data.get("net_sent", "--"),
            "net_recv": data.get("net_recv", "--"),
            "disk_read": data.get("disk_read", "--"),
            "disk_write": data.get("disk_write", "--"),
            "system_info": data.get("system_info", {})
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
        system_info = data.get("system_info", {})
        client_ip = websocket.client.host
        now = datetime.now().isoformat()

        clients[client_id] = {
            "hostname": data["hostname"],
            "ip": client_ip,
            "last_seen": now,
            "websocket": websocket,
            "system_info": system_info
        }

        upsert_inventory(client_ip, data["hostname"], system_info, now)

        print(f"[+] Client connected: {client_id}")

        while True:
            data = await websocket.receive_json()

            clients[client_id]["last_seen"] = datetime.now().isoformat()
            if "cpu" in data:
                clients[client_id]["cpu"] = data["cpu"]
            if "ram" in data:
                clients[client_id]["ram"] = data["ram"]
            if "net_sent" in data:
                clients[client_id]["net_sent"] = data["net_sent"]
            if "net_recv" in data:
                clients[client_id]["net_recv"] = data["net_recv"]
            if "disk_read" in data:
                clients[client_id]["disk_read"] = data["disk_read"]
            if "disk_write" in data:
                clients[client_id]["disk_write"] = data["disk_write"]
            if "system_info" in data and data["system_info"]:
                clients[client_id]["system_info"] = data["system_info"]

            client_ip = clients[client_id]["ip"]
            upsert_inventory(
                client_ip,
                data.get("hostname", clients[client_id].get("hostname", "Unknown")),
                clients[client_id].get("system_info", {}),
                clients[client_id]["last_seen"]
            )

            print(f"[{client_id}] {data}")

    except WebSocketDisconnect:

        if client_id in clients:
            del clients[client_id]

        print(f"[-] Client disconnected: {client_id}")
