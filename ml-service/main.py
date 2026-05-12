"""
CyberShield IDS - ML Microservice
FastAPI service for threat prediction using machine learning
"""
import os
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import joblib
from datetime import datetime

app = FastAPI(
    title="CyberShield ML Service",
    description="AI-powered threat detection microservice",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class TrafficData(BaseModel):
    sourceIp: str
    destinationIp: str
    sourcePort: Optional[int] = None
    destinationPort: Optional[int] = None
    protocol: str = "TCP"
    packetSize: Optional[int] = None
    bytesTransferred: Optional[int] = None
    duration: Optional[float] = None
    flags: Optional[List[str]] = []

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    anomalyScore: float
    model: str
    features: Dict
    timestamp: str

# Mock ML models (in production, load actual trained models)
class MockMLModel:
    def __init__(self, name: str, accuracy: float):
        self.name = name
        self.accuracy = accuracy
    
    def predict(self, features: np.ndarray) -> tuple:
        """Mock prediction - returns random but realistic results"""
        # Simulate prediction
        is_threat = np.random.random() < 0.15  # 15% threat rate
        confidence = np.random.uniform(0.75, 0.98) if is_threat else np.random.uniform(0.80, 0.99)
        anomaly_score = np.random.uniform(0.6, 0.95) if is_threat else np.random.uniform(0.0, 0.3)
        
        prediction = "threat" if is_threat else "normal"
        return prediction, confidence, anomaly_score

# Initialize models
models = {
    "isolation_forest": MockMLModel("Isolation Forest", 94.2),
    "random_forest": MockMLModel("Random Forest", 97.1),
    "autoencoder": MockMLModel("Autoencoder", 91.3),
}

def extract_features(data: TrafficData) -> Dict:
    """Extract features from traffic data"""
    features = {
        "port_entropy": hash(str(data.sourcePort) + str(data.destinationPort)) % 100 / 100,
        "packet_size": (data.packetSize or 64) / 1500,
        "bytes_transferred": (data.bytesTransferred or 0) / 100000,
        "duration": (data.duration or 0) / 60,
        "protocol_numeric": {"TCP": 0.1, "UDP": 0.2, "HTTP": 0.3, "HTTPS": 0.4}.get(data.protocol, 0.5),
        "port_risk": 1.0 if data.destinationPort in [22, 23, 3389, 445, 135] else 0.3,
        "flag_count": len(data.flags or []) / 10,
    }
    return features

@app.get("/")
async def root():
    return {
        "service": "CyberShield ML Service",
        "version": "1.0.0",
        "status": "online",
        "models": list(models.keys())
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "models_loaded": len(models),
        "models": [{"name": m.name, "accuracy": m.accuracy} for m in models.values()]
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_threat(data: TrafficData):
    """Predict if traffic data represents a threat"""
    try:
        # Extract features
        features_dict = extract_features(data)
        features_array = np.array(list(features_dict.values())).reshape(1, -1)
        
        # Use primary model (Random Forest)
        model = models["random_forest"]
        prediction, confidence, anomaly_score = model.predict(features_array)
        
        return PredictionResponse(
            prediction=prediction,
            confidence=round(confidence, 4),
            anomalyScore=round(anomaly_score, 4),
            model=model.name,
            features=features_dict,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/metrics")
async def get_metrics():
    """Get model performance metrics"""
    return {
        "models": [
            {
                "name": "Isolation Forest",
                "accuracy": 94.2,
                "precision": 92.1,
                "recall": 95.8,
                "f1": 93.9,
                "status": "active"
            },
            {
                "name": "Random Forest",
                "accuracy": 97.1,
                "precision": 96.8,
                "recall": 97.4,
                "f1": 97.1,
                "status": "active"
            },
            {
                "name": "Autoencoder",
                "accuracy": 91.3,
                "precision": 89.7,
                "recall": 93.2,
                "f1": 91.4,
                "status": "active"
            },
            {
                "name": "Logistic Regression",
                "accuracy": 93.5,
                "precision": 92.0,
                "recall": 94.8,
                "f1": 93.4,
                "status": "standby"
            }
        ],
        "lastTrained": "2024-01-15T10:30:00Z",
        "totalPredictions": 15847,
        "avgInferenceTime": "12ms"
    }

@app.post("/train")
async def trigger_training():
    """Trigger model retraining (mock)"""
    return {
        "status": "training_started",
        "message": "Model retraining initiated",
        "estimatedTime": "15 minutes",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/batch-predict")
async def batch_predict(data_list: List[TrafficData]):
    """Batch prediction for multiple traffic samples"""
    results = []
    for data in data_list:
        features_dict = extract_features(data)
        features_array = np.array(list(features_dict.values())).reshape(1, -1)
        model = models["random_forest"]
        prediction, confidence, anomaly_score = model.predict(features_array)
        
        results.append({
            "sourceIp": data.sourceIp,
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "anomalyScore": round(anomaly_score, 4)
        })
    
    return {"predictions": results, "count": len(results)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001, log_level="info")
