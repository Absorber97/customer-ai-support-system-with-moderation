import streamlit as st
import pandas as pd
import altair as alt
from frontend.utils import state
from frontend.services import api
import json
import os

def render():
    st.header("Rubric Evaluation Results")

    test_cases = load_rubric_test_cases()
    selected_test_cases = st.multiselect(
        "Select test cases to run",
        options=list(test_cases.keys()),
        default=list(test_cases.keys())[:5]  # Default to first 5 test cases
    )

    if st.button("Run Rubric Evaluation"):
        with st.spinner("Running rubric evaluation..."):
            try:
                results = api.run_rubric_evaluation([test_cases[key] for key in selected_test_cases])
                state.set('rubric_evaluation_results', results)
            except Exception as e:
                st.error(f"Failed to run rubric evaluation: {str(e)}")
                return

    results = state.get('rubric_evaluation_results')
    if results:
        display_rubric_evaluation_results(results)

def display_rubric_evaluation_results(results):
    st.subheader("Overall Results")
    df = pd.DataFrame([
        {
            'Case': i + 1,
            'Rubric Score': r['evaluation']['rubricScore'],
            'Based on Context': r['evaluation']['detailedResults']['basedOnContext'],
            'Includes Extra Info': r['evaluation']['detailedResults']['includesExtraInfo'],
            'Has Disagreement': r['evaluation']['detailedResults']['hasDisagreement'],
            'Questions Asked': r['evaluation']['detailedResults']['questionsAsked'],
            'Questions Addressed': r['evaluation']['detailedResults']['questionsAddressed']
        } for i, r in enumerate(results)
    ])

    st.dataframe(df)

    chart = alt.Chart(df).mark_bar().encode(
        x='Case:O',
        y='Rubric Score:Q',
        color='Rubric Score:Q'
    ).properties(width=600)

    st.altair_chart(chart)

    st.subheader("Detailed Results")
    for i, result in enumerate(results):
        with st.expander(f"Case {i + 1}"):
            st.write("Customer Message:", result['customerMsg'])
            if 'context' in result:
                st.write("Context:", result['context'])
            else:
                st.write("Context: Not provided")
            st.write("Generated Answer:", result['generatedAnswer'])
            st.write("Rubric Evaluation:")
            st.write(f"Rubric Score: {result['evaluation']['rubricScore']}")
            st.write(f"Rubric Explanation: {result['evaluation']['rubricExplanation']}")
            st.write("Ideal Comparison:", result['idealComparison'])
            st.write("Detailed Results:")
            for key, value in result['evaluation']['detailedResults'].items():
                if key != 'explanations':
                    st.write(f"{key.replace('_', ' ').title()}: {value}")
            st.write("Explanations:")
            for explanation in result['evaluation']['detailedResults']['explanations']:
                st.write(explanation)

def load_rubric_test_cases():
    file_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'rubric_test_cases.json')
    try:
        with open(file_path, 'r') as file:
            test_cases = json.load(file)
        return test_cases
    except FileNotFoundError:
        st.error(f"Rubric test cases file not found: {file_path}")
        return {}
    except json.JSONDecodeError:
        st.error(f"Invalid JSON in rubric test cases file: {file_path}")
        return {}