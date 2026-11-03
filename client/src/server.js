const http = require('http');
const PORT = 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'Unknown Service';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: `Hello from ${SERVICE_NAME}!`,
    timestamp: new Date()
  }));
});

server.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is listening on internal port ${PORT}`);
});