"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const userValidator_1 = require("../validators/userValidator");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Only ADMIN users can access user management routes
router.use(authMiddleware_1.authenticate);
router.use((0, authMiddleware_1.authorizeRoles)('ADMIN'));
router.get('/', userController_1.UserController.getAll);
router.post('/', (0, validationMiddleware_1.validateRequest)(userValidator_1.createUserSchema), userController_1.UserController.create);
router.put('/:id', (0, validationMiddleware_1.validateRequest)(userValidator_1.updateUserSchema), userController_1.UserController.update);
router.patch('/:id/status', userController_1.UserController.toggleStatus);
exports.default = router;
