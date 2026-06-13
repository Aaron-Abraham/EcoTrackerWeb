import sys
import time
import requests
from fastapi.testclient import TestClient

# Import the FastAPI app from main.py
try:
    from main import app
except ImportError:
    print("Error: Could not import main.app. Ensure test_backend.py is run inside the 'backend' directory.")
    sys.exit(1)

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("        EcoTrack Backend Verification Test        ")
    print("==================================================\n")

    # 1. Verify User Creation Endpoint (POST /users/)
    print("1. Testing POST /users/...")
    user_payload = {
        "name": "Alex Rivera",
        "baseline_footprint": 500.0
    }
    create_response = client.post("/users/", json=user_payload)
    if create_response.status_code != 201:
        print(f"[-] FAILED: User creation failed with status {create_response.status_code}")
        print(create_response.text)
        sys.exit(1)
    
    user_data = create_response.json()
    user_id = user_data["id"]
    print(f"[+] SUCCESS: Created user '{user_data['name']}' with ID {user_id}\n")

    # 2. Verify Logging Activity Endpoint (POST /activities/)
    print("2. Testing POST /activities/ (Transport, Diet, Energy)...")
    
    # Activity 1: Transport (15 miles)
    transport_payload = {
        "user_id": user_id,
        "activity_type": "transport",
        "value": 15.0
    }
    t_response = client.post("/activities/", json=transport_payload)
    if t_response.status_code != 201:
        print(f"[-] FAILED: Logging transport activity failed with status {t_response.status_code}")
        sys.exit(1)
    t_data = t_response.json()
    # 15.0 miles * 0.4 emission factor = 6.0 kg CO2
    expected_t_co2 = 6.0
    assert abs(t_data["calculated_co2"] - expected_t_co2) < 0.01, f"Expected {expected_t_co2}, got {t_data['calculated_co2']}"
    print(f"[+] SUCCESS: Logged Transport activity of {t_data['value']} miles. Calculated CO2: {t_data['calculated_co2']} kg")

    # Activity 2: Diet (3 meat servings)
    diet_payload = {
        "user_id": user_id,
        "activity_type": "diet",
        "value": 3.0
    }
    d_response = client.post("/activities/", json=diet_payload)
    d_data = d_response.json()
    # 3.0 servings * 1.2 emission factor = 3.6 kg CO2
    expected_d_co2 = 3.6
    assert abs(d_data["calculated_co2"] - expected_d_co2) < 0.01, f"Expected {expected_d_co2}, got {d_data['calculated_co2']}"
    print(f"[+] SUCCESS: Logged Diet activity of {d_data['value']} servings. Calculated CO2: {d_data['calculated_co2']} kg")

    # Activity 3: Energy (100 kWh)
    energy_payload = {
        "user_id": user_id,
        "activity_type": "energy",
        "value": 100.0
    }
    e_response = client.post("/activities/", json=energy_payload)
    e_data = e_response.json()
    # 100.0 kWh * 0.8 emission factor = 80.0 kg CO2
    expected_e_co2 = 80.0
    assert abs(e_data["calculated_co2"] - expected_e_co2) < 0.01, f"Expected {expected_e_co2}, got {e_data['calculated_co2']}"
    print(f"[+] SUCCESS: Logged Energy activity of {e_data['value']} kWh. Calculated CO2: {e_data['calculated_co2']} kg\n")

    # 3. Verify Dashboard Endpoint (GET /dashboard/{user_id})
    print(f"3. Testing GET /dashboard/{user_id}...")
    dash_response = client.get(f"/dashboard/{user_id}")
    if dash_response.status_code != 200:
        print(f"[-] FAILED: Dashboard request failed with status {dash_response.status_code}")
        sys.exit(1)
    
    dash_data = dash_response.json()
    # Total CO2 should be 6.0 + 3.6 + 80.0 = 89.6 kg
    expected_total_co2 = 89.6
    assert abs(dash_data["total_co2_this_month"] - expected_total_co2) < 0.01, f"Expected total {expected_total_co2}, got {dash_data['total_co2_this_month']}"
    expected_remaining = 500.0 - 89.6 # 410.4
    assert abs(dash_data["remaining_budget"] - expected_remaining) < 0.01, f"Expected remaining {expected_remaining}, got {dash_data['remaining_budget']}"
    
    print(f"[+] SUCCESS: Dashboard returned total monthly footprint of {dash_data['total_co2_this_month']} kg CO2")
    print(f"[+] SUCCESS: Remaining budget is {dash_data['remaining_budget']} kg CO2")
    print(f"[+] SUCCESS: Dashboard returned {len(dash_data['recent_activities'])} activities in history")
    print(f"[+] SUCCESS: Dashboard returned {len(dash_data['recommendations'])} custom eco-tips")
    
    print("\nRecommendations received:")
    for rec in dash_data["recommendations"]:
        print(f" - [{rec['activity_type'].upper()}] Tip: {rec['recommendation_text']} (Potential savings: {rec['potential_savings']} kg)")

    print("\n==================================================")
    print("       ALL BACKEND VERIFICATION TESTS PASSED       ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
