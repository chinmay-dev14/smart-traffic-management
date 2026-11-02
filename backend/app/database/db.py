import sqlite3
import os
from pathlib import Path
from datetime import datetime

DB_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "traffic.db"

def get_db():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Traffic History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS traffic_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        intersection_id TEXT NOT NULL,
        direction TEXT NOT NULL,
        vehicle_count INTEGER NOT NULL,
        cars INTEGER DEFAULT 0,
        buses INTEGER DEFAULT 0,
        trucks INTEGER DEFAULT 0,
        motorcycles INTEGER DEFAULT 0,
        bicycles INTEGER DEFAULT 0,
        density_level TEXT NOT NULL,
        congestion_index REAL NOT NULL,
        queue_length INTEGER NOT NULL,
        waiting_time_sec REAL NOT NULL
    )
    """)

    # 2. Signal History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS signal_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        intersection_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        active_direction TEXT NOT NULL,
        green_duration_sec REAL NOT NULL,
        queue_cleared INTEGER DEFAULT 0,
        ai_reasoning TEXT
    )
    """)

    # 3. Emergency Events
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emergency_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        vehicle_type TEXT NOT NULL,
        intersection_id TEXT NOT NULL,
        direction TEXT NOT NULL,
        response_time_sec REAL NOT NULL,
        clearance_duration_sec REAL NOT NULL,
        status TEXT NOT NULL
    )
    """)

    # 4. Predictions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        intersection_id TEXT NOT NULL,
        horizon_minutes INTEGER NOT NULL,
        predicted_count INTEGER NOT NULL,
        congestion_level TEXT NOT NULL,
        expected_queue INTEGER NOT NULL,
        expected_wait_sec REAL NOT NULL
    )
    """)

    # 5. Performance Comparison Runs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        mode TEXT NOT NULL,
        avg_travel_time_min REAL NOT NULL,
        avg_queue_length INTEGER NOT NULL,
        avg_intersection_delay_sec REAL NOT NULL,
        vehicle_throughput_per_hr INTEGER NOT NULL,
        fuel_consumption_liters REAL NOT NULL,
        co2_emissions_kg REAL NOT NULL,
        emergency_response_time_min REAL NOT NULL
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
