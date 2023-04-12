'use strict';

module.exports = {
    "plugins": [],
    "recurseDepth": 10,
    "source": {
        "include": ["auth.js", "models.js"]
    },
    "sourceType": "module",
    "tags": {
        "allowUnknownTags": true,
        "dictionaries": ["jsdoc","closure"]
    },
    "templates": {
        "cleverLinks": false,
        "monospaceLinks": false
    }
};