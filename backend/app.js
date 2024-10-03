const express = require('express');
const cors = require('cors');
const customerServiceRoutes = require('./routes/customerService');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', customerServiceRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});