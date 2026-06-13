import requests
import sys

BASE_URL = "https://ecotrack-backend-844507776150.us-central1.run.app"

def run_tests():
    print("==================================================")
    print("      EcoTrack Live GCP Deployment Test           ")
    print("==================================================")
    print(f"Base URL: {BASE_URL}\n")

    # 1. Test User Creation
    print("1. Testing POST /users/ on GCP...")
    user_payload = {
        "name": "GCP Cloud Tester",
        "baseline_footprint": 400.0
    }
    try:
        response = requests.post(f"{BASE_URL}/users/", json=user_payload)
        if response.status_code != 201:
            print(f"[-] FAILED: User creation failed with status {response.status_code}")
            print(response.text)
            sys.exit(1)
        
        user_data = response.json()
        user_id = user_data["id"]
        print(f"[+] SUCCESS: Created user '{user_data['name']}' with ID {user_id}\n")

        # 2. Test Logging Activity
        print("2. Testing POST /activities/ on GCP...")
        activity_payload = {
            "user_id": user_id,
            "activity_type": "transport",
            "value": 25.0
        }
        act_response = requests.post(f"{BASE_URL}/activities/", json=activity_payload)
        if act_response.status_code != 201:
            print(f"[-] FAILED: Logging activity failed with status {act_response.status_code}")
            print(act_response.text)
            sys.exit(1)
        
        act_data = act_response.json()
        # 25.0 miles * 0.4 emission factor = 10.0 kg CO2
        print(f"[+] SUCCESS: Logged activity. Calculated CO2: {act_data['calculated_co2']} kg\n")

        # 3. Test Dashboard Aggregation
        print("3. Testing GET /dashboard/{user_id} on GCP...")
        dash_response = requests.get(f"{BASE_URL}/dashboard/{user_id}")
        if dash_response.status_code != 200:
            print(f"[-] FAILED: Dashboard request failed with status {dash_response.status_code}")
            print(dash_response.text)
            sys.exit(1)
        
        dash_data = dash_response.json()
        print(f"[+] SUCCESS: Dashboard returned total carbon usage: {dash_data['total_co2_this_month']} kg")
        print(f"[+] SUCCESS: Remaining carbon budget: {dash_data['remaining_budget']} kg")
        print(f"[+] SUCCESS: Recommendations count: {len(dash_data['recommendations'])}")
        
        print("\n==================================================")
        print("      GCP LIVE DEPLOYMENT VERIFICATION PASSED      ")
        print("==================================================")
    except Exception as e:
        print(f"[-] FAILED: Connection error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
