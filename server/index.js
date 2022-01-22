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

  const publicKey = key.getPublic().encode('hex');
  const publicKeyX = key.getPublic().x.toString(16);
  const publicKeyY = key.getPublic().y.toString(16);
  const tuple = [publicKeyX, publicKeyY]
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
  console.log("here");
  console.log(balances);
  // const {sender, recipient, amount} = req.body;
  const message = JSON.parse(req.body.message);
  console.log(message);
  const msgHash = SHA256(JSON.stringify(message)).toString();
  const sender = message.sender;
  if(!(sender in publicKeys)) {
    throw 'Sender Address is not in the exchange';
  }
  const amount = message.amount;
  const recipient = message.recipient;
  if(!(recipient in balances)) {
    throw 'Recipient Address is not in the exchange';
  }
  // console.log("sender: ", sender);
  // console.log("public keys: ", publicKeys);
  // console.log("x: ", publicKeys[sender]);
  const publicKey = {
    x: publicKeys[sender][0],
    y: publicKeys[sender][1]
  }
  const key = ec.keyFromPublic(sender, 'hex');
  console.log("verify: " + key.verify(msgHash, req.body.signature));
  if(key.verify(msgHash, req.body.signature)){
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
    console.log(balances);
  }
  else {
    throw "Sender is not verified. Transaction canceling";
  }
  // const r = req.body.signature.r;
  // const s = req.body.signature.s;



  // balances[sender] -= amount;
  // balances[recipient] = (balances[recipient] || 0) + +amount;
  // res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`There are currently ${Object.keys(balances).length} public keys.`);
  addresses.forEach(function (item) {
    console.log(`The address ${item}, with private key ${keyPair[item]} has balance of ${balances[item]}`);
  });
  console.log(`Listening on port ${port}!`);
});
