from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Состояние устройств
device_states = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ControlAction(BaseModel):
    action: str

@app.post("/device/{device_id}/control")
async def control_device(device_id: str, action: ControlAction):
    """
    Симулирует управление реле на Raspberry Pico
    В реальности здесь был бы код для управления GPIO
    """
    try:
        if action.action not in ["enable", "disable"]:
            raise HTTPException(status_code=400, detail="Invalid action")

        device_states[device_id] = "disabled" if action.action == "disable" else "enabled"
        
        print(f"Device {device_id} state changed to: {device_states[device_id]}")
        
        return {
            "status": "success",
            "device_id": device_id,
            "state": device_states[device_id]
        }
    except Exception as e:
        print(f"Error controlling device {device_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Добавим endpoint для проверки состояния устройства
@app.get("/device/{device_id}/status")
async def get_device_status(device_id: str):
    return {"status": device_states.get(device_id, "enabled")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002) 