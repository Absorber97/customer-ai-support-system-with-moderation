import streamlit as st
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

st.set_page_config(page_title="Electronics Store AI Customer Service", layout="wide")

st.title("Electronics Store AI Customer Service")
st.caption("Moderation-Focused Version")

# Display support agent and store information as badges
col1, col2 = st.columns(2)
with col1:
    st.markdown("**Support Agent:** :male-technologist: Alex")
with col2:
    st.markdown("**Store:** :shopping_trolley: TechWorld")

# Language selection at the top
language = st.selectbox("Language", ["English", "Spanish", "French", "German", "Italian"])

# Create two columns for Question and Answer
query_col, response_col = st.columns(2)

with query_col:
    st.header("Customer Query")
    
    generation_type = st.radio(
        "Select query type:",
        ["Change Product", "Change Comment Type", "Generate Inappropriate Comment", "Prompt Injection Test"],
        format_func=lambda x: {
            "Change Product": "Generate query about a new product",
            "Change Comment Type": "Generate a different type of comment",
            "Generate Inappropriate Comment": "Generate an inappropriate comment (for testing)",
            "Prompt Injection Test": "Test prompt injection detection"
        }.get(x, x)
    )
    
    if st.button("Generate New Question"):
        with st.spinner("Generating new question..."):
            response = requests.get(f"http://localhost:3000/api/generate-question?language={language}&type={generation_type}")
            if response.status_code == 200:
                data = response.json()
                st.session_state.customer_query = data["question"]
                st.session_state.current_product_name = data.get("productName", "N/A")
                st.success("New question generated!")
                
                # Display current product information
                if 'current_product_name' in st.session_state:
                    st.info(f"Current Product: {st.session_state.current_product_name}")
                
                st.subheader("Generated question:")
                st.text_area("", value=st.session_state.customer_query, height=200, key="generated_question")
                
                # Display moderation result
                st.subheader("Moderation Result")
                moderation_result = data["moderationResult"]
                st.json(moderation_result)
                
                if moderation_result["flagged"]:
                    st.warning("This content has been flagged as potentially inappropriate.")
                    st.write("Flagged categories:")
                    for category, flagged in moderation_result["categories"].items():
                        if flagged:
                            st.write(f"- {category}")
                else:
                    st.success("This content has passed the moderation check.")
                
                if generation_type == "Prompt Injection Test":
                    st.subheader("Injection Detection Result")
                    injection_detected = data.get("injection_detected", False)
                    st.json({"injection_detected": injection_detected})
                    if injection_detected:
                        st.warning("Potential prompt injection detected.")
                    else:
                        st.success("No prompt injection detected.")
            else:
                st.error(f"Failed to generate a new question. Error: {response.text}")

with response_col:
    st.header("Customer Service Response")
    if 'answer' not in st.session_state:
        st.session_state.answer = ""
    if 'subject' not in st.session_state:
        st.session_state.subject = ""
    
    st.subheader("Email Subject:")
    subject_placeholder = st.empty()
    st.subheader("Email Body:")
    answer_placeholder = st.empty()

# Submit button below the columns
if st.button("Submit"):
    if st.session_state.get('customer_query'):
        with st.spinner("Processing your query..."):
            response = requests.post("http://localhost:3000/api/customer-service", json={"query": st.session_state.customer_query, "language": language})
            
            if response.status_code == 200:
                data = response.json()
                st.session_state.subject = data["subject"]
                st.session_state.answer = data["email"]
                st.success("Response generated successfully!")
                
                # Display moderation result
                st.subheader("Moderation Result")
                moderation_result = data["moderationResult"]
                st.json(moderation_result)
                
                if moderation_result["flagged"]:
                    st.warning("This content has been flagged as potentially inappropriate.")
                    st.write("Flagged categories:")
                    for category, flagged in moderation_result["categories"].items():
                        if flagged:
                            st.write(f"- {category}")
                else:
                    st.success("This content has passed the moderation check.")
                
                # Display injection detection result if applicable
                if "injection_detected" in data:
                    st.subheader("Injection Detection Result")
                    injection_detected = data["injection_detected"]
                    st.json({"injection_detected": injection_detected})
                    if injection_detected:
                        st.warning("Potential prompt injection detected.")
                    else:
                        st.success("No prompt injection detected.")
            elif response.status_code == 400:
                st.warning("Input flagged as inappropriate or potential prompt injection detected. Please modify your query.")
                if 'moderationResult' in response.json():
                    st.subheader("Moderation Result")
                    st.json(response.json()['moderationResult'])
                if 'injection_detected' in response.json():
                    st.subheader("Injection Detection Result")
                    st.json({"injection_detected": response.json()['injection_detected']})
            else:
                st.error(f"An error occurred. Please try again. Error: {response.text}")
    else:
        st.warning("Please generate a question before submitting.")

# Always display the subject and answer, whether they're empty or not
subject_placeholder.text_input("Subject", value=st.session_state.get('subject', ''), key="subject_area")
answer_placeholder.text_area("Email Body", value=st.session_state.get('answer', ''), height=400, key="answer_area")

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