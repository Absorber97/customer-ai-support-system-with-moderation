#!/bin/bash

# Start the Node.js server
npm start &

# Wait for the server to start
sleep 5

# Start the Streamlit app
streamlit run frontend/streamlit_app.py