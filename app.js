'use strict';

const express = require('express');
const app = express();
const fontService = require('./services/font.service');

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
	return res.render('index.html');
});

app.get('/icons', (req, res) => {
	return fontService.getIcons()
		.then(icons => res.status(200).send(icons))
		.catch(err => res.status(500).send(err));
});

// ERROR HANDLER
app.use((err, req, res, next)=> {
	console.error(err.stack);
	res.status(err.status || 500).send(err.message);
});

let port = process.env.PORT || 4000;

app.listen(port);

module.exports = app;