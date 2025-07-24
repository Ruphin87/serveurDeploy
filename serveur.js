const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(bodyParser.json());

// Liste des clients WebSocket connectés
let clients = [];

wss.on('connection', (ws) => {
    console.log("Un client WebSocket s'est connecté.");
    clients.push(ws);

    ws.on('close', () => {
        console.log("Client déconnecté.");
        clients = clients.filter(client => client !== ws);
    });
});

// Quand un ESP32 envoie un message (ex: LED allumée)
app.post('/message', (req, res) => {
    const message = req.body.message;
    console.log("Message reçu depuis ESP32 :", message);

    // Envoyer à tous les clients WebSocket connectés (ex: application mobile)
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });

    res.status(200).send("Message reçu et envoyé aux clients.");
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});