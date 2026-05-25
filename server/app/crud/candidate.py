from sqlalchemy.orm import Session

from app.models.candidate import CandidateProfile
from app.schemas.candidate import CandidateProfileUpdate


def get_candidate_profile_by_id(db: Session, candidate_id: int):
    return (
        db.query(CandidateProfile)
        .filter(CandidateProfile.id == candidate_id)
        .first()
    )


def update_candidate_profile(
    db: Session,
    candidate_id: int,
    profile_data: CandidateProfileUpdate,
):
    candidate_profile = get_candidate_profile_by_id(db, candidate_id)

    if not candidate_profile:
        return None

    update_data = profile_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(candidate_profile, field, value)

    db.commit()
    db.refresh(candidate_profile)

    return candidate_profile