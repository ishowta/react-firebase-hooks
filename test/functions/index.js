const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.ping = functions.https.onCall(async () => {
  return 'pong';
});

exports.echo = functions.https.onCall(async (data) => {
  return data;
});
