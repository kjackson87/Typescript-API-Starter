import * as passport from 'passport';
import * as passportOpenIdConnect from 'passport-openidconnect';

import {Request, Response, NextFunction} from 'express';

const OpenIdStrategy = passportOpenIdConnect.Strategy;

passport.serializeUser((user: any, done: any) => {
  done(undefined, user);
});

passport.deserializeUser((obj: any, done: any) => {
    done(undefined, obj);
});

passport.use(new OpenIdStrategy({
    clientID: process.env.OAUTH_ID,
    clientSecret: process.env.OAUTH_SECRET,
    callbackURL: process.env.OAUTH_CALLBACK,
    authorizationURL: process.env.OAUTH_AUTH_URL,
    tokenURL: process.env.OAUTH_TOKEN_URL,
    userInfoURL: process.env.OAUTH_USERINFO_URL,
    scope: ['email profile'],
},
    (req: any, issuer: any, audience: any, profile: any, accessToken: any, refreshToken: any, params: any, cb: any) => {
        const user: any = {
            id: profile.sub,
            displayName: profile.displayName,
            phoneNumbers: profile.phone_numbers,
            street: profile.street,
            city: profile.city,
            state: profile.state,
            zip: profile.zip,
            givenName: profile.givenName,
            familyName: profile.family_name,
            middleName: profile.middle_name,
            email: profile.email,
            token: params.id_token,
            expiration: profile.exp,
            roles: [],
        };
        return cb(undefined, user);
    }));

/**
 * Login Required middleware.
 */
export let isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
//   if (req.isAuthenticated()) {
//     return next();
//   }
  res.redirect('/auth');
};
