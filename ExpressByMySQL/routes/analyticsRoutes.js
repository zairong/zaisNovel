const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware')
const { analyticsController: ctrl } = require('../controllers')
const { wrap } = require('../utils/http')

router.get('/views', ...wrap(authenticate)(ctrl.viewsHistory))
router.get('/downloads', ...wrap(authenticate)(ctrl.downloadsHistory))
router.get('/favorites', ...wrap(authenticate)(ctrl.favoritesHistory))
router.get('/my-books', ...wrap(authenticate)(ctrl.myBooks))
router.get('/age-distribution', ...wrap(authenticate)(ctrl.getAgeDistribution))
router.get('/available-years', ...wrap(authenticate)(ctrl.getAvailableYears))

module.exports = router


