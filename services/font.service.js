'use strict';

const yaml = require('js-yaml');
const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));

let icons = null;

module.exports = {
	getIcons() {
		if (icons) {
			return bluebird.resolve(icons);
		}

		return request.getAsync('https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/src/icons.yml')
			.then(({body}) => yaml.safeLoad(body))
			.catch(err => {
				console.error(err);
				return bluebird.reject(err);
			});
	}
};