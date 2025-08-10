from fastapi import FastAPI

app = FastAPI()

@app.get("/score")
def read_score():
    return {"message": "score endpoint"}
