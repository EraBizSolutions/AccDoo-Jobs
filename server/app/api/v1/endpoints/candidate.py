from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud.candidate import (
    get_candidate_profile_by_id,
    update_candidate_profile,
)
from app.db.database import get_db
from app.schemas.candidate import (
    CandidateProfileResponse,
    CandidateProfileUpdate,
)

router = APIRouter(prefix="/candidate", tags=["Candidate"])


@router.get("/setup-check")
def candidate_setup_check():
    return {
        "message": "Candidate endpoint is ready",
        "sprint": "Sprint 1 - Candidate Module",
    }


@router.get("/profile/{candidate_id}", response_model=CandidateProfileResponse)
def get_candidate_profile(candidate_id: int, db: Session = Depends(get_db)):
    candidate_profile = get_candidate_profile_by_id(db, candidate_id)

    if not candidate_profile:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found",
        )

    return candidate_profile


@router.put("/profile/{candidate_id}", response_model=CandidateProfileResponse)
def edit_candidate_profile(
    candidate_id: int,
    profile_data: CandidateProfileUpdate,
    db: Session = Depends(get_db),
):
    updated_profile = update_candidate_profile(
        db=db,
        candidate_id=candidate_id,
        profile_data=profile_data,
    )

    if not updated_profile:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found",
        )

    return updated_profile