var paypal = require('paypal-rest-sdk');
var openIdConnect = paypal.openIdConnect;


var auth = { 

// Create a Payment with a Saved Credit Card
connect: function(req, res, next) { 
//set configs for openid_client_id and openid_client_secret if they are different from your
//usual client_id and secret. openid_redirect_uri is required
paypal.configure({
    'mode': 'sandbox',
    'openid_client_id': 'AX1oTsubDwtFmBEGa7J6UsC0lBh244uz3JY7KtPG1nyDLavSJv6xSzWOJXx8Kd6rgHKVvioPDqUnji42',
    'openid_client_secret': 'EO3NAPwXDyStsT5QSvU9Pim-uy97YCChtVgkZDdVowTHt1OZpvlGM3QYL5wm-oU2oCT55wPy1CtqrgOg',
    'openid_redirect_uri': 'https://localhost:8181/'
});

// Login url
console.log(openIdConnect.authorizeUrl({'scope': 'openid profile'}));

// With Authorizatiion code
openIdConnect.tokeninfo.create("Replace with authorize code", function (error, tokeninfo) {
    if (error) {
        console.log(error); 
        return (next(error));
    } else {
        openIdConnect.userinfo.get(tokeninfo.access_token, function (error, userinfo) {
            if (error) {
                console.log(error);
                return (next(error));
            } else {
                console.log(tokeninfo);
                console.log(userinfo);
                // Logout url
                console.log(openIdConnect.logoutUrl({'id_token': tokeninfo.id_token }));
                next();
            }
        });
    }
});

// With Refresh token
openIdConnect.tokeninfo.refresh("Replace with refresh_token", function (error, tokeninfo) {
    if (error) {
        console.log(error);
        return (next(error));
    } else {
        openIdConnect.userinfo.get(tokeninfo.access_token, function (error, userinfo) {
            if (error) {
                console.log(error);
                 return (next(error));
            } else {
                console.log(tokeninfo);
                console.log(userinfo);
                next();
            }
        });
    }
});

}
}

module.exports = auth;