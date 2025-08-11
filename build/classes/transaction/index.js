"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModel = void 0;
const model_1 = require("../model");
;
class TransactionModel extends model_1.Model {
    static calculateTotal(lineItems) {
        // Validate all items have the same currency if there are multiple items
        if (lineItems.length > 1) {
            const firstCurrency = lineItems[0].currency;
            if (!lineItems.every(item => item.currency === firstCurrency)) {
                throw new Error("All line items must have the same currency to calculate total");
            }
        }
        // Calculate total amount
        const total = lineItems.reduce((sum, item) => {
            return sum + (item.amount * item.quantity);
        }, 0);
        // Return as number (caller can format as needed)
        return total;
    }
    static calculateFee(total, percentage) {
        return (total * percentage) / 100;
    }
}
exports.TransactionModel = TransactionModel;
//# sourceMappingURL=index.js.map