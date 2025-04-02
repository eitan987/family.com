const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = 'data.json';

let data = {
    tasks: [],
    events: [],
    balances: {
        "אבא": 0,
        "אמא": 0,
        "יהונתן": 0,
        "טל": 0,
        "רתם": 0,
        "איתן": 0,
        "רני": 0
    },
    storeItems: []
};

if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
}

app.get('/data', (req, res) => {
    res.json(data);
});

app.post('/data', (req, res) => {
    data = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});