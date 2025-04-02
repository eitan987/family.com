const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = 'data.json';

let data = {};
if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
}

app.get('/data/:familyId', (req, res) => {
    const { familyId } = req.params;
    if (data[familyId]) {
        res.json(data[familyId]);
    } else {
        data[familyId] = { tasks: [], events: [], balances: {}, storeItems: [] };
        res.json(data[familyId]);
    }
});

app.post('/data/:familyId', (req, res) => {
    const { familyId } = req.params;
    data[familyId] = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});