const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware')
const { can } = require('../middleware/roles')
const { userBookController: ctrl } = require('../controllers')
const { wrap, wrapNoAudit } = require('../utils/http')

router.get('/my-library', ...wrap(authenticate)(ctrl.myLibrary))
router.post('/add-to-library', ...wrap(authenticate)(ctrl.addToLibrary))
router.delete('/remove-from-library/:book_id', ...wrap(authenticate)(ctrl.removeFromLibrary))
router.put('/update-book/:book_id', ...wrap(authenticate)(ctrl.updateBookState))
router.get('/favorites', ...wrap(authenticate)(ctrl.favorites))
router.get('/reading-stats', ...wrap(authenticate)(ctrl.readingStats))
router.get('/admin/stats', ...wrap(authenticate, can.admin)(ctrl.adminStats))

module.exports = router


