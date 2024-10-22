const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-2'
});

const CognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

const login = async (username: string, password: string) => {
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: '4ira3f10i98a41ke14fpf2j724', // Your Cognito User Pool App Client ID
        // ClientId: '1ijd6tdt12a81rk8fcapp90ui1', // Your Cognito User Pool App Client ID
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
        },
    };

    try {
        const response = await CognitoIdentityServiceProvider.initiateAuth(params).promise();
        console.log('Authentication successful:', response);
        return response.AuthenticationResult; // Contains tokens like IdToken, AccessToken, and RefreshToken
    } catch (error) {
        console.error('Error during authentication:', error);
        throw error;
    }
};


export default {
    login
}