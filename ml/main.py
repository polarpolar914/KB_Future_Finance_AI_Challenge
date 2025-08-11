from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Features(BaseModel):
    counterparty: str = ""
    goods: str = ""
    route: str = ""


@app.post("/score")
def score(features: Features):
    """Return a simple deterministic risk score.

    This replaces the previous placeholder endpoint that only returned
    a static message.  The score is derived from the lengths of the
    provided feature strings and normalised to a 0‑100 range to mimic a
    real ML model output.
    """

    raw_score = (
        len(features.counterparty) * 0.5
        + len(features.goods) * 0.3
        + len(features.route) * 0.2
    )
    return {"score": round(min(100, raw_score))}

