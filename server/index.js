const SHA256 = require('js-sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;


// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const publicKeys = {}
const keyPair = {};
const balances = {};
const addresses = [];
for(let i=0; i<3; i++){
  const key = ec.genKeyPair();

  // Issue is here
  const publicKey = key.getPublic().encode('hex');

  const publicKeyX = key.getPublic().x.toString(16);
  const publicKeyY = key.getPublic().y.toString(16);
  const tuple = [publicKeyX, publicKeyY]
  console.log("X: " + publicKeyX);
  console.log("Y: " + publicKeyY);
  const privateKey = key.getPrivate().toString(16);

  publicKeys[publicKey] = tuple;
  addresses.push(publicKey);
  keyPair[publicKey] = privateKey;

  balances[publicKey] = 100 - 25*i;
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
