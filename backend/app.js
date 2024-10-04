const express = require('express');
const cors = require('cors');
const routes = require('./routes');
let errorHandler;

try {
  errorHandler = require('./middleware/errorHandler');
} catch (error) {
  console.warn('Error handler middleware not found. Using default error handling.');
  errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  };
}

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
});

module.exports = app;