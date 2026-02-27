const admin = require('firebase-admin');
const serviceAccount = require('./focusloop-ecb20-firebase-adminsdk-fbsvc-ef1ef9634d.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
