from fastapi import WebSocket
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # order_id -> list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, order_id: str):
        await websocket.accept()
        if order_id not in self.active_connections:
            self.active_connections[order_id] = []
        self.active_connections[order_id].append(websocket)
        logger.info(f"WebSocket connected for order: {order_id}")

    def disconnect(self, websocket: WebSocket, order_id: str):
        if order_id in self.active_connections:
            if websocket in self.active_connections[order_id]:
                self.active_connections[order_id].remove(websocket)
            if not self.active_connections[order_id]:
                del self.active_connections[order_id]
        logger.info(f"WebSocket disconnected for order: {order_id}")

    async def broadcast_order_update(self, order_id: str, data: dict):
        if order_id in self.active_connections:
            connections = self.active_connections[order_id]
            disconnected = []
            for connection in connections:
                try:
                    # Encode datetime if necessary, though data should ideally be JSON serializable
                    await connection.send_text(json.dumps(data, default=str))
                except Exception as e:
                    logger.error(f"Error broadcasting to WS for order {order_id}: {e}")
                    disconnected.append(connection)
            
            # Clean up dead connections
            for conn in disconnected:
                self.disconnect(conn, order_id)

ws_manager = ConnectionManager()
