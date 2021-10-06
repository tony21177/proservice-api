const {firebaseAdmin} = require("./index")
const {roleConstant} = require("../auth/role")
const {insertUser} = require("../datastore/postgres/users")

firebaseAdmin
  .auth()
  .createUser({
    email: process.env.account,
    emailVerified: true,
    password: process.env.password,
    displayName: 'Administor',
    disabled: false,
  })
  .then((userRecord) => {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully created new user:', userRecord.uid);
    firebaseAdmin.auth().setCustomUserClaims(userRecord.uid, { role: roleConstant.administor }).then(()=>{
        firebaseAdmin.auth().getUser(userRecord.uid)
        .then((userRecord) => {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
          insertUser(userRecord.uid,process.env.account,1,0).then(result=>{
            console.log('insert user result:',result)
          })
        })
        .catch((error) => {
          console.log('Error fetching user data:', error);
        });
    });
  })
  .catch((error) => {
    console.log('Error creating new user:', error);
  });