const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { WebSocketServer } = require('ws');
const http = require('http');
const cognito = require('amazon-cognito-identity-js');

const app = express();
app.use(cors());
app.use(express.json());
const port = 57002;

const clientId = '4ghgck8ufmsptnjub5utp4bntr'
const userPoolId = 'eu-central-1_OlolmlwzN'

const poolData = {
  UserPoolId: userPoolId,
  ClientId: clientId,
};
const userPool = new cognito.CognitoUserPool(poolData);

app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password } = req.body;
    // Attribute list is required for signing up a new user
    const attributeList = [];

    // Email attribute is required for Cognito User Pool with email as username
    const emailAttribute = new cognito.CognitoUserAttribute({
      Name: 'email',
      Value: email
    });
    attributeList.push(emailAttribute);

    // Sign up the user to the user pool
    userPool.signUp(email, password, attributeList, null, (e, r) => {
      if (e) {
        res.status(400).json({
          message: 'Error signing up',
          error: e.message || 'Cannot sign up the user'
        });
        return;
      }
      const cognitoUser = r.user;
      console.log(cognitoUser)
      res.status(200).json({
        message: 'User successfully signed up',
        // username: cognitoUser.getUsername()
      });
    });
  } catch (err) {
    console.log(e)
    res.status(500).json({
      message: 'Server error',
      error: err.message || 'An unexpected error occurred'
    });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const authenticationData = {
      Username: email,
      Password: password,
    };
    const authenticationDetails = new cognito.AuthenticationDetails(authenticationData);

    const userData = {
      Username: email,
      Pool: userPool,
    };
    const cognitoUser = new cognito.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        res.status(200).json({
          message: 'Authentication successful',
          session: result
        });
      },
      onFailure: (err) => {
        res.status(401).json({
          message: 'Authentication failed',
          error: err.message || 'An error occurred during authentication'
        });
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        res.status(400).json({
          message: 'New password required',
          userAttributes,
          requiredAttributes
        });
        // Note: You should not use hardcoded passwords in production. This example is for demonstration purposes.
        cognitoUser.completeNewPasswordChallenge('12345678', userAttributes, this);
      }
    });
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: 'Server error',
      error: e.message || 'An unexpected error occurred'
    });
  }
});
app.get('/api/test', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})