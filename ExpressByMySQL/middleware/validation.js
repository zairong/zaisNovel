const Joi = require('joi');
const { body, validationResult } = require('express-validator');

// Joi 驗證模式
const validationSchemas = {
  // 用戶註冊驗證
  userRegister: Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required()
      .messages({
        'string.min': '用戶名至少3個字符',
        'string.max': '用戶名最多50個字符',
        'string.pattern.base': '用戶名只能包含字母、數字和下劃線',
        'any.required': '用戶名為必填項'
      }),
    email: Joi.string()
      .email()
      .max(100)
      .required()
      .messages({
        'string.email': '請輸入有效的電子郵件',
        'string.max': '電子郵件最多100個字符',
        'any.required': '電子郵件為必填項'
      }),
    password: Joi.string()
      .min(6)
      .max(255)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/)
      .required()
      .messages({
        'string.min': '密碼至少6個字符',
        'string.max': '密碼最多255個字符',
        'string.pattern.base': '密碼必須包含至少一個大寫字母、一個小寫字母和一個數字',
        'any.required': '密碼為必填項'
      }),
    age_range: Joi.string()
      .valid('10~20', '20~30', '30~40', '40~50', '50~60', '60以上')
      .optional()
      .messages({
        'any.only': '請選擇有效的年齡範圍'
      })
  }),

  // 用戶登入驗證
  userLogin: Joi.object({
    username: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': '用戶名/電子郵件至少3個字符',
        'string.max': '用戶名/電子郵件最多100個字符',
        'any.required': '用戶名/電子郵件為必填項'
      }),
    password: Joi.string()
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.min': '密碼不能為空',
        'string.max': '密碼最多255個字符',
        'any.required': '密碼為必填項'
      })
  }),

  // 書籍驗證
  book: Joi.object({
    title: Joi.string()
      .min(1)
      .max(255)
      .trim()
      .required()
      .messages({
        'string.min': '書名不能為空',
        'string.max': '書名最多255個字符',
        'any.required': '書名為必填項'
      }),
    author_name: Joi.string()
      .min(1)
      .max(255)
      .trim()
      .required()
      .messages({
        'string.min': '作者名不能為空',
        'string.max': '作者名最多255個字符',
        'any.required': '作者名為必填項'
      }),
    isbn: Joi.string()
      .pattern(/^[\d-X]{10,17}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'ISBN格式不正確'
      }),
    price: Joi.number()
      .min(0)
      .max(999999.99)
      .precision(2)
      .optional()
      .messages({
        'number.min': '價格不能為負數',
        'number.max': '價格不能超過999999.99',
        'number.precision': '價格最多兩位小數'
      }),
    description: Joi.string()
      .max(2000)
      .optional()
      .allow('')
      .messages({
        'string.max': '描述最多2000個字符'
      }),
    category: Joi.string()
      .max(100)
      .optional()
      .allow('')
      .messages({
        'string.max': '分類最多100個字符'
      })
  }),

  // 評論驗證
  comment: Joi.object({
    content: Joi.string()
      .min(1)
      .max(1000)
      .trim()
      .required()
      .messages({
        'string.min': '評論內容不能為空',
        'string.max': '評論內容最多1000個字符',
        'any.required': '評論內容為必填項'
      }),
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .optional()
      .messages({
        'number.base': '評分必須是數字',
        'number.integer': '評分必須是整數',
        'number.min': '評分至少為1',
        'number.max': '評分最多為5'
      })
  }),

  // 密碼更改驗證
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .min(1)
      .required()
      .messages({
        'string.min': '當前密碼不能為空',
        'any.required': '當前密碼為必填項'
      }),
    newPassword: Joi.string()
      .min(6)
      .max(255)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/)
      .required()
      .messages({
        'string.min': '新密碼至少6個字符',
        'string.max': '新密碼最多255個字符',
        'string.pattern.base': '新密碼必須包含至少一個大寫字母、一個小寫字母和一個數字',
        'any.required': '新密碼為必填項'
      })
  }),

  // 檔案上傳驗證
  fileUpload: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    mimetype: Joi.string().valid(
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'text/markdown'
    ).required().messages({
      'any.only': '不支援的檔案類型'
    }),
    size: Joi.number().max(10485760).required().messages({
      'number.max': '檔案大小不能超過10MB'
    })
  })
};

/**
 * Joi 驗證中間件工廠
 */
function validateJoi(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        errors: errors
      });
    }

    // 將驗證過的數據替換原始數據
    req.body = value;
    next();
  };
}

/**
 * Express-validator 規則
 */
const expressValidatorRules = {
  // 用戶ID驗證
  userId: body('userId')
    .isInt({ min: 1 })
    .withMessage('用戶ID必須是正整數'),

  // 書籍ID驗證
  bookId: body('bookId')
    .isInt({ min: 1 })
    .withMessage('書籍ID必須是正整數'),

  // 頁碼驗證
  page: body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('頁碼必須是正整數'),

  // 每頁數量驗證
  limit: body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每頁數量必須在1-100之間')
};

/**
 * 處理 express-validator 錯誤
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '輸入驗證失敗',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
}

/**
 * 檔案驗證中間件
 */
function validateFile(req, res, next) {
  if (!req.file) {
    return next(); // 如果沒有檔案，繼續執行
  }

  const { error } = validationSchemas.fileUpload.validate({
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: '檔案驗證失敗',
      error: error.details[0].message
    });
  }

  next();
}

/**
 * 清理 HTML 標籤和潛在危險內容
 */
function sanitizeInput(req, res, next) {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // 移除 HTML 標籤
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
}

module.exports = {
  validationSchemas,
  validateJoi,
  expressValidatorRules,
  handleValidationErrors,
  validateFile,
  sanitizeInput
};
