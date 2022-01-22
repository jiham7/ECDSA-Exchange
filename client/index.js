import "./index.scss";

const server = "http://localhost:3042";
const SHA256 = require('js-sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const privateKey = document.getElementById("private-key").value;
  console.log("clicked");
  const key = ec.keyFromPrivate(privateKey);
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const message = JSON.stringify({
    sender, amount, recipient
  });
  const msgHash = SHA256(message);
  const signature = key.sign(msgHash.toString());
  const body = JSON.stringify({
    message,
    signature: {
      r:signature.r.toString(16),
      s:signature.s.toString(16)
    }
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});
