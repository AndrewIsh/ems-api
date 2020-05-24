const fs = require('fs');
const path = require('path');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const logger = require('morgan');
const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;

const apiRouter = require('./api');
const { errorFallback } = require('./middleware/error-handler');

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

        // Middleware
        app.use(cors());
        app.use(helmet());
        app.use(bodyParser.json());
        app.use(logger('combined', { stream: accessLogStream }));

        // Install the OpenAPI validator
        await new OpenApiValidator({
            apiSpec: './api_spec/ems.yaml',
            validateRequests: true,
            validateResponses: true
        }).install(app);

        // API route
        app.use('/api', apiRouter);

        // If we reach this middleware, we need to log an error
        app.use(errorFallback);

        return app;
    }
};
