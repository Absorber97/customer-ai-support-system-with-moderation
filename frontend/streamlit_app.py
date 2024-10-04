import streamlit as st
import requests
import os
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Function to generate a new question
def generate_new_question(language, generation_type):
    logger.info(f"Generating new question: Language={language}, Type={generation_type}")
    with st.spinner("Generating new question..."):
        response = requests.get(f"http://localhost:3000/api/generate-question?language={language}&type={generation_type}")
        if response.status_code == 200:
            data = response.json()
            st.session_state.customer_query = data["question"]
            st.session_state.current_product_name = data.get("productName", "N/A")
            st.session_state.moderation_result = data["moderationResult"]
            st.session_state.is_inappropriate = data["is_flagged"]
            st.session_state.injection_result = data.get("injectionResult")
            logger.info(f"Question generated successfully: {data['question'][:50]}...")
            st.success("New question generated!")
        else:
            error_message = f"Failed to generate a new question. Error: {response.text}"
            logger.error(error_message)
            st.error(error_message)
            if response.status_code == 500:
                error_details = response.json()
                st.error(f"Error details: {error_details.get('details', 'No details available')}")
                st.error(f"Stack trace: {error_details.get('stack', 'No stack trace available')}")
                st.error(f"Response: {error_details.get('response', 'No response available')}")

# Initialize session state
if 'customer_query' not in st.session_state:
    st.session_state.customer_query = ""
    st.session_state.current_product_name = ""
    st.session_state.moderation_result = None
    st.session_state.is_inappropriate = False
    st.session_state.injection_result = None

st.set_page_config(page_title="Electronics Store AI Customer Service", layout="wide")

st.title("Electronics Store AI Customer Service")
st.caption("Moderation and Prompt Injection Prevention Version")

# Display support agent and store information as badges
col1, col2 = st.columns(2)
with col1:
    st.markdown("**Support Agent:** :male-technologist: Alex")
with col2:
    st.markdown("**Store:** :shopping_trolley: TechWorld")

# Language selection at the top
language = st.selectbox("Language", ["English", "Spanish", "French", "German", "Italian"])

# Generate a normal comment/question on load
if not st.session_state.customer_query:
    generate_new_question(language, "Change Product")

# Create two columns for Question and Answer
query_col, response_col = st.columns(2)

with query_col:
    st.header("Customer Query")
    
    generation_type = st.radio(
        "Select query type:",
        ["Change Product", "Change Comment Type", "Generate Inappropriate Comment", "Generate Prompt Injection"],
        format_func=lambda x: {
            "Change Product": "Generate query about a new product",
            "Change Comment Type": "Generate a different type of comment",
            "Generate Inappropriate Comment": "Generate an inappropriate comment (for testing)",
            "Generate Prompt Injection": "Generate a prompt injection attempt (for testing)"
        }.get(x, x)
    )
    
    if generation_type == "Generate Prompt Injection":
        logger.info("Prompt Injection generation option selected")
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Generate New Question"):
            logger.info(f"Generate New Question button clicked. Type: {generation_type}")
            generate_new_question(language, generation_type)
    
    with col2:
        submit_button = st.button("Submit", disabled=st.session_state.is_inappropriate or st.session_state.injection_result)
        if submit_button:
            if st.session_state.get('customer_query'):
                logger.info("Submit button clicked. Processing query...")
                with st.spinner("Processing your query..."):
                    response = requests.post("http://localhost:3000/api/customer-service", json={"query": st.session_state.customer_query, "language": language})
                    
                    if response.status_code == 200:
                        data = response.json()
                        st.session_state.subject = data["subject"]
                        st.session_state.answer = data["email"]
                        st.session_state.response_moderation_result = data["moderationResult"]
                        st.session_state.response_is_inappropriate = data["is_flagged"]
                        st.session_state.response_injection_result = data.get("injectionResult")
                        logger.info("Response generated successfully")
                        st.success("Response generated successfully!")
                    elif response.status_code == 400:
                        logger.warning("Input flagged as inappropriate or potential prompt injection")
                        st.warning("Input flagged as inappropriate or potential prompt injection. Please modify your query.")
                        if 'moderationResult' in response.json():
                            st.session_state.response_moderation_result = response.json()['moderationResult']
                        if 'injectionResult' in response.json():
                            st.session_state.response_injection_result = response.json()['injectionResult']
                    else:
                        error_message = f"An error occurred. Please try again. Error: {response.text}"
                        logger.error(error_message)
                        st.error(error_message)
            else:
                logger.warning("Attempted to submit without generating a question first")
                st.warning("Please generate a question before submitting.")

    # Display current product information
    if st.session_state.current_product_name:
        st.info(f"Current Product: {st.session_state.current_product_name}")
    
    st.subheader("Generated question:")
    st.text_area("", value=st.session_state.customer_query, height=200, key="generated_question", disabled=True)
    
    # Display moderation result
    st.subheader("Query Moderation Result")
    if st.session_state.moderation_result:
        with st.expander("Click to view moderation result", expanded=False):
            st.json(st.session_state.moderation_result)
        
        if st.session_state.is_inappropriate:
            st.warning("This content has been flagged as potentially inappropriate.")
            st.write("Flagged categories:")
            for category, flagged in st.session_state.moderation_result["categories"].items():
                if flagged:
                    st.write(f"- {category}")
            st.error("Submit button is locked due to inappropriate content.")
        else:
            st.success("This content has passed the moderation check.")

    # Display injection detection result
    st.subheader("Injection Detection Result")
    if st.session_state.injection_result is not None:
        if st.session_state.injection_result:
            st.warning("Potential prompt injection detected.")
            st.error("Submit button is locked due to potential prompt injection.")
        else:
            st.success("No prompt injection detected.")

with response_col:
    st.header("Customer Service Response")
    
    st.subheader("Email Subject:")
    subject_placeholder = st.empty()
    st.subheader("Email Body:")
    answer_placeholder = st.empty()

    # Display response moderation result
    st.subheader("Response Moderation Result")
    if 'response_moderation_result' in st.session_state:
        with st.expander("Click to view moderation result", expanded=False):
            st.json(st.session_state.response_moderation_result)
        
        if st.session_state.response_is_inappropriate:
            st.warning("The response has been flagged as potentially inappropriate.")
            st.write("Flagged categories:")
            for category, flagged in st.session_state.response_moderation_result["categories"].items():
                if flagged:
                    st.write(f"- {category}")
        else:
            st.success("The response has passed the moderation check.")

    # Display response injection detection result
    st.subheader("Response Injection Detection Result")
    if 'response_injection_result' in st.session_state:
        if st.session_state.response_injection_result:
            st.warning("Potential prompt injection detected in the response.")
        else:
            st.success("No prompt injection detected in the response.")

# Always display the subject and answer, whether they're empty or not
subject_placeholder.text_input("", value=st.session_state.get('subject', ''), key="subject_area")
answer_placeholder.text_area("", value=st.session_state.get('answer', ''), height=400, key="answer_area")

# Add some styling to make it look more like an email
st.markdown("""
<style>
.stButton>button {
    width: 100%;
}
.stTextInput>div>div>input {
    font-size: 18px;
    font-weight: bold;
}
.stTextArea>div>div>textarea {
    font-size: 16px;
    font-family: Arial, sans-serif;
    border: 1px solid #ddd;
    padding: 10px;
}
</style>
""", unsafe_allow_html=True)