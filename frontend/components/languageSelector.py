import streamlit as st

def render():
    return st.selectbox("Language", ["English", "Spanish", "French", "German", "Italian"])