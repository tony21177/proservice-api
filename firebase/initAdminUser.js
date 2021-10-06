const {firebaseAdmin} = require("./index")
const {roleConstant} = require("../auth/role")

firebaseAdmin
  .auth()
  .createUser({
    email: process.env.account,
    emailVerified: true,
    password: process.env.process,
    displayName: 'Administor',
    disabled: false,
  })
  .then((userRecord) => {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully created new user:', userRecord.uid);
    firebaseAdmin.auth().setCustomUserClaims(userRecord.uid, { role: roleConstant.administor }).then(()=>{
        firebaseAdmin.auth.getUser(userRecord.uid)
        .then((userRecord) => {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
        })
        .catch((error) => {
          console.log('Error fetching user data:', error);
        });
    });
  })
  .catch((error) => {
    console.log('Error creating new user:', error);
  });