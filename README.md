# Electronics Store AI Customer Service

This project implements an AI-powered customer service system for an electronics store using Node.js, Python, Streamlit, and OpenAI's GPT model. It demonstrates a full-stack application with a RESTful API backend and an interactive frontend, showcasing modern web development practices and AI integration.

## Features

- Generate random customer queries about electronics products
- Process customer queries and generate appropriate responses
- Multi-language support (English, Spanish, French, German, Italian)
- Sentiment analysis of customer comments
- Email subject and body generation for customer service responses
- Responsive web interface for easy interaction

## Tech Stack

- **Backend**: Node.js with Express.js
- **Frontend**: Python with Streamlit
- **AI Integration**: OpenAI GPT-3.5 Turbo
- **Database**: JSON files (simulating a database for simplicity)
- **API**: RESTful architecture
- **Development Tools**: npm, pip, nodemon

## Architecture

The application follows a client-server architecture:

1. **Backend (Node.js)**:
   - Handles API requests from the frontend
   - Communicates with the OpenAI API
   - Processes data and generates responses
   - Implements modular design with separate routes, controllers, and services

2. **Frontend (Streamlit)**:
   - Provides an interactive web interface
   - Sends requests to the backend API
   - Displays generated questions and responses

3. **AI Integration**:
   - Utilizes OpenAI's GPT-3.5 Turbo model for natural language processing
   - Generates human-like responses based on customer queries

## Prerequisites

- Node.js (v14 or later)
- Python (v3.7 or later)
- OpenAI API key

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/Absorber97/electronics-store-ai-customer-service.git
   cd electronics-store-ai-customer-service
   ```

2. Install Node.js dependencies:
   ```
   npm install
   ```

3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up your OpenAI API key:
   - Rename `.env.example` to `.env`
   - Add your OpenAI API key to the `.env` file:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```

## Running the Application

Use the provided script to run both the backend server and the Streamlit frontend:

```
npm run app
```

This will start the Node.js server and launch the Streamlit app in your default web browser.

## Usage

1. Select your preferred language from the dropdown menu.
2. Choose between "Change Product" or "Change Comment Type" to generate a new customer query.
3. Click "Generate New Question" to get a random customer query.
4. The generated query will appear in the text area on the left side of the interface.
5. Click "Submit" to process the query and generate a customer service response.
6. The response, including the email subject and body, will appear on the right side of the interface.

## Project Structure

```
electronics-store-ai-customer-service/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── app.js
├── frontend/
│   └── streamlit_app.py
├── data/
│   ├── categories.json
│   ├── detailed_descriptions.json
│   └── products.json
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── requirements.txt
└── run_app.sh
```

## Key Implementation Details

1. **RESTful API**: The backend implements a RESTful API using Express.js, following best practices for route organization and controller separation.

2. **Middleware**: Custom error handling middleware is implemented to manage and respond to errors consistently across the application.

3. **Environment Variables**: Sensitive information like API keys is managed using environment variables for enhanced security.

4. **Modular Architecture**: The backend is organized into separate modules (routes, controllers, services) for improved maintainability and scalability.

5. **Asynchronous Programming**: Async/await is used for handling asynchronous operations, improving code readability and error handling.

6. **Cross-Origin Resource Sharing (CORS)**: CORS is implemented to allow the frontend to communicate with the backend securely.

7. **Natural Language Processing**: The application leverages OpenAI's GPT model for advanced natural language understanding and generation.

8. **Multi-language Support**: The system can handle queries and generate responses in multiple languages, showcasing its versatility.

9. **Interactive Frontend**: Streamlit is used to create an interactive and responsive web interface without the need for complex frontend development.

10. **Data Persistence**: JSON files are used to simulate a database, demonstrating data handling and persistence concepts.

## Future Enhancements

- Implement user authentication and authorization
- Integrate a proper database system (e.g., MongoDB, PostgreSQL)
- Add unit and integration tests for improved reliability
- Implement caching mechanisms for improved performance
- Dockerize the application for easier deployment and scaling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
