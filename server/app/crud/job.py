from sqlalchemy.orm import Session

from app.models.candidate import Job


def get_active_jobs(db: Session):
    return (
        db.query(Job)
        .filter(Job.status == "active")
        .order_by(Job.created_at.desc())
        .all()
    )