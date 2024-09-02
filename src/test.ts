const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
});

const CognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

export default async (username: string, password: string) => {
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: '1ijd6tdt12a81rk8fcapp90ui1', // Your Cognito User Pool App Client ID
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
