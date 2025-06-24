"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PawPointTransaction = exports.TransactionType = void 0;
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var user_entity_1 = require("../../users/entities/user.entity");
var donation_entity_1 = require("./donation.entity");
var pet_entity_1 = require("../../pets/entities/pet.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["DONATION"] = "donation";
    TransactionType["ADOPTION_BONUS"] = "adoption_bonus";
    TransactionType["COMPASSION_BONUS"] = "compassion_bonus";
    TransactionType["ERROR_BONUS"] = "error_bonus";
    TransactionType["SPENT"] = "spent";
    TransactionType["REFUND"] = "refund";
    TransactionType["BONUS"] = "bonus";
    TransactionType["OTHER"] = "other";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var PawPointTransaction = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('pawpoint_transactions'), (0, typeorm_1.Index)(['userId', 'createdAt']), (0, typeorm_1.Index)(['type'])];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _user_decorators;
    var _user_initializers = [];
    var _user_extraInitializers = [];
    var _userId_decorators;
    var _userId_initializers = [];
    var _userId_extraInitializers = [];
    var _points_decorators;
    var _points_initializers = [];
    var _points_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _relatedDonation_decorators;
    var _relatedDonation_initializers = [];
    var _relatedDonation_extraInitializers = [];
    var _relatedDonationId_decorators;
    var _relatedDonationId_initializers = [];
    var _relatedDonationId_extraInitializers = [];
    var _relatedPet_decorators;
    var _relatedPet_initializers = [];
    var _relatedPet_extraInitializers = [];
    var _relatedPetId_decorators;
    var _relatedPetId_initializers = [];
    var _relatedPetId_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _balanceAfter_decorators;
    var _balanceAfter_initializers = [];
    var _balanceAfter_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var PawPointTransaction = _classThis = /** @class */ (function () {
        function PawPointTransaction_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            // User relation
            this.user = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _user_initializers, void 0));
            this.userId = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            // Points change (positive or negative)
            this.points = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _points_initializers, void 0));
            // Transaction type
            this.type = (__runInitializers(this, _points_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            // Related donation (optional)
            this.relatedDonation = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _relatedDonation_initializers, void 0));
            this.relatedDonationId = (__runInitializers(this, _relatedDonation_extraInitializers), __runInitializers(this, _relatedDonationId_initializers, void 0));
            // Related pet (optional)
            this.relatedPet = (__runInitializers(this, _relatedDonationId_extraInitializers), __runInitializers(this, _relatedPet_initializers, void 0));
            this.relatedPetId = (__runInitializers(this, _relatedPet_extraInitializers), __runInitializers(this, _relatedPetId_initializers, void 0));
            // Description
            this.description = (__runInitializers(this, _relatedPetId_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            // Balance after transaction
            this.balanceAfter = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _balanceAfter_initializers, void 0));
            // Timestamp
            this.createdAt = (__runInitializers(this, _balanceAfter_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            __runInitializers(this, _createdAt_extraInitializers);
        }
        // Helper methods
        PawPointTransaction_1.createDonationTransaction = function (userId, points, donationId, balanceAfter) {
            var transaction = new PawPointTransaction();
            transaction.userId = userId;
            transaction.points = points;
            transaction.type = TransactionType.DONATION;
            transaction.relatedDonationId = donationId;
            transaction.description = "Earned ".concat(points, " PawPoints from donation");
            transaction.balanceAfter = balanceAfter;
            return transaction;
        };
        PawPointTransaction_1.createAdoptionBonusTransaction = function (userId, petId, petName, balanceAfter) {
            var transaction = new PawPointTransaction();
            transaction.userId = userId;
            transaction.points = 1;
            transaction.type = TransactionType.ADOPTION_BONUS;
            transaction.relatedPetId = petId;
            transaction.description = "Bonus PawPoint: ".concat(petName, " was adopted!");
            transaction.balanceAfter = balanceAfter;
            return transaction;
        };
        PawPointTransaction_1.createCompassionBonusTransaction = function (userId, petId, petName, balanceAfter) {
            var transaction = new PawPointTransaction();
            transaction.userId = userId;
            transaction.points = 1;
            transaction.type = TransactionType.COMPASSION_BONUS;
            transaction.relatedPetId = petId;
            transaction.description = "Compassion PawPoint: ".concat(petName, " passed away");
            transaction.balanceAfter = balanceAfter;
            return transaction;
        };
        PawPointTransaction_1.createErrorBonusTransaction = function (userId, petId, reason, balanceAfter) {
            var transaction = new PawPointTransaction();
            transaction.userId = userId;
            transaction.points = 1;
            transaction.type = TransactionType.ERROR_BONUS;
            transaction.relatedPetId = petId;
            transaction.description = "Bonus PawPoint: ".concat(reason);
            transaction.balanceAfter = balanceAfter;
            return transaction;
        };
        PawPointTransaction_1.createSpentTransaction = function (userId, points, reason, balanceAfter) {
            var transaction = new PawPointTransaction();
            transaction.userId = userId;
            transaction.points = -Math.abs(points); // Ensure negative
            transaction.type = TransactionType.SPENT;
            transaction.description = reason;
            transaction.balanceAfter = balanceAfter;
            return transaction;
        };
        return PawPointTransaction_1;
    }());
    __setFunctionName(_classThis, "PawPointTransaction");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _user_decorators = [(0, typeorm_1.ManyToOne)(function () { return user_entity_1.User; }), (0, typeorm_1.JoinColumn)()];
        _userId_decorators = [(0, typeorm_1.Column)()];
        _points_decorators = [(0, typeorm_1.Column)({ type: 'int' }), (0, class_validator_1.IsNumber)()];
        _type_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: TransactionType }), (0, class_validator_1.IsEnum)(TransactionType)];
        _relatedDonation_decorators = [(0, typeorm_1.ManyToOne)(function () { return donation_entity_1.Donation; }, { nullable: true }), (0, typeorm_1.JoinColumn)()];
        _relatedDonationId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _relatedPet_decorators = [(0, typeorm_1.ManyToOne)(function () { return pet_entity_1.Pet; }, { nullable: true }), (0, typeorm_1.JoinColumn)()];
        _relatedPetId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _description_decorators = [(0, typeorm_1.Column)({ type: 'text' }), (0, class_validator_1.IsString)()];
        _balanceAfter_decorators = [(0, typeorm_1.Column)({ type: 'int' }), (0, class_validator_1.IsNumber)()];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _points_decorators, { kind: "field", name: "points", static: false, private: false, access: { has: function (obj) { return "points" in obj; }, get: function (obj) { return obj.points; }, set: function (obj, value) { obj.points = value; } }, metadata: _metadata }, _points_initializers, _points_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _relatedDonation_decorators, { kind: "field", name: "relatedDonation", static: false, private: false, access: { has: function (obj) { return "relatedDonation" in obj; }, get: function (obj) { return obj.relatedDonation; }, set: function (obj, value) { obj.relatedDonation = value; } }, metadata: _metadata }, _relatedDonation_initializers, _relatedDonation_extraInitializers);
        __esDecorate(null, null, _relatedDonationId_decorators, { kind: "field", name: "relatedDonationId", static: false, private: false, access: { has: function (obj) { return "relatedDonationId" in obj; }, get: function (obj) { return obj.relatedDonationId; }, set: function (obj, value) { obj.relatedDonationId = value; } }, metadata: _metadata }, _relatedDonationId_initializers, _relatedDonationId_extraInitializers);
        __esDecorate(null, null, _relatedPet_decorators, { kind: "field", name: "relatedPet", static: false, private: false, access: { has: function (obj) { return "relatedPet" in obj; }, get: function (obj) { return obj.relatedPet; }, set: function (obj, value) { obj.relatedPet = value; } }, metadata: _metadata }, _relatedPet_initializers, _relatedPet_extraInitializers);
        __esDecorate(null, null, _relatedPetId_decorators, { kind: "field", name: "relatedPetId", static: false, private: false, access: { has: function (obj) { return "relatedPetId" in obj; }, get: function (obj) { return obj.relatedPetId; }, set: function (obj, value) { obj.relatedPetId = value; } }, metadata: _metadata }, _relatedPetId_initializers, _relatedPetId_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _balanceAfter_decorators, { kind: "field", name: "balanceAfter", static: false, private: false, access: { has: function (obj) { return "balanceAfter" in obj; }, get: function (obj) { return obj.balanceAfter; }, set: function (obj, value) { obj.balanceAfter = value; } }, metadata: _metadata }, _balanceAfter_initializers, _balanceAfter_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PawPointTransaction = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PawPointTransaction = _classThis;
}();
exports.PawPointTransaction = PawPointTransaction;
