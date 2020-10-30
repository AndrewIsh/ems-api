const fs = require('fs');
const path = require('path');

const express = require('express');
const cors = require('cors');
const { json, urlencoded } = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const multer = require('multer');
const helmet = require('helmet');
const logger = require('morgan');
const OpenApiValidator = require('express-openapi-validator');

const apiRouter = require('./api');
const { errorFallback } = require('./middleware/error-handler');
const { initialiseAuthentication } = require('./auth');

process.env.UPLOADS_DIR = `uploads/${process.env.SCHEMA}`;

module.exports = {
    init: async () => {
        const app = express();

        // Set up logging
        const accessLogStream = fs.createWriteStream(
            path.join(process.env.LOG_FILE),
            {
                flags: 'a'
            }
        );

        // File downloads
        // Ensure our upload directory exists
        if (!fs.existsSync(process.env.UPLOADS_DIR)) {
            fs.mkdirSync(process.env.UPLOADS_DIR);
        }
        // Handle download requests
        app.get('/download/*', (req, res) => {
            const file = `${process.env.UPLOADS_DIR}/${req.params[0]}`;
            res.download(file);
        });

        // Middleware
        //
        // CORS - here we are allowing the client to access the Authorization
        // header. We should only need CORS when in development, we want to
        // not allow CORS when in production as a partial mitigation against
        // CSRF
        if (process.env.NODE_ENV === 'development') {
            app.use(
                cors((req, cb) =>
                    cb(null, {
                        exposedHeaders: 'Authorization',
                        credentials: true,
                        origin: `${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}`
                    })
                )
            );
        }
        app.use(helmet());
        app.use(cookieParser());
        app.use(urlencoded({ extended: true }));
        app.use(json());
        app.use(logger('combined', { stream: accessLogStream }));
        app.use(passport.initialize());

        // Configure how we are storing our file uploads
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, process.env.UPLOADS_DIR);
            },
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname);
                const filename = path.basename(file.originalname, ext);
                const suffix =
                    Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, filename + '-' + suffix + ext);
            }
        });

        // Install the OpenAPI validator
        app.use(
            OpenApiValidator.middleware({
                apiSpec: './api_spec/ems.yaml',
                validateRequests: true,
                validateResponses: true,
                fileUploader: {
                    storage
                }
            })
        );
        /*
        await new OpenApiValidator({
            apiSpec: './api_spec/ems.yaml',
            validateRequests: true,
            validateResponses: true,
            fileUploader: {
                storage
            }
        }).install(app);
        */

        // API route
        app.use('/api', apiRouter);

        // Ensure we have the authentication methods we need
        initialiseAuthentication(app);

        // If we reach this middleware, we need to log an error
        app.use(errorFallback);

        return app;
    }
};
