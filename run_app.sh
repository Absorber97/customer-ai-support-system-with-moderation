#!/bin/bash

echo "Starting Node.js server..."
npm start &

# Wait for the server to start (increase this if needed)
sleep 10

echo "Starting Streamlit app..."
PYTHONPATH=$PYTHONPATH:$(pwd) streamlit run frontend/streamlit_app.py