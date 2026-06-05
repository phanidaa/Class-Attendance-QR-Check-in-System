const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.csv': 'text/csv'
};

const server = http.createServer((req, res) => {
    // Decode URI to support spaces or Thai characters in paths if any
    let decodedUrl = decodeURIComponent(req.url);
    let filePath = '.' + decodedUrl;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Remove query parameters or hashes
    filePath = filePath.split('?')[0].split('#')[0];

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // SPA Fallback: if file doesn't exist, serve index.html
                fs.readFile('./index.html', (err, htmlContent) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error: index.html not found.');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(htmlContent, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}/`);
    console.log(`Press Ctrl+C to stop the server.`);
});
