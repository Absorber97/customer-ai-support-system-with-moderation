import streamlit as st
from frontend.utils import state

def render():
    st.header("Customer Service Response")
    
    # Display Chain of Thought reasoning
    chain_of_thought = state.get('chain_of_thought', {})
    if chain_of_thought:
        with st.expander("Chain of Thought Reasoning", expanded=False):
            for i, step in enumerate(chain_of_thought.get('steps', []), 1):
                st.subheader(f"Step {i}")
                st.write(step)
            
            st.subheader("Final Answer")
            st.write(chain_of_thought.get('finalAnswer', ''))
    
    st.subheader("Email Subject:")
    st.text_input("", value=state.get('subject', ''), key="subject_area")
    
    st.subheader("Email Body:")
    st.text_area("", value=state.get('answer', ''), height=400, key="answer_area")

    display_response_moderation_result()
    display_response_injection_result()

def display_response_moderation_result():
    st.subheader("Response Moderation Result")
    if state.get('response_moderation_result'):
        with st.expander("Click to view moderation result", expanded=False):
            st.json(state.get('response_moderation_result'))
        
        if state.get('response_is_inappropriate'):
            st.warning("The response has been flagged as potentially inappropriate.")
            st.write("Flagged categories:")
            for category, flagged in state.get('response_moderation_result')["categories"].items():
                if flagged:
                    st.write(f"- {category}")
        else:
            st.success("The response has passed the moderation check.")

def display_response_injection_result():
    st.subheader("Response Injection Detection Result")
    if state.get('response_injection_result') is not None:
        if state.get('response_injection_result'):
            st.warning("Potential prompt injection detected in the response.")
        else:
            st.success("No prompt injection detected in the response.")