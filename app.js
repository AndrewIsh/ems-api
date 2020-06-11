const fs = require('fs');
const path = require('path');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const helmet = require('helmet');
const logger = require('morgan');
const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;

const apiRouter = require('./api');
const { errorFallback } = require('./middleware/error-handler');

process.env.UPLOADS_DIR = 'uploads';

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
        app.get('/download/*', (req, res) => {
            const file = `${process.env.UPLOADS_DIR}/${req.params[0]}`;
            res.download(file);
        });

        // Middleware
        app.use(cors());
        app.use(helmet());
        app.use(bodyParser.json());
        app.use(logger('combined', { stream: accessLogStream }));


        // Configure how we are storing our file uploads
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads')
            },
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname);
                const filename = path.basename(file.originalname, ext);
                const suffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, filename + '-' + suffix + ext);
            }
        })

        // Install the OpenAPI validator
        await new OpenApiValidator({
            apiSpec: './api_spec/ems.yaml',
            validateRequests: true,
            validateResponses: true,
            fileUploader: {
                storage
            }
        }).install(app);

        // API route
        app.use('/api', apiRouter);

        // If we reach this middleware, we need to log an error
        app.use(errorFallback);

        return app;
    }
};
