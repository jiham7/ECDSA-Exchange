const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const addresses = ["0x2dB8B761f469B9c97595270B6B025ADfb54521bb", "0x0AdD44ac1ac4101d1985D0B23E067759750a791b", "0xB18A17276daF8B319220c52ECa5E3Cd13a156C39"];
const keyPair = {
  "0x2dB8B761f469B9c97595270B6B025ADfb54521bb": "0x81edde9b4e4118c86f410dafaf0e89e9cb269271791e0eb61e0a52a6c57d2adb",
  "0x0AdD44ac1ac4101d1985D0B23E067759750a791b": "0x2865f2f67970fa2277c1c029ab6ecb8e6bef9fd78d8bfef2329b5684243ea2a6",
  "0xB18A17276daF8B319220c52ECa5E3Cd13a156C39": "0xdaed1218f7ec52a121469d58af0bcd5a6b7f887f2ec0bdd214ea823944138a26"
};
const balances = {
  "0x2dB8B761f469B9c97595270B6B025ADfb54521bb": 100,
  "0x0AdD44ac1ac4101d1985D0B23E067759750a791b": 50,
  "0xB18A17276daF8B319220c52ECa5E3Cd13a156C39": 75,
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;
  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;
  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`There are currently ${Object.keys(balances).length} public keys.`);
  addresses.forEach(function (item) {
    console.log(`The address ${item} has balance of ${balances[item]}`);
  });
  console.log(`Listening on port ${port}!`);
});
