const base64 = require('base-64');
const fetch = require('node-fetch');

const basicAuth = `Basic ${base64.encode('c8886c0b-174a-4515-aafe-d485f62fa419' + ':' + 'test-7SaWLHb9gU5CFZ7SjTdawmVVWJLTd2RgWT9hVNdHVHYzXnJjrgQXKitB1QPpEt3w')}`;

const headers = {
  'Authorization': basicAuth,
  'Content-Type': 'application/json'
};

const counterpartyPostData = {
  "name": "Kenner, Bach and Ledeen",
  "accounts": [
    {
      "account_type": "checking",
      "routing_details": [
        {
          "routing_number_type": "aba",
          "routing_number": "121141822"
        }
      ],
      "account_details": [
        {
          "account_number": "123456789"
        }
      ]
    }
  ]
};

const writePaymentOrderData = function (internalAccountId, externalAccountId) {
  return {
    "type": "ach",
    "amount": 1000,
    "direction": "credit",
    "currency": "USD",
    "originating_account_id": internalAccountId,
    "receiving_account_id": externalAccountId
  }
}

const quickstart = async () => {
  // ping modern treasury api
  const pingPromise = await fetch("https://app.moderntreasury.com/api/ping", { headers });
  const pong = await pingPromise.json();

  console.log('Ping', pong);

  // get internal accounts and select first account id
  const internalAccountsPromise = await fetch("https://app.moderntreasury.com/api/internal_accounts", { headers });
  const internalAccounts = await internalAccountsPromise.json();
  const internalAccountId = internalAccounts[0].id;

  console.log('Internal Account ID', internalAccountId);

  // post a counterparty and save external account id response
  const counterPartyPromise = await fetch('https://app.moderntreasury.com/api/counterparties', {
      method: 'POST',
      headers,
      body: JSON.stringify(counterpartyPostData)
    });
  const counterPartyResponse = await counterPartyPromise.json();
  const externalAccountId = counterPartyResponse.accounts[0].id

  console.log('External Account ID', externalAccountId);

  // create payment order data with internal and external account ids
  const paymentOrderPostData = writePaymentOrderData(internalAccountId, externalAccountId);
  // post new payment order
  const paymentOrderPromise = await fetch('https://app.moderntreasury.com/api/payment_orders', {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentOrderPostData)
    });
  const paymentOrder = await paymentOrderPromise.json();

  console.log('Created payment order with id', paymentOrder.id);

  return paymentOrder;
}

quickstart();
