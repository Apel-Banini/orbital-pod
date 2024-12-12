const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api'); // Adjust the path if needed

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse incoming JSON payloads

// Mount API routes under /api
app.use('/api', apiRoutes);

// Default route
app.get('/', (req, res) => {
	res.send('Welcome to the Orbital Pod API!');
});

// Error handling
app.use((req, res) => {
	res.status(404).send({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
