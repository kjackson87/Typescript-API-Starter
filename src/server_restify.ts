/**
 * Module dependencies.
 */
import * as restify from 'restify';
import * as compression from 'compression';  // compresses requests
// import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as errorHandler from 'errorhandler';
import * as lusca from 'lusca';
import * as dotenv from 'dotenv';
import * as mongo from 'connect-mongo'; // (session)
import * as path from 'path';
import * as mongoose from 'mongoose';
import * as passport from 'passport-restify';
// import expressValidator = require('express-validator');
const CookieParser = require('restify-cookies');
const session = require('cookie-session');

// const metrics = require('express-node-metrics').metrics;
// const metricsMiddleware = require('express-node-metrics').middleware;

const MongoStore = mongo(session);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
import * as helloController from './controllers/hello_world';

/**
 * API keys and Passport configuration.
 */
import * as passportConfig from './config/passport';

/**
 * Create Restify server.
 */
const server = restify.createServer();

/**
 * Connect to MongoDB.
 */
// mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);

mongoose.connection.on('error', () => {
  console.log('MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

/**
 * Restify configuration.
 */
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.gzipResponse());
server.use(restify.requestLogger());
server.use(CookieParser.parse);
server.use(session({
  keys: ['key1', 'key2'],
  maxage: 48 * 3600 /*hours*/ * 1000,  /*in milliseconds*/
  secureProxy: false, // if you do SSL outside of node
}));
server.use(passport.initialize());
server.use(passport.session());
server.use((req: any, res: any, next) => {
  res.locals.user = req.user;
  next();
});

///////////
// app.use(compression());
// app.use(logger('dev'));
// app.use(metricsMiddleware);
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(expressValidator());
// app.use(session({
//   resave: true,
//   saveUninitialized: true,
//   secret: process.env.SESSION_SECRET,
//   store: new MongoStore({
//     url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
//     autoReconnect: true,
//   }),
// }));
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(lusca.xframe('SAMEORIGIN'));
// app.use(lusca.xssProtection(true));
// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   next();
// });
// app.use((req, res, next) => {
//   // After successful login, redirect back to the intended page
//   if (!req.user &&
//       req.path !== '/login' &&
//       req.path !== '/signup' &&
//       !req.path.match(/^\/auth/) &&
//       !req.path.match(/\./)) {
//     req.session.returnTo = req.path;
//   } else if (req.user &&
//       req.path === '/account') {
//     req.session.returnTo = req.path;
//   }
//   next();
// });
// app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * API routes.
 */
server.get('/hello', passportConfig.isAuthenticated, helloController.hello);

/**
 * OAuth authentication routes. (Sign in)
 */
server.get('/auth',
    passport.authenticate('openidconnect'));

server.get('/auth/callback',
    passport.authenticate('openidconnect', {
        failureRedirect: '/error',
    }),
    (req, res) => {
        console.log('req:' + req);
        res.redirect(req.session.returnTo || '/');
    });

server.get('/', (req, res) => {
    res.send(metrics.getAll(req.query.reset));
});

server.get('/api', (req, res) => {
    res.send(metrics.apiMetrics(req.query.reset));
});

/**
 * Error Handler. Provides full stack - remove for production
 */
server.use(errorHandler());

/**
 * Start Express server.
 */
server.listen(process.env.PORT || 3000, () => {
  console.log(('  App is running at http://localhost:%d in some mode'), process.env.PORT);
  console.log('  Press CTRL-C to stop\n');
});

// module.exports = server;
