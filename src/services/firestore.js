const { async } = require('@firebase/util');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceApiKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();


async function test() {
    await getAllDocsFromACollection("users")
}
// test()

async function getAllUsers() {
    return getAllDocsFromACollection("users")
}

async function getAllDocsFromACollection(collectionName) {
    const collectionRef = db.collection(collectionName);
    const allUsers = []
    try {
        const snapshot = await collectionRef.get();
        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            allUsers.push(doc.data())
        });
        return allUsers;
    } catch (error) {
        console.log('Error getting documents', error);
        return error
    }
}

async function addUserToFirestore(userData) {
    try {
        const ref = await db.collection('users').add(userData);
        console.log(`Added user with ID: ${ref.id}`);
        return ref.id;
    } catch (error) {
        console.log('Error adding user: ', error);
        throw error;
    }
}



async function updateCookie(newCookie, email, password) {
    // check if user exists
    let userRef = db.collection('users').where('email', '==', email);
    let userSnapshot = await userRef.get();
    if (!userSnapshot.empty) {
        let user = userSnapshot.docs[0].data();
        // check if password is correct
        let isPasswordCorrect = password === (user.password);
        if (isPasswordCorrect) {
            // update username
            userRef.doc(userSnapshot.docs[0].id).update({ cookie: newCookie });
            return ('cookie updated successfully');
        } else {
            return ('Incorrect password');
        }
    } else {
        return ('User not found');
    }
}



module.exports = { addUserToFirestore, updateCookie, getAllUsers }
