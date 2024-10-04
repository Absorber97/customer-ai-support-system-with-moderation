import socket
import requests
import time
from frontend.utils import state, logger

# Get your machine's IP address
hostname = socket.gethostname()
LOCAL_IP = socket.gethostbyname(hostname)

BASE_URL = f"http://{LOCAL_IP}:3000/api"

def check_server_status(max_retries=5, delay=2):
    for _ in range(max_retries):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            response.raise_for_status()
            logger.info("Backend server is running and accessible")
            return True
        except requests.RequestException as e:
            logger.warning(f"Backend server not accessible. Retrying in {delay} seconds...")
            time.sleep(delay)
    
    logger.error("Failed to connect to the backend server after multiple attempts")
    return False

def generate_new_question(language, generation_type):
    if not check_server_status():
        raise Exception("Backend server is not accessible")
    
    try:
        logger.info(f"Sending request to generate new question. Language: {language}, Type: {generation_type}")
        response = requests.get(f"{BASE_URL}/generate-question", params={"language": language, "type": generation_type})
        response.raise_for_status()
        data = response.json()
        logger.info(f"Received response from backend: {data}")
        
        state.set('customer_query', data["question"])
        state.set('current_product_name', data.get("productName", "N/A"))
        state.set('moderation_result', data["moderationResult"])
        state.set('is_inappropriate', data["is_flagged"])
        state.set('injection_result', data.get("injectionResult"))
        state.set('classification', data.get("classification"))
        
        logger.info(f"Question generated successfully: {data['question'][:50]}...")
        logger.info(f"Classification: {data.get('classification')}")
        logger.info(f"Moderation result: {data['moderationResult']}")
        logger.info(f"Injection result: {data.get('injectionResult')}")
    except requests.RequestException as e:
        logger.error(f"Failed to generate a new question. Error: {str(e)}")
        raise

def handle_customer_query(language):
    try:
        response = requests.post(f"{BASE_URL}/customer-service", json={"query": state.get('customer_query'), "language": language})
        response.raise_for_status()
        data = response.json()
        state.set('subject', data["subject"])
        state.set('answer', data["email"])
        state.set('response_moderation_result', data["moderationResult"])
        state.set('response_is_inappropriate', data["is_flagged"])
        state.set('response_injection_result', data.get("injectionResult"))
        logger.info("Response generated successfully")
    except requests.RequestException as e:
        logger.error(f"Failed to handle customer query. Error: {str(e)}")
        raise