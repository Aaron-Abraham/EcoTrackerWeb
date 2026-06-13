import uuid
from datetime import datetime
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

# Initialize FastAPI app
app = FastAPI(
    title="EcoTrack API",
    description="Prototype backend for tracking and reducing carbon footprint.",
    version="1.0.0",
)

# --- Prototype In-Memory Databases ---
# Key: user_id (str) -> Value: dict of user details
users_db: Dict[str, dict] = {}

# Key: activity_log_id (str) -> Value: dict of activity log details
activities_db: Dict[str, dict] = {}


# --- Pydantic Models ---
class UserCreate(BaseModel):
    name: str = Field(default="EcoTracker", description="The name of the user.")
    baseline_footprint: float = Field(
        ..., description="The user's baseline monthly carbon footprint in kg CO2."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Jane Doe",
                "baseline_footprint": 450.0
            }
        }


class UserResponse(BaseModel):
    id: str = Field(..., description="Unique user identifier.")
    name: str = Field(..., description="The name of the user.")
    baseline_footprint: float = Field(..., description="Baseline carbon footprint in kg CO2.")


class ActivityCreate(BaseModel):
    user_id: str = Field(..., description="The ID of the user logging this activity.")
    activity_type: str = Field(
        ..., description="Type of activity. Supported types: 'transport', 'diet', 'energy'."
    )
    value: float = Field(
        ..., description="The raw value of the activity (e.g., miles driven, servings, kWh)."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "paste-user-id-here",
                "activity_type": "transport",
                "value": 15.0
            }
        }


class ActivityLog(BaseModel):
    id: str = Field(..., description="Unique activity log identifier.")
    user_id: str = Field(..., description="Associated user ID.")
    activity_type: str = Field(..., description="Type of the logged activity.")
    value: float = Field(..., description="Input value for the activity.")
    calculated_co2: float = Field(..., description="Calculated CO2 footprint in kg.")
    timestamp: str = Field(..., description="ISO 8601 formatted timestamp of the log.")


class CarbonRecommendation(BaseModel):
    activity_type: str = Field(..., description="The category this recommendation targets.")
    recommendation_text: str = Field(..., description="Actionable tip to reduce carbon footprint.")
    potential_savings: float = Field(..., description="Estimated savings in kg CO2.")


class DashboardResponse(BaseModel):
    user_id: str = Field(..., description="The user ID.")
    baseline_footprint: float = Field(..., description="Baseline monthly footprint in kg CO2.")
    total_co2_this_month: float = Field(..., description="Sum of logged CO2 emissions this month in kg CO2.")
    remaining_budget: float = Field(..., description="Baseline footprint minus logged emissions in kg CO2.")
    recent_activities: List[ActivityLog] = Field(default=[], description="List of recent activity logs.")
    recommendations: List[CarbonRecommendation] = Field(default=[], description="Tailored carbon saving tips.")


# --- Mock Carbon Engine Emission Factors ---
# Hardcoded emission factors representing kg CO2 per unit
EMISSION_FACTORS = {
    "transport": 0.4,  # e.g., 0.4 kg CO2 per mile driven
    "diet": 1.2,       # e.g., 1.2 kg CO2 per meat-heavy meal serving
    "energy": 0.8,     # e.g., 0.8 kg CO2 per kWh of electricity
}


# --- API Endpoints ---

@app.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate):
    """
    Create a new EcoTrack user with a monthly baseline carbon footprint.
    """
    user_id = str(uuid.uuid4())
    user_record = {
        "id": user_id,
        "name": user_data.name,
        "baseline_footprint": user_data.baseline_footprint,
    }
    users_db[user_id] = user_record
    return UserResponse(**user_record)


@app.post("/activities/", response_model=ActivityLog, status_code=status.HTTP_201_CREATED)
def log_activity(activity_data: ActivityCreate):
    """
    Log an activity for a user, calculate carbon emissions using the Mock Carbon Engine,
    and save the record in-memory.
    """
    user_id = activity_data.user_id
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found."
        )

    activity_type = activity_data.activity_type.lower().strip()
    value = activity_data.value

    # Mock Carbon Engine calculation using a match/switch statement (Python 3.10+)
    match activity_type:
        case "transport":
            # 1 mile driven = 0.4 kg CO2
            emission_factor = EMISSION_FACTORS["transport"]
        case "diet":
            # 1 serving meat/processed food = 1.2 kg CO2
            emission_factor = EMISSION_FACTORS["diet"]
        case "energy":
            # 1 kWh = 0.8 kg CO2
            emission_factor = EMISSION_FACTORS["energy"]
        case _:
            # Default fallback emission factor
            emission_factor = 0.1

    calculated_co2 = round(value * emission_factor, 2)
    activity_id = str(uuid.uuid4())
    timestamp_str = datetime.now().isoformat()

    activity_record = {
        "id": activity_id,
        "user_id": user_id,
        "activity_type": activity_type,
        "value": value,
        "calculated_co2": calculated_co2,
        "timestamp": timestamp_str,
    }

    # Save to mock database
    activities_db[activity_id] = activity_record

    return ActivityLog(**activity_record)


@app.get("/dashboard/{user_id}", response_model=DashboardResponse)
def get_dashboard(user_id: str):
    """
    Retrieve user carbon metrics including total monthly footprint, baseline comparison,
    recent logged activities, and custom recommendations.
    """
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found."
        )

    user = users_db[user_id]
    baseline = user["baseline_footprint"]

    # Filter activities matching the user_id
    user_activities = [
        ActivityLog(**act) for act in activities_db.values() if act["user_id"] == user_id
    ]

    # Calculate total CO2 for the month
    total_co2 = sum(activity.calculated_co2 for activity in user_activities)
    total_co2 = round(total_co2, 2)
    remaining_budget = round(baseline - total_co2, 2)

    # Sort recent activities: latest first
    user_activities.sort(key=lambda x: x.timestamp, reverse=True)

    # Generate custom recommendations based on user's highest activity sources
    recommendations = []
    
    # Calculate emissions per activity type
    transport_co2 = sum(a.calculated_co2 for a in user_activities if a.activity_type == "transport")
    diet_co2 = sum(a.calculated_co2 for a in user_activities if a.activity_type == "diet")
    energy_co2 = sum(a.calculated_co2 for a in user_activities if a.activity_type == "energy")

    if transport_co2 > 0:
        recommendations.append(
            CarbonRecommendation(
                activity_type="transport",
                recommendation_text="Consider walking, cycling, or using public transport for trips under 5 miles.",
                potential_savings=round(transport_co2 * 0.3, 2)
            )
        )
    else:
        recommendations.append(
            CarbonRecommendation(
                activity_type="transport",
                recommendation_text="Keep up the good work! Walking and riding bikes keep your transport footprint low.",
                potential_savings=0.0
            )
        )

    if diet_co2 > 0:
        recommendations.append(
            CarbonRecommendation(
                activity_type="diet",
                recommendation_text="Try replacing one meat meal daily with a plant-based alternative to reduce emissions.",
                potential_savings=round(diet_co2 * 0.25, 2)
            )
        )
        
    if energy_co2 > 0:
        recommendations.append(
            CarbonRecommendation(
                activity_type="energy",
                recommendation_text="Turn off idle appliances and adjust your thermostat by 2 degrees to conserve energy.",
                potential_savings=round(energy_co2 * 0.15, 2)
            )
        )

    return DashboardResponse(
        user_id=user_id,
        baseline_footprint=baseline,
        total_co2_this_month=total_co2,
        remaining_budget=remaining_budget,
        recent_activities=user_activities[:10],  # Return up to 10 recent activities
        recommendations=recommendations,
    )
