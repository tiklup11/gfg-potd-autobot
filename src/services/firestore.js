const { async } = require('@firebase/util');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const cookieHelper = require('../cookie_helper')

const serviceAccount = require('./serviceApiKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();


async function test() {
    await getAllDocsFromACollection("users")
}
// test()

async function getAllUsers(qid) {
    return getAllDocsFromACollection("users", qid)
}

async function getAllDocsFromACollection(collectionName, qid) {
    const collectionRef = db.collection(collectionName);
    const allUsers = []
    try {
        const snapshot = await collectionRef.where("last_ques_id", "!=", qid).get(); //qid, where [last_ques_id]!=qid
        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            allUsers.push(doc.data())
        });
        console.log("all unsolved user len : ", allUsers.length)
        return allUsers;
    } catch (error) {
        console.log('Error getting documents', error);
        return allUsers
    }
}

async function addUserToFirestore(userData) {
    userData['solved_ques_count'] = 0;
    userData['last_ques_id'] = "";
    try {
        const ref = await db.collection('users').add(userData);
        console.log(`Added user with ID: ${ref.id}`);
        return ref.id;
    } catch (error) {
        console.log('Error adding user: ', error);
        throw error;
    }
}

async function updateQuestionCnt(email, qid) {

    try {
        let userRef = db.collection('users').where('email', '==', email);
        let userSnapshot = await userRef.get();
        if (!userSnapshot.empty) {
            let user = userSnapshot.docs[0].data();
            userSnapshot.docs[0].ref.update({ solved_ques_count: FieldValue.increment(1), last_ques_id: qid });
        }
    } catch (error) {

    }
}


//update cookie if expired, needed email and password
async function updateCookie(newCookie, email, password) {
    // check if user exists
    let userRef = db.collection('users').where('email', '==', email);
    let userSnapshot = await userRef.get();
    if (!userSnapshot.empty) {
        let user = userSnapshot.docs[0].data();
        // check if password is correct
        let isPasswordCorrect = password === (user.userpass);
        if (isPasswordCorrect) {
            // update username
            console.log("previous cookie :: ", newCookie)
            newCookie = cookieHelper.convertJSON_CookieToOtherFormat(newCookie)
            console.log("new cookie :: ", newCookie)
            userSnapshot.docs[0].ref.update({ cookie: newCookie });
            return ('cookie updated successfully');
        } else {
            return ('Incorrect password');
        }
    } else {
        return ('User not found');
    }
}



module.exports = { addUserToFirestore, updateCookie, getAllUsers, updateQuestionCnt }
