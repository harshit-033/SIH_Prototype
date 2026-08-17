import asyncio
import socket
import uuid
import psutil
import websockets
import json

SERVER_IP = "192.168.1.10"
SERVER_PORT = 8000

CLIENT_ID = str(uuid.uuid4())[:8]
HOSTNAME = socket.gethostname()


async def connect_to_server():

    uri = f"ws://{SERVER_IP}:{SERVER_PORT}/ws"

    while True:

        try:
            print(f"Connecting to {uri}...")

            async with websockets.connect(uri) as websocket:

                print("Connected to server!")

                await websocket.send(json.dumps({
                    "id": CLIENT_ID,
                    "hostname": HOSTNAME
                }))

                while True:

                    cpu = psutil.cpu_percent(interval=1)
                    ram = psutil.virtual_memory().percent

                    data = {
                        "type": "status",
                        "hostname": HOSTNAME,
                        "cpu": cpu,
                        "ram": ram
                    }

                    await websocket.send(json.dumps(data))

                    await asyncio.sleep(2)

        except Exception as e:

            print("Connection failed:", e)
            print("Retrying in 5 seconds...")

            await asyncio.sleep(5)


asyncio.run(connect_to_server())