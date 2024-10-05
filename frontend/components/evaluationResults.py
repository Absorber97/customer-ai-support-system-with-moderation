import streamlit as st
import pandas as pd
import altair as alt
from frontend.utils import state
from frontend.services import api
import json
import os

def render():
    st.header("Evaluation Results")

    test_cases = load_test_cases()
    selected_test_cases = st.multiselect(
        "Select test cases to run",
        options=list(test_cases.keys()),
        default=list(test_cases.keys())[:5]  # Default to first 5 test cases
    )

    if st.button("Run Evaluation"):
        with st.spinner("Running evaluation..."):
            try:
                results = api.run_evaluation([test_cases[key] for key in selected_test_cases])
                state.set('evaluation_results', results)
            except Exception as e:
                st.error(f"Failed to run evaluation: {str(e)}")
                return

    results = state.get('evaluation_results')
    if results:
        display_evaluation_results(results)

def display_evaluation_results(results):
    st.subheader("Overall Results")
    df = pd.DataFrame([
        {
            'Case': i + 1,
            'Accuracy': float(r['evaluation']['accuracy']),
            'Completeness': float(r['evaluation']['completeness']),
            'Clarity': float(r['evaluation']['clarity']),
            'Tone': float(r['evaluation']['tone']),
            'Conciseness': float(r['evaluation']['conciseness']),
            'Helpfulness': float(r['evaluation']['helpfulness']),
            'Overall': float(r['evaluation']['overall_score'])
        } for i, r in enumerate(results)
    ])

    st.dataframe(df)

    chart = alt.Chart(df.melt('Case', var_name='Metric', value_name='Score')).mark_bar().encode(
        x='Case:O',
        y='Score:Q',
        color='Metric:N',
        column='Metric:N'
    ).properties(width=100)

    st.altair_chart(chart)

    st.subheader("Detailed Results")
    for i, result in enumerate(results):
        with st.expander(f"Case {i + 1}"):
            st.write("Customer Message:", result['customerMsg'])
            st.write("Ideal Answer:", result['idealAnswer'])
            st.write("Generated Answer:", result['generatedAnswer'])
            st.write("Evaluation:")
            for key, value in result['evaluation'].items():
                if key.endswith('_explanation'):
                    st.write(f"{key.replace('_', ' ').title()}:")
                    st.write(value)
                elif key != 'suggestions_for_improvement':
                    st.write(f"{key.replace('_', ' ').title()}: {value}")
            st.write("Suggestions for Improvement:")
            st.write(result['evaluation']['suggestions_for_improvement'])

def load_test_cases():
    file_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'test_cases.json')
    with open(file_path, 'r') as f:
        return json.load(f)