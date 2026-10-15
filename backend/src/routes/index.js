const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    name: 'Safe-Era API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', require('./authRoutes'));
router.use('/sos', require('./sosRoutes'));
router.use('/guardian', require('./guardianRoutes'));
router.use('/map', require('./mapRoutes'));
router.use('/location', require('./locationRoutes'));
router.use('/subscription', require('./subscriptionRoutes'));

module.exports = router;
