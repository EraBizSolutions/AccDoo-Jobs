from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine, test_database_connection
from app.models import candidate

from app.api.v1.endpoints import candidate as candidate_router
from app.api.v1.endpoints import jobs as jobs_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JobsEra Candidate API",
    description="Environment setup for JobsEra candidate sprint",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candidate_router.router)
app.include_router(jobs_router.router)

@app.get("/")
def health_check():
    return {
        "message": "JobsEra backend environment is running",
        "sprint": "Candidate module setup",
    }


@app.get("/db-health")
def db_health_check():
    result = test_database_connection()

    return {
        "database": "connected",
        "test_result": result,
    }