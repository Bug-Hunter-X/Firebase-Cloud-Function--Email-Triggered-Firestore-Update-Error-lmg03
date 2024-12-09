const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.processEmail = functions.https.onCall(async (data, context) => {
  // Validate user input
  if (!data.email || !data.userId || !data.updateData) {
    console.error('Invalid input data:', data);
    throw new functions.https.HttpsError('invalid-argument', 'Missing required data');
  }

  try {
    const userDocRef = db.collection('users').doc(data.userId);
    // check if user exists
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      console.log('User document does not exist:', data.userId);
      return null;
    }

    // Update the user document
    await userDocRef.update(data.updateData);
    console.log('User document updated successfully:', data.userId);
    return { message: 'User document updated successfully' };
  } catch (error) {
    console.error('Error updating user document:', error);
    // Handle specific error types and provide more informative error messages
    if (error.code === 6) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    } else if (error.code === 13) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid data provided');
    } else {
      throw new functions.https.HttpsError('internal', 'Unexpected error');
    }
  }
});