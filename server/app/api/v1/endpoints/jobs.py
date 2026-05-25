from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.job import get_active_jobs, get_job_by_id
from app.db.database import get_db
from app.schemas.job import JobResponse
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/", response_model=list[JobResponse])
def list_jobs(db: Session = Depends(get_db)):
    return get_active_jobs(db)

@router.get("/{job_id}", response_model=JobResponse)
def get_job_details(job_id: int, db: Session = Depends(get_db)):
    job = get_job_by_id(db, job_id)

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    return job