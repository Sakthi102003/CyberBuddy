"""
Run the backend server
"""
import uvicorn

if __name__ == "__main__":
    print("Starting CyberBuddy Backend Server...")
    print("API Documentation: http://localhost:8000/docs")
    print("Health Check: http://localhost:8000/health")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
