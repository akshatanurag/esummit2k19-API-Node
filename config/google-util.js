const {
    google
} = require('googleapis');

const googleConfig = {
    clientId: '1095917180689-4stkgcaetihiu37t3mv6i94659rd9hga.apps.googleusercontent.com',
    clientSecret: '5uAyp6LbIRwB7v4A_4Wkraen',
    redirect: 'http://localhost:3000/api/auth/google/callback',
};

const defaultScope = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/userinfo.email',
];

function createConnection() {
    return new google.auth.OAuth2(
        googleConfig.clientId,
        googleConfig.clientSecret,
        googleConfig.redirect
    );
}

function getConnectionUrl(auth) {
    return auth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: defaultScope
    });
}

function getGooglePlusApi(auth) {
    return google.plus({
        version: 'v1',
        auth
    });
}
module.exports = {
    urlGoogle: function urlGoogle() {
        const auth = createConnection();
        const url = getConnectionUrl(auth);
        return url
    },
    //urlGoogle()

    /**
     * This function will generate this url
     * 
     * https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.me%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&response_type=code&client_id=1093232338076-a2dfdlm8q0ncduf0dak39o5un0lrof4h.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fcallback
     *
     * 
     * until and unless we don't change the whole auth redirected thingy
     *  
     */




    /** 
     * Okay so this is the part where we get the function which gets the user data from
     * 
     * ?code=......(this value is sent by google)
     * 
     * Hey, this is shit easy to uderstand don't waste your time reading this XD!!
     * **/
    getGoogleAccountFromCode: async function getGoogleAccountFromCode(code) {
        const auth = createConnection();
        const data = await auth.getToken(code);
        const tokens = data.tokens;

        auth.setCredentials(tokens);
        const plus = getGooglePlusApi(auth);
        const me = await plus.people.get({
            userId: 'me'
        });
        const userGoogleId = me.data.id;
        const userGoogleEmail = me.data.emails && me.data.emails.length && me.data.emails[0].value;
        return {
            id: userGoogleId,
            name: me.data.displayName,
            profilepic: me.data.image.url,
            email: userGoogleEmail,
            tokens: tokens,
            domain: me.data.domain
        };
    }

}