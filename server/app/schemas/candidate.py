from typing import Optional

from pydantic import BaseModel


class CandidateProfileResponse(BaseModel):
    id: int
    user_id: int
    phone: Optional[str] = None
    location: Optional[str] = None
    current_role: Optional[str] = None
    experience_years: int = 0
    skills: Optional[str] = None
    cv_url: Optional[str] = None
    profile_strength: int = 0

    class Config:
        from_attributes = True


class CandidateProfileUpdate(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    current_role: Optional[str] = None
    experience_years: Optional[int] = None
    skills: Optional[str] = None
    cv_url: Optional[str] = None
    profile_strength: Optional[int] = None