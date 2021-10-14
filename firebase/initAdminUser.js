const {firebaseAdmin} = require("./index")
const {roleConstant} = require("../auth/role")
const {insertUser} = require("../datastore/postgres/users")
const {logger} = require('../logger')
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
    logger.debug('Successfully created new user:', userRecord.uid);
    firebaseAdmin.auth().setCustomUserClaims(userRecord.uid, { role: roleConstant.administor }).then(()=>{
        firebaseAdmin.auth().getUser(userRecord.uid)
        .then((userRecord) => {
          // See the UserRecord reference doc for the contents of userRecord.
          logger.debug(`Successfully fetched user data: ${userRecord.toJSON()}`);
          insertUser(userRecord.uid,process.env.account,1,0).then(result=>{
            logger.debug('insert user result:',result)
          })
        })
        .catch((error) => {
          logger.error('Error fetching user data:', error);
        });
    });
  })
  .catch((error) => {
    logger.error('Error creating new user:', error);
  });