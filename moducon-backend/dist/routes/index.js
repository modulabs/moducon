"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const booths_1 = __importDefault(require("./booths"));
const papers_1 = __importDefault(require("./papers"));
const sessions_1 = __importDefault(require("./sessions"));
const checkin_1 = __importDefault(require("./checkin"));
const quiz_1 = __importDefault(require("./quiz"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/booths', booths_1.default);
router.use('/papers', papers_1.default);
router.use('/sessions', sessions_1.default);
router.use('/checkin', checkin_1.default);
router.use('/quiz', quiz_1.default);
// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
