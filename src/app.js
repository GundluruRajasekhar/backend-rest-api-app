const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use('/api', apiRoutes);

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { message: 'Users, Projects & Tasks API — see /api/health for status' },
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
