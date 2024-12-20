const fs = require('fs');
const fetch = require('node-fetch');

const filePath = '/path/to/your/file.txt';

fs.readFile(filePath, (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    fetch('http://localhost:8080/flux', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream'
        },
        body: data
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});