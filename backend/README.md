# EcoTrack Backend

This is the prototype FastAPI backend for the EcoTrack application. It tracks user details, calculates carbon footprint emissions via a mock engine, and aggregates total footprints for monthly dashboards.

## Installation & Setup

1. **Prerequisites**: Ensure you have Python 3.10+ installed.
2. **Install Dependencies**:
   Navigate to the `backend` directory and run:
   ```bash
   pip install -r requirements.txt
   ```

## Running the API

To launch the FastAPI server locally, run the following command in the `backend` directory:
```bash
python -m uvicorn main:app --reload
```

The server will start at `http://127.0.0.1:8000`.

## API Documentation

- **Swagger UI**: Visit `http://127.0.0.1:8000/docs` to view the interactive OpenAPI documentation and test the endpoints directly from your browser.
- **ReDoc**: Alternative docs viewable at `http://127.0.0.1:8000/redoc`.

## Key Endpoints

- `POST /users/`: Register a new user.
- `POST /activities/`: Log a carbon activity (transport, diet, energy) and calculate its CO2 footprint.
- `GET /dashboard/{user_id}`: Retrieve monthly totals, activity history, and recommendations.
