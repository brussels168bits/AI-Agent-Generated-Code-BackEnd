import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { requestId } from './middlewares/request-id.js';
import { errorHandler } from './middlewares/error-handler.js';
import healthRoute from './modules/health/health.route.js';
import itemsRoute from './modules/items/items.route.js';

const app = express();

app.use(requestId);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

app.use(
  '/api/',
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.',
      data: null,
    },
  }),
);

app.use('/health', healthRoute);
app.use('/api/v1/items', itemsRoute);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'METHOD_NOT_ALLOWED',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    data: null,
    requestId: req.requestId,
  });
});

app.use(errorHandler);

export default app;
