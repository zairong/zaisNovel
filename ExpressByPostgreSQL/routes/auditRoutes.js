const express = require('express')
const router = express.Router()
const { auditController: ctrl } = require('../controllers')
const { wrapNoAudit } = require('../utils/http')

router.post('/log', ...wrapNoAudit()(ctrl.logEvent))
router.get('/logs', ...wrapNoAudit()(ctrl.listLogs))
router.get('/stats', ...wrapNoAudit()(ctrl.stats))

module.exports = router


