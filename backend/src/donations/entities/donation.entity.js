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
exports.Donation = exports.DonationStatus = exports.DonationType = void 0;
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var user_entity_1 = require("../../users/entities/user.entity");
var pet_entity_1 = require("../../pets/entities/pet.entity");
var campaign_entity_1 = require("../../campaigns/entities/campaign.entity");
var DonationType;
(function (DonationType) {
    DonationType["PET"] = "pet";
    DonationType["CAMPAIGN"] = "campaign";
})(DonationType || (exports.DonationType = DonationType = {}));
var DonationStatus;
(function (DonationStatus) {
    DonationStatus["PENDING"] = "pending";
    DonationStatus["COMPLETED"] = "completed";
    DonationStatus["REFUNDED"] = "refunded";
    DonationStatus["FAILED"] = "failed";
})(DonationStatus || (exports.DonationStatus = DonationStatus = {}));
var Donation = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('donations'), (0, typeorm_1.Index)(['userId', 'createdAt']), (0, typeorm_1.Index)(['petId', 'status']), (0, typeorm_1.Index)(['campaignId', 'status']), (0, typeorm_1.Check)("\"amount\" > 0")];
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
    var _pet_decorators;
    var _pet_initializers = [];
    var _pet_extraInitializers = [];
    var _petId_decorators;
    var _petId_initializers = [];
    var _petId_extraInitializers = [];
    var _campaign_decorators;
    var _campaign_initializers = [];
    var _campaign_extraInitializers = [];
    var _campaignId_decorators;
    var _campaignId_initializers = [];
    var _campaignId_extraInitializers = [];
    var _amount_decorators;
    var _amount_initializers = [];
    var _amount_extraInitializers = [];
    var _pawPointsEarned_decorators;
    var _pawPointsEarned_initializers = [];
    var _pawPointsEarned_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _paymentIntentId_decorators;
    var _paymentIntentId_initializers = [];
    var _paymentIntentId_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _distribution_decorators;
    var _distribution_initializers = [];
    var _distribution_extraInitializers = [];
    var _platformFee_decorators;
    var _platformFee_initializers = [];
    var _platformFee_extraInitializers = [];
    var _platformFeePercentage_decorators;
    var _platformFeePercentage_initializers = [];
    var _platformFeePercentage_extraInitializers = [];
    var _refundReason_decorators;
    var _refundReason_initializers = [];
    var _refundReason_extraInitializers = [];
    var _refundedAt_decorators;
    var _refundedAt_initializers = [];
    var _refundedAt_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _stripeChargeId_decorators;
    var _stripeChargeId_initializers = [];
    var _stripeChargeId_extraInitializers = [];
    var Donation = _classThis = /** @class */ (function () {
        function Donation_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            // User relation
            this.user = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _user_initializers, void 0));
            this.userId = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            // Pet relation (optional - either pet or campaign)
            this.pet = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _pet_initializers, void 0));
            this.petId = (__runInitializers(this, _pet_extraInitializers), __runInitializers(this, _petId_initializers, void 0));
            // Campaign relation (optional - either pet or campaign)
            this.campaign = (__runInitializers(this, _petId_extraInitializers), __runInitializers(this, _campaign_initializers, void 0));
            this.campaignId = (__runInitializers(this, _campaign_extraInitializers), __runInitializers(this, _campaignId_initializers, void 0));
            // Donation details
            this.amount = (__runInitializers(this, _campaignId_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
            this.pawPointsEarned = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _pawPointsEarned_initializers, void 0));
            this.type = (__runInitializers(this, _pawPointsEarned_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            // Stripe payment information
            this.paymentIntentId = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _paymentIntentId_initializers, void 0));
            this.status = (__runInitializers(this, _paymentIntentId_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            // Distribution tracking (for pet donations)
            this.distribution = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _distribution_initializers, void 0));
            // Platform fee tracking
            this.platformFee = (__runInitializers(this, _distribution_extraInitializers), __runInitializers(this, _platformFee_initializers, void 0));
            this.platformFeePercentage = (__runInitializers(this, _platformFee_extraInitializers), __runInitializers(this, _platformFeePercentage_initializers, void 0));
            // Refund information
            this.refundReason = (__runInitializers(this, _platformFeePercentage_extraInitializers), __runInitializers(this, _refundReason_initializers, void 0));
            this.refundedAt = (__runInitializers(this, _refundReason_extraInitializers), __runInitializers(this, _refundedAt_initializers, void 0));
            // Timestamps
            this.createdAt = (__runInitializers(this, _refundedAt_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.stripeChargeId = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _stripeChargeId_initializers, void 0));
            __runInitializers(this, _stripeChargeId_extraInitializers);
        }
        // Helper methods
        Donation_1.prototype.calculatePawPoints = function () {
            // 1 PawPoint per $25 donated
            return Math.floor(this.amount / 25);
        };
        Donation_1.prototype.calculatePlatformFee = function () {
            if (this.type === DonationType.PET) {
                // Pet donations: 10% platform fee
                this.platformFeePercentage = 10;
                this.platformFee = this.amount * 0.1;
            }
            else {
                // Campaign fees are calculated based on priority and duration
                // This would be set by the service layer based on campaign details
            }
        };
        Donation_1.prototype.getShelterAmount = function () {
            return this.amount - this.platformFee;
        };
        Donation_1.prototype.markAsCompleted = function () {
            if (this.status !== DonationStatus.PENDING) {
                throw new Error('Only pending donations can be marked as completed');
            }
            this.status = DonationStatus.COMPLETED;
            this.pawPointsEarned = this.calculatePawPoints();
        };
        Donation_1.prototype.refund = function (reason) {
            if (this.status !== DonationStatus.COMPLETED) {
                throw new Error('Only completed donations can be refunded');
            }
            this.status = DonationStatus.REFUNDED;
            this.refundReason = reason;
            this.refundedAt = new Date();
        };
        return Donation_1;
    }());
    __setFunctionName(_classThis, "Donation");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _user_decorators = [(0, typeorm_1.ManyToOne)(function () { return user_entity_1.User; }), (0, typeorm_1.JoinColumn)()];
        _userId_decorators = [(0, typeorm_1.Column)()];
        _pet_decorators = [(0, typeorm_1.ManyToOne)(function () { return pet_entity_1.Pet; }, { nullable: true }), (0, typeorm_1.JoinColumn)()];
        _petId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _campaign_decorators = [(0, typeorm_1.ManyToOne)(function () { return campaign_entity_1.Campaign; }, { nullable: true }), (0, typeorm_1.JoinColumn)()];
        _campaignId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _amount_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
        _pawPointsEarned_decorators = [(0, typeorm_1.Column)({ default: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
        _type_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: DonationType }), (0, class_validator_1.IsEnum)(DonationType)];
        _paymentIntentId_decorators = [(0, typeorm_1.Column)(), (0, class_validator_1.IsString)()];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: DonationStatus, default: DonationStatus.PENDING }), (0, class_validator_1.IsEnum)(DonationStatus)];
        _distribution_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsJSON)()];
        _platformFee_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
        _platformFeePercentage_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 10 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
        _refundReason_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _refundedAt_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _stripeChargeId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _pet_decorators, { kind: "field", name: "pet", static: false, private: false, access: { has: function (obj) { return "pet" in obj; }, get: function (obj) { return obj.pet; }, set: function (obj, value) { obj.pet = value; } }, metadata: _metadata }, _pet_initializers, _pet_extraInitializers);
        __esDecorate(null, null, _petId_decorators, { kind: "field", name: "petId", static: false, private: false, access: { has: function (obj) { return "petId" in obj; }, get: function (obj) { return obj.petId; }, set: function (obj, value) { obj.petId = value; } }, metadata: _metadata }, _petId_initializers, _petId_extraInitializers);
        __esDecorate(null, null, _campaign_decorators, { kind: "field", name: "campaign", static: false, private: false, access: { has: function (obj) { return "campaign" in obj; }, get: function (obj) { return obj.campaign; }, set: function (obj, value) { obj.campaign = value; } }, metadata: _metadata }, _campaign_initializers, _campaign_extraInitializers);
        __esDecorate(null, null, _campaignId_decorators, { kind: "field", name: "campaignId", static: false, private: false, access: { has: function (obj) { return "campaignId" in obj; }, get: function (obj) { return obj.campaignId; }, set: function (obj, value) { obj.campaignId = value; } }, metadata: _metadata }, _campaignId_initializers, _campaignId_extraInitializers);
        __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: function (obj) { return "amount" in obj; }, get: function (obj) { return obj.amount; }, set: function (obj, value) { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
        __esDecorate(null, null, _pawPointsEarned_decorators, { kind: "field", name: "pawPointsEarned", static: false, private: false, access: { has: function (obj) { return "pawPointsEarned" in obj; }, get: function (obj) { return obj.pawPointsEarned; }, set: function (obj, value) { obj.pawPointsEarned = value; } }, metadata: _metadata }, _pawPointsEarned_initializers, _pawPointsEarned_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _paymentIntentId_decorators, { kind: "field", name: "paymentIntentId", static: false, private: false, access: { has: function (obj) { return "paymentIntentId" in obj; }, get: function (obj) { return obj.paymentIntentId; }, set: function (obj, value) { obj.paymentIntentId = value; } }, metadata: _metadata }, _paymentIntentId_initializers, _paymentIntentId_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _distribution_decorators, { kind: "field", name: "distribution", static: false, private: false, access: { has: function (obj) { return "distribution" in obj; }, get: function (obj) { return obj.distribution; }, set: function (obj, value) { obj.distribution = value; } }, metadata: _metadata }, _distribution_initializers, _distribution_extraInitializers);
        __esDecorate(null, null, _platformFee_decorators, { kind: "field", name: "platformFee", static: false, private: false, access: { has: function (obj) { return "platformFee" in obj; }, get: function (obj) { return obj.platformFee; }, set: function (obj, value) { obj.platformFee = value; } }, metadata: _metadata }, _platformFee_initializers, _platformFee_extraInitializers);
        __esDecorate(null, null, _platformFeePercentage_decorators, { kind: "field", name: "platformFeePercentage", static: false, private: false, access: { has: function (obj) { return "platformFeePercentage" in obj; }, get: function (obj) { return obj.platformFeePercentage; }, set: function (obj, value) { obj.platformFeePercentage = value; } }, metadata: _metadata }, _platformFeePercentage_initializers, _platformFeePercentage_extraInitializers);
        __esDecorate(null, null, _refundReason_decorators, { kind: "field", name: "refundReason", static: false, private: false, access: { has: function (obj) { return "refundReason" in obj; }, get: function (obj) { return obj.refundReason; }, set: function (obj, value) { obj.refundReason = value; } }, metadata: _metadata }, _refundReason_initializers, _refundReason_extraInitializers);
        __esDecorate(null, null, _refundedAt_decorators, { kind: "field", name: "refundedAt", static: false, private: false, access: { has: function (obj) { return "refundedAt" in obj; }, get: function (obj) { return obj.refundedAt; }, set: function (obj, value) { obj.refundedAt = value; } }, metadata: _metadata }, _refundedAt_initializers, _refundedAt_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _stripeChargeId_decorators, { kind: "field", name: "stripeChargeId", static: false, private: false, access: { has: function (obj) { return "stripeChargeId" in obj; }, get: function (obj) { return obj.stripeChargeId; }, set: function (obj, value) { obj.stripeChargeId = value; } }, metadata: _metadata }, _stripeChargeId_initializers, _stripeChargeId_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Donation = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Donation = _classThis;
}();
exports.Donation = Donation;
