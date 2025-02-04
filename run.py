import uvicorn

if __name__ == "__main__":
    uvicorn.run("analytics_service.analytics_service:app", 
                host="0.0.0.0", 
                port=8001, 
                reload=True) 