import streamlit as st

def initialize_session_state():
    if 'customer_query' not in st.session_state:
        st.session_state.customer_query = ""
    if 'current_product_name' not in st.session_state:
        st.session_state.current_product_name = ""
    if 'moderation_result' not in st.session_state:
        st.session_state.moderation_result = None
    if 'is_inappropriate' not in st.session_state:
        st.session_state.is_inappropriate = False
    if 'injection_result' not in st.session_state:
        st.session_state.injection_result = None

def get(key, default=None):
    return st.session_state.get(key, default)

def set(key, value):
    st.session_state[key] = value