from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.job import get_active_jobs
from app.db.database import get_db
from app.schemas.job import JobResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/", response_model=list[JobResponse])
def list_jobs(db: Session = Depends(get_db)):
    return get_active_jobs(db)