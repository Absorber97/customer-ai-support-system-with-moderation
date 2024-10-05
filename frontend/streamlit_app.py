import streamlit as st
from frontend.components import customerQuery, customerResponse, languageSelector, evaluationResults, rubricEvaluation
from frontend.utils import state, logger
from frontend.services import api

logger.setup_logging()

def main():
    st.set_page_config(page_title="Electronics Store AI Customer Service", layout="wide")

    st.title("Electronics Store AI Customer Service")
    st.caption("Moderation and Prompt Injection Prevention Version")

    state.initialize_session_state()

    tab1, tab2, tab3 = st.tabs(["Customer Service", "Evaluation", "Rubric Evaluation"])

    with tab1:
        language = languageSelector.render()

        query_col, response_col = st.columns(2)

        with query_col:
            customerQuery.render(language)

        with response_col:
            customerResponse.render()

    with tab2:
        evaluationResults.render()

    with tab3:
        rubricEvaluation.render()

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

if __name__ == "__main__":
    main()