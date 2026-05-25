from typing import Optional

from pydantic import BaseModel


class JobResponse(BaseModel):
    id: int
    title: str
    company_name: str
    description: str
    location: Optional[str] = None
    work_mode: Optional[str] = None
    job_type: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    required_skills: Optional[str] = None
    status: str

    class Config:
        from_attributes = True