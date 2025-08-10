from fastapi import FastAPI
from pydantic import BaseModel
from model import predict

app = FastAPI()

class ScoreRequest(BaseModel):
    features: list[float]

class ScoreResponse(BaseModel):
    score: float

@app.post("/score", response_model=ScoreResponse)
def score_endpoint(req: ScoreRequest):
    prediction = predict([req.features])[0]
    return {"score": prediction}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
