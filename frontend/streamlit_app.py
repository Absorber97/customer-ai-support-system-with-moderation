import streamlit as st
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

st.set_page_config(page_title="Electronics Store AI Customer Service", layout="wide")

st.title("Electronics Store AI Customer Service")

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
    
    generation_type = st.radio("Generation Type", ["Change Product", "Change Comment Type"])
    
    if st.button("Generate New Question") or 'customer_query' not in st.session_state:
        with st.spinner("Generating new question..."):
            response = requests.get(f"http://localhost:3000/api/generate-question?language={language}&type={generation_type}")
            if response.status_code == 200:
                data = response.json()
                st.session_state.customer_query = data["question"]
                st.session_state.current_product_name = data["productName"]
                st.success("New question generated!")
            else:
                st.error("Failed to generate a new question. Please try again.")
    
    customer_query = st.text_area("Generated question:", value=st.session_state.customer_query, height=200)
    
    # Display current product information
    if 'current_product_name' in st.session_state:
        st.info(f"Current Product: {st.session_state.current_product_name}")

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
    if customer_query:
        with st.spinner("Processing your query..."):
            response = requests.post("http://localhost:3000/api/customer-service", json={"query": customer_query, "language": language})
            
            if response.status_code == 200:
                data = response.json()
                st.session_state.subject = data["subject"]
                st.session_state.answer = data["email"]
                st.success("Response generated successfully!")
            else:
                st.error("An error occurred. Please try again.")
    else:
        st.warning("Please generate a question before submitting.")

# Always display the subject and answer, whether they're empty or not
subject_placeholder.text_input("", value=st.session_state.subject, key="subject_area")
answer_placeholder.text_area("", value=st.session_state.answer, height=400, key="answer_area")

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