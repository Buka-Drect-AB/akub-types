"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TABLE_PLAN_LIMITS = exports.PAID_PLAN_TYPES = exports.TABLE_PLAN_TYPES = exports.BILLING_PERIOD_MONTHS = exports.BILLING_PERIODS = exports.AKUB_MODULE_IDS = void 0;
exports.isBillingPeriod = isBillingPeriod;
exports.isPaidPlanType = isPaidPlanType;
exports.isTablePlanType = isTablePlanType;
exports.tableLimitsForPlan = tableLimitsForPlan;
exports.AKUB_MODULE_IDS = ["inventory", "table"];
exports.BILLING_PERIODS = [
    "monthly",
    "quarterly",
    "yearly",
];
exports.BILLING_PERIOD_MONTHS = {
    monthly: 1,
    quarterly: 3,
    yearly: 12,
};
function isBillingPeriod(value) {
    return value === "monthly" || value === "quarterly" || value === "yearly";
}
exports.TABLE_PLAN_TYPES = [
    "freemium",
    "solo",
    "business",
    "custom",
];
exports.PAID_PLAN_TYPES = ["solo", "business"];
/** Default caps when activating a known Table plan (custom is support-set). */
exports.TABLE_PLAN_LIMITS = {
    freemium: { venue_limit: 1, table_limit: 2 },
    solo: { venue_limit: 1, table_limit: 10 },
    business: { venue_limit: 5, table_limit: 50 },
    custom: { venue_limit: 0, table_limit: 0 },
};
function isPaidPlanType(value) {
    return value === "solo" || value === "business";
}
function isTablePlanType(value) {
    return (value === "freemium" ||
        value === "solo" ||
        value === "business" ||
        value === "custom");
}
function tableLimitsForPlan(plan) {
    return Object.assign({}, exports.TABLE_PLAN_LIMITS[plan]);
}
//# sourceMappingURL=module.js.map