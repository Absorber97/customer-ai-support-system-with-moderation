import streamlit as st
from frontend.utils import state, logger
from frontend.services import api

def render(language):
    st.header("Customer Query")
    
    generation_type = st.radio(
        "Select query type:",
        ["Generate query about a new product", "Generate a different type of comment", "Generate Inappropriate Comment", "Generate Prompt Injection"],
        format_func=lambda x: {
            "Generate query about a new product": "Generate query about a new product",
            "Generate a different type of comment": "Generate a different type of comment",
            "Generate Inappropriate Comment": "Generate an inappropriate comment (for testing)",
            "Generate Prompt Injection": "Generate a prompt injection attempt (for testing)"
        }.get(x, x)
    )
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Generate New Question"):
            logger.info(f"Generate New Question button clicked. Type: {generation_type}")
            try:
                api.generate_new_question(language, generation_type)
            except Exception as e:
                st.error(f"Failed to generate question: {str(e)}")
                logger.error(f"Failed to generate question: {str(e)}")
    
    with col2:
        is_inappropriate = state.get('is_inappropriate', False)
        injection_result = state.get('injection_result', False)
        submit_button = st.button("Submit", disabled=bool(is_inappropriate or injection_result))
        if submit_button:
            if state.get('customer_query'):
                logger.info("Submit button clicked. Processing query...")
                api.handle_customer_query(language)
            else:
                logger.warning("Attempted to submit without generating a question first")
                st.warning("Please generate a question before submitting.")

    if state.get('current_product_name'):
        st.info(f"Current Product: {state.get('current_product_name')}")
    
    st.subheader("Generated question:")
    st.text_area("", value=state.get('customer_query', ''), height=200, key="generated_question", disabled=True)
    
    display_classification_result()
    display_moderation_result()
    display_injection_result()

def display_classification_result():
    st.subheader("Query Classification")
    classification = state.get('classification')
    logger.info(f"Displaying classification result: {classification}")
    if classification and isinstance(classification, dict):
        st.write(f"Primary Category: {classification.get('primary', 'N/A')}")
        st.write(f"Secondary Category: {classification.get('secondary', 'N/A')}")
    else:
        st.info("No classification available.")
    
    # Add this line for debugging
    st.text(f"Debug - Raw classification data: {classification}")

def display_moderation_result():
    st.subheader("Query Moderation Result")
    moderation_result = state.get('moderation_result')
    if moderation_result:
        with st.expander("Click to view moderation result", expanded=False):
            st.json(moderation_result)
        
        if state.get('is_inappropriate'):
            st.warning("This content has been flagged as potentially inappropriate.")
            st.write("Flagged categories:")
            for category, flagged in moderation_result["categories"].items():
                if flagged:
                    st.write(f"- {category}")
            st.error("Submit button is locked due to inappropriate content.")
        else:
            st.success("This content has passed the moderation check.")

def display_injection_result():
    st.subheader("Injection Detection Result")
    injection_result = state.get('injection_result')
    if injection_result is not None:
        if injection_result:
            st.warning("Potential prompt injection detected.")
            st.error("Submit button is locked due to potential prompt injection.")
        else:
            st.success("No prompt injection detected.")

# Add this at the end of the file
if 'generation_type' not in st.session_state:
    st.session_state.generation_type = "Generate query about a new product"
    api.generate_new_question(st.session_state.get('language', 'English'), st.session_state.generation_type)