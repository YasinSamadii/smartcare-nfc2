import os
import time
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./roaltag.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    national_id = Column(String, unique=True)
    age = Column(Integer)
    blood_type = Column(String)
    token_id = Column(String, unique=True, index=True)
    allergies = Column(String, default="ندارد")
    conditions = Column(String, default="ندارد")

class QueueItem(Base):
    __tablename__ = "queue"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer)
    status = Column(String, default="waiting") # waiting, in_progress, completed
    wait_time = Column(Integer, default=0)
    join_time = Column(Float, default=time.time)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ROAL TAG API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# Seed Data
def seed_db():
    db = SessionLocal()
    if db.query(Patient).count() == 0:
        p1 = Patient(name="حامد رضایی", national_id="00123456789", age=42, blood_type="O+", token_id="8F3A-2C9D-7E41", conditions="فشار خون، دیابت نوع ۲")
        p2 = Patient(name="مریم احمدی", national_id="00987654321", age=35, blood_type="A+", token_id="RT-UUID-98231", allergies="پنی‌سیلین")
        db.add_all([p1, p2])
        db.commit()
    db.close()
seed_db()

class TapRequest(BaseModel):
    token_id: str

@app.post("/api/v1/queue/tap")
def simulate_nfc_tap(req: TapRequest, db: Session = Depends(get_db)):
    # 38ms simulated delay
    time.sleep(0.038)
    patient = db.query(Patient).filter(Patient.token_id == req.token_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="TAG_NOT_FOUND")
    return {"status": "success", "patient": {"name": patient.name, "id": patient.national_id, "allergies": patient.allergies}}

@app.get("/api/v1/stats")
def get_stats():
    # Simulated ISd and KPIs
    return {
        "today_patients": 72,
        "visits": 48,
        "waiting": 8,
        "avg_wait_time": 12,
        "room_status": [
            {"room": 1, "doctor": "دکتر احمدی", "capacity": 80},
            {"room": 2, "doctor": "دکتر کریمی", "capacity": 60}
        ]
    }
