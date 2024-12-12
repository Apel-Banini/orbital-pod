const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const Joi = require('joi');
const db = require('../services/db');

// File upload configuration
const upload = multer({ dest: 'storage/uploads/' }); // Updated to store files in a structured directory

// Schema Validation
const portalSchema = Joi.object({
	name: Joi.string().required(),
	url: Joi.string()
		.uri()
		.required(),
});

// Test Route
router.get('/', (req, res) => {
	res.send({ message: 'API is working!' });
});

// File Management
router.post('/files', upload.single('file'), (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded.' });
	}
	res.status(201).json({
		message: 'File uploaded successfully!',
		file: {
			originalName: req.file.originalname,
			size: req.file.size,
			path: req.file.path,
		},
	});
});

router.get('/files/:id', (req, res) => {
	const filePath = `storage/uploads/${req.params.id}`;
	fs.access(filePath, fs.constants.F_OK, err => {
		if (err) {
			return res.status(404).json({ error: `File with ID ${req.params.id} not found.` });
		}
		res.download(filePath);
	});
});

// CRUD Operations for Portals

// Get all portals with optional pagination and search
router.get('/portals', (req, res) => {
	const DEFAULT_LIMIT = process.env.DEFAULT_LIMIT || 10;
	const { page = 1, limit = DEFAULT_LIMIT, q } = req.query;
	const offset = (page - 1) * limit;

	let query = 'SELECT * FROM portals';
	const params = [];

	if (q) {
		query += ' WHERE name LIKE ?';
		params.push(`%${q}%`);
	}

	query += ' LIMIT ? OFFSET ?';
	params.push(parseInt(limit), offset);

	db.all(query, params, (err, rows) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.json(rows);
	});
});

// Create a new portal
router.post('/portals', (req, res) => {
	const { error } = portalSchema.validate(req.body);
	if (error) {
		return res.status(400).json({ error: error.details[0].message });
	}

	const { name, url } = req.body;
	db.run('INSERT INTO portals (name, url) VALUES (?, ?)', [name, url], function(err) {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.status(201).json({ id: this.lastID, name, url });
	});
});

// Update a portal by ID
router.put('/portals/:id', (req, res) => {
	const { error } = portalSchema.validate(req.body);
	if (error) {
		return res.status(400).json({ error: error.details[0].message });
	}

	const { name, url } = req.body;
	db.run('UPDATE portals SET name = ?, url = ? WHERE id = ?', [name, url, req.params.id], function(err) {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		if (this.changes === 0) {
			return res.status(404).json({ error: 'Portal not found.' });
		}
		res.status(200).json({ id: req.params.id, name, url });
	});
});

// Delete a portal by ID
router.delete('/portals/:id', (req, res) => {
	db.run('DELETE FROM portals WHERE id = ?', req.params.id, function(err) {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		if (this.changes === 0) {
			return res.status(404).json({ error: 'Portal not found.' });
		}
		res.status(204).send();
	});
});

// Error Handling Middleware
router.use((err, req, res, next) => {
	console.error(err.stack);
	const isDev = process.env.NODE_ENV === 'development';
	res.status(500).json({
		error: isDev ? err.message : 'Internal server error.',
	});
});

module.exports = router;
