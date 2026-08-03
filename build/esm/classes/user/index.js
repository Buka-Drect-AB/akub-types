"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const model_1 = require("../model");
class UserModel extends model_1.Model {
    get fullname() {
        const { first, last } = this.schema.naming;
        return [first, last].filter(Boolean).join(" ").trim() || this.data.email;
    }
    get accountIsValid() {
        return (this.data.naming.first.length > 1 && this.data.naming.last.length > 1);
    }
    static createFullName(name) {
        return `${name.first}${name.middle ? ` ${name.middle}` : ""} ${name.last}`;
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=index.js.map