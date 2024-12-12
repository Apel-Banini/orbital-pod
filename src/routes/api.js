const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Define a simple test route
router.get('/', (req, res) => {
	res.send({ message: 'API is working!' });
});

// Dummy data
const items = [
	{ id: 1, name: 'Item 1', description: 'This is item 1' },
	{ id: 2, name: 'Item 2', description: 'This is item 2' },
];

// Get all items
router.get('/items', (req, res) => {
	res.json(items);
});

// Get a single item by ID
router.get('/items/:id', (req, res) => {
	const id = parseInt(req.params.id, 10);
	const item = items.find(i => i.id === id);
	if (item) {
		res.json(item);
	} else {
		res.status(404).json({ message: 'Item not found' });
	}
});

// Create a new item
router.post('/items', (req, res) => {
	const newItem = {
		id: items.length + 1,
		name: req.body.name,
		description: req.body.description,
	};
	items.push(newItem);
	res.status(201).json(newItem);
});

// Update an existing item
router.put('/items/:id', (req, res) => {
	const id = parseInt(req.params.id, 10);
	const item = items.find(i => i.id === id);
	if (item) {
		item.name = req.body.name;
		item.description = req.body.description;
		res.json(item);
	} else {
		res.status(404).json({ message: 'Item not found' });
	}
});

// Delete an item
router.delete('/items/:id', (req, res) => {
	const id = parseInt(req.params.id, 10);
	const index = items.findIndex(i => i.id === id);
	if (index !== -1) {
		items.splice(index, 1);
		res.status(204).send();
	} else {
		res.status(404).json({ message: 'Item not found' });
	}
});

// Upload an ePub
router.post('/files', upload.single('file'), (req, res) => {
	res.status(201).json({ message: 'File uploaded!', file: req.file });
});

// Retrieve an ePub
router.get('/files/:id', (req, res) => {
	const filePath = `uploads/${req.params.id}`;
	res.download(filePath);
});

module.exports = router;
