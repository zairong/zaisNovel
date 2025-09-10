const express = require('express')
const router = express.Router()
const { authenticate, optionalAuth } = require('../middleware')
const { analyticsController: ctrl } = require('../controllers')
const { wrap, wrapNoAudit } = require('../utils/http')

router.get('/views', ...wrap(authenticate)(ctrl.viewsHistory))
router.get('/downloads', ...wrap(authenticate)(ctrl.downloadsHistory))
router.get('/favorites', ...wrap(authenticate)(ctrl.favoritesHistory))
router.get('/my-books', ...wrap(authenticate)(ctrl.myBooks))
router.get('/age-distribution', ...wrapNoAudit(optionalAuth)(ctrl.getAgeDistribution))
router.get('/available-years', ...wrapNoAudit(optionalAuth)(ctrl.getAvailableYears))

module.exports = router


