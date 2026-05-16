from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_service import ws_manager

router = APIRouter(prefix="/ws", tags=["WebSockets"])

@router.websocket("/orders/{order_id}")
async def order_tracking_ws(websocket: WebSocket, order_id: str):
    await ws_manager.connect(websocket, order_id)
    try:
        while True:
            # We just keep the connection open. Client doesn't need to send anything.
            # But we must listen for disconnects
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, order_id)
