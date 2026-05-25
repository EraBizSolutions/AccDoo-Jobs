from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False, default="candidate")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    candidate_profile = relationship(
        "CandidateProfile",
        back_populates="user",
        uselist=False,
    )

    notifications = relationship("Notification", back_populates="user")


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    phone = Column(String(50), nullable=True)
    location = Column(String(120), nullable=True)
    current_role = Column(String(120), nullable=True)
    experience_years = Column(Integer, default=0)

    # MVP: store skills as comma-separated text.
    # Later we can change this to JSONB or a separate skills table.
    skills = Column(Text, nullable=True)

    cv_url = Column(Text, nullable=True)
    parsed_cv_json = Column(Text, nullable=True)
    profile_strength = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="candidate_profile")
    applications = relationship("Application", back_populates="candidate")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(150), nullable=False)
    company_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)

    location = Column(String(120), nullable=True)
    work_mode = Column(String(30), nullable=True)  # remote / onsite / hybrid
    job_type = Column(String(50), nullable=True)  # internship / full-time / part-time

    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)

    required_skills = Column(Text, nullable=True)
    status = Column(String(30), default="active")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    applications = relationship("Application", back_populates="job")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)

    cv_url = Column(Text, nullable=True)
    cover_note = Column(Text, nullable=True)
    screening_answers = Column(Text, nullable=True)

    match_score = Column(Integer, default=0)
    match_label = Column(String(50), nullable=True)
    match_summary = Column(Text, nullable=True)

    status = Column(String(40), default="applied")
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("Job", back_populates="applications")
    candidate = relationship("CandidateProfile", back_populates="applications")
    status_history = relationship("ApplicationStatusHistory", back_populates="application")


class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id = Column(Integer, primary_key=True, index=True)

    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)

    old_status = Column(String(40), nullable=True)
    new_status = Column(String(40), nullable=False)

    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    note = Column(Text, nullable=True)

    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    application = relationship("Application", back_populates="status_history")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=True)
    is_read = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")