"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = exports.CampaignStatus = exports.CampaignPriority = void 0;
// src/campaigns/entities/campaign.entity.ts
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var shelter_entity_1 = require("../../shelters/entities/shelter.entity");
var donation_entity_1 = require("../../donations/entities/donation.entity");
var CampaignPriority;
(function (CampaignPriority) {
    CampaignPriority["LOW"] = "low";
    CampaignPriority["MEDIUM"] = "medium";
    CampaignPriority["HIGH"] = "high";
    CampaignPriority["CRITICAL"] = "critical";
})(CampaignPriority || (exports.CampaignPriority = CampaignPriority = {}));
var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["ACTIVE"] = "active";
    CampaignStatus["COMPLETED"] = "completed";
    CampaignStatus["CANCELLED"] = "cancelled";
})(CampaignStatus || (exports.CampaignStatus = CampaignStatus = {}));
var Campaign = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('campaigns'), (0, typeorm_1.Index)(['shelterId', 'status']), (0, typeorm_1.Index)(['priority', 'createdAt']), (0, typeorm_1.Check)("\"goalAmount\" > 0"), (0, typeorm_1.Check)("\"duration\" >= 1 AND \"duration\" <= 4")];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _shelter_decorators;
    var _shelter_initializers = [];
    var _shelter_extraInitializers = [];
    var _shelterId_decorators;
    var _shelterId_initializers = [];
    var _shelterId_extraInitializers = [];
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _image_decorators;
    var _image_initializers = [];
    var _image_extraInitializers = [];
    var _priority_decorators;
    var _priority_initializers = [];
    var _priority_extraInitializers = [];
    var _duration_decorators;
    var _duration_initializers = [];
    var _duration_extraInitializers = [];
    var _goalAmount_decorators;
    var _goalAmount_initializers = [];
    var _goalAmount_extraInitializers = [];
    var _currentAmount_decorators;
    var _currentAmount_initializers = [];
    var _currentAmount_extraInitializers = [];
    var _platformFeePercentage_decorators;
    var _platformFeePercentage_initializers = [];
    var _platformFeePercentage_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _endsAt_decorators;
    var _endsAt_initializers = [];
    var _endsAt_extraInitializers = [];
    var _completedAt_decorators;
    var _completedAt_initializers = [];
    var _completedAt_extraInitializers = [];
    var _donations_decorators;
    var _donations_initializers = [];
    var _donations_extraInitializers = [];
    var _calculatePlatformFee_decorators;
    var _setEndDate_decorators;
    var Campaign = _classThis = /** @class */ (function () {
        function Campaign_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            // Shelter relation
            this.shelter = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _shelter_initializers, void 0));
            this.shelterId = (__runInitializers(this, _shelter_extraInitializers), __runInitializers(this, _shelterId_initializers, void 0));
            // Campaign details
            this.title = (__runInitializers(this, _shelterId_extraInitializers), __runInitializers(this, _title_initializers, void 0));
            this.description = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            this.image = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _image_initializers, void 0));
            // Priority and duration
            this.priority = (__runInitializers(this, _image_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
            this.duration = (__runInitializers(this, _priority_extraInitializers), __runInitializers(this, _duration_initializers, void 0)); // Duration in weeks (1-4)
            // Financial details
            this.goalAmount = (__runInitializers(this, _duration_extraInitializers), __runInitializers(this, _goalAmount_initializers, void 0));
            this.currentAmount = (__runInitializers(this, _goalAmount_extraInitializers), __runInitializers(this, _currentAmount_initializers, void 0));
            this.platformFeePercentage = (__runInitializers(this, _currentAmount_extraInitializers), __runInitializers(this, _platformFeePercentage_initializers, void 0)); // Calculated based on priority and duration
            // Status
            this.status = (__runInitializers(this, _platformFeePercentage_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            // Timestamps
            this.createdAt = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            this.endsAt = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _endsAt_initializers, void 0));
            this.completedAt = (__runInitializers(this, _endsAt_extraInitializers), __runInitializers(this, _completedAt_initializers, void 0));
            // Relations
            this.donations = (__runInitializers(this, _completedAt_extraInitializers), __runInitializers(this, _donations_initializers, void 0));
            __runInitializers(this, _donations_extraInitializers);
        }
        Object.defineProperty(Campaign_1.prototype, "progress", {
            // Virtual fields
            get: function () {
                if (this.goalAmount === 0)
                    return 0;
                return Math.round((this.currentAmount / this.goalAmount) * 100);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Campaign_1.prototype, "isActive", {
            get: function () {
                return this.status === CampaignStatus.ACTIVE && new Date() < this.endsAt;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Campaign_1.prototype, "daysLeft", {
            get: function () {
                if (!this.isActive)
                    return 0;
                var now = new Date();
                var timeLeft = this.endsAt.getTime() - now.getTime();
                return Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Campaign_1.prototype, "amountRemaining", {
            get: function () {
                return Math.max(0, this.goalAmount - this.currentAmount);
            },
            enumerable: false,
            configurable: true
        });
        // Hooks
        Campaign_1.prototype.calculatePlatformFee = function () {
            var _a;
            // Base fee: 10%
            var fee = 10;
            // Priority surcharge
            var priorityFees = (_a = {},
                _a[CampaignPriority.LOW] = 0.5,
                _a[CampaignPriority.MEDIUM] = 1,
                _a[CampaignPriority.HIGH] = 1.5,
                _a[CampaignPriority.CRITICAL] = 2,
                _a);
            // Duration surcharge
            var durationFees = { 1: 0.5, 2: 1, 3: 1.5, 4: 2 };
            fee += priorityFees[this.priority];
            fee += durationFees[this.duration];
            this.platformFeePercentage = fee;
        };
        Campaign_1.prototype.setEndDate = function () {
            var endDate = new Date();
            endDate.setDate(endDate.getDate() + (this.duration * 7)); // Duration in weeks
            this.endsAt = endDate;
        };
        // Business methods
        Campaign_1.prototype.addDonation = function (amount) {
            this.currentAmount += amount;
            if (this.currentAmount >= this.goalAmount) {
                this.status = CampaignStatus.COMPLETED;
                this.completedAt = new Date();
            }
        };
        Campaign_1.prototype.canReceiveDonations = function () {
            return this.isActive && this.currentAmount < this.goalAmount;
        };
        Campaign_1.prototype.cancel = function () {
            if (this.status !== CampaignStatus.ACTIVE) {
                throw new Error('Only active campaigns can be cancelled');
            }
            this.status = CampaignStatus.CANCELLED;
        };
        Campaign_1.prototype.complete = function () {
            if (this.status !== CampaignStatus.ACTIVE) {
                throw new Error('Only active campaigns can be completed');
            }
            this.status = CampaignStatus.COMPLETED;
            this.completedAt = new Date();
        };
        // Helper methods for display
        Campaign_1.prototype.getPriorityColor = function () {
            var _a;
            var colors = (_a = {},
                _a[CampaignPriority.LOW] = '#51CF66',
                _a[CampaignPriority.MEDIUM] = '#FFD43B',
                _a[CampaignPriority.HIGH] = '#FF922B',
                _a[CampaignPriority.CRITICAL] = '#FF6B6B',
                _a);
            return colors[this.priority];
        };
        Campaign_1.prototype.getPriorityLabel = function () {
            var _a;
            var labels = (_a = {},
                _a[CampaignPriority.LOW] = 'Low Priority',
                _a[CampaignPriority.MEDIUM] = 'Medium Priority',
                _a[CampaignPriority.HIGH] = 'High Priority',
                _a[CampaignPriority.CRITICAL] = 'Critical Need',
                _a);
            return labels[this.priority];
        };
        // Factory method
        Campaign_1.create = function (shelterId, title, description, goalAmount, priority, duration, image) {
            var campaign = new Campaign();
            campaign.shelterId = shelterId;
            campaign.title = title;
            campaign.description = description;
            campaign.goalAmount = goalAmount;
            campaign.priority = priority;
            campaign.duration = duration;
            campaign.image = image;
            return campaign;
        };
        return Campaign_1;
    }());
    __setFunctionName(_classThis, "Campaign");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _shelter_decorators = [(0, typeorm_1.ManyToOne)(function () { return shelter_entity_1.Shelter; }), (0, typeorm_1.JoinColumn)()];
        _shelterId_decorators = [(0, typeorm_1.Column)()];
        _title_decorators = [(0, typeorm_1.Column)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(200)];
        _description_decorators = [(0, typeorm_1.Column)({ type: 'text' }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(5000)];
        _image_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _priority_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: CampaignPriority }), (0, class_validator_1.IsEnum)(CampaignPriority)];
        _duration_decorators = [(0, typeorm_1.Column)({ type: 'int' }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(4)];
        _goalAmount_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(100), (0, class_validator_1.Max)(50000)];
        _currentAmount_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
        _platformFeePercentage_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(10), (0, class_validator_1.Max)(20)];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.ACTIVE }), (0, class_validator_1.IsEnum)(CampaignStatus)];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        _endsAt_decorators = [(0, typeorm_1.Column)({ type: 'timestamp' })];
        _completedAt_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _donations_decorators = [(0, typeorm_1.OneToMany)(function () { return donation_entity_1.Donation; }, function (donation) { return donation.campaignId; })];
        _calculatePlatformFee_decorators = [(0, typeorm_1.BeforeInsert)()];
        _setEndDate_decorators = [(0, typeorm_1.BeforeInsert)()];
        __esDecorate(_classThis, null, _calculatePlatformFee_decorators, { kind: "method", name: "calculatePlatformFee", static: false, private: false, access: { has: function (obj) { return "calculatePlatformFee" in obj; }, get: function (obj) { return obj.calculatePlatformFee; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setEndDate_decorators, { kind: "method", name: "setEndDate", static: false, private: false, access: { has: function (obj) { return "setEndDate" in obj; }, get: function (obj) { return obj.setEndDate; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _shelter_decorators, { kind: "field", name: "shelter", static: false, private: false, access: { has: function (obj) { return "shelter" in obj; }, get: function (obj) { return obj.shelter; }, set: function (obj, value) { obj.shelter = value; } }, metadata: _metadata }, _shelter_initializers, _shelter_extraInitializers);
        __esDecorate(null, null, _shelterId_decorators, { kind: "field", name: "shelterId", static: false, private: false, access: { has: function (obj) { return "shelterId" in obj; }, get: function (obj) { return obj.shelterId; }, set: function (obj, value) { obj.shelterId = value; } }, metadata: _metadata }, _shelterId_initializers, _shelterId_extraInitializers);
        __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _image_decorators, { kind: "field", name: "image", static: false, private: false, access: { has: function (obj) { return "image" in obj; }, get: function (obj) { return obj.image; }, set: function (obj, value) { obj.image = value; } }, metadata: _metadata }, _image_initializers, _image_extraInitializers);
        __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: function (obj) { return "priority" in obj; }, get: function (obj) { return obj.priority; }, set: function (obj, value) { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
        __esDecorate(null, null, _duration_decorators, { kind: "field", name: "duration", static: false, private: false, access: { has: function (obj) { return "duration" in obj; }, get: function (obj) { return obj.duration; }, set: function (obj, value) { obj.duration = value; } }, metadata: _metadata }, _duration_initializers, _duration_extraInitializers);
        __esDecorate(null, null, _goalAmount_decorators, { kind: "field", name: "goalAmount", static: false, private: false, access: { has: function (obj) { return "goalAmount" in obj; }, get: function (obj) { return obj.goalAmount; }, set: function (obj, value) { obj.goalAmount = value; } }, metadata: _metadata }, _goalAmount_initializers, _goalAmount_extraInitializers);
        __esDecorate(null, null, _currentAmount_decorators, { kind: "field", name: "currentAmount", static: false, private: false, access: { has: function (obj) { return "currentAmount" in obj; }, get: function (obj) { return obj.currentAmount; }, set: function (obj, value) { obj.currentAmount = value; } }, metadata: _metadata }, _currentAmount_initializers, _currentAmount_extraInitializers);
        __esDecorate(null, null, _platformFeePercentage_decorators, { kind: "field", name: "platformFeePercentage", static: false, private: false, access: { has: function (obj) { return "platformFeePercentage" in obj; }, get: function (obj) { return obj.platformFeePercentage; }, set: function (obj, value) { obj.platformFeePercentage = value; } }, metadata: _metadata }, _platformFeePercentage_initializers, _platformFeePercentage_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _endsAt_decorators, { kind: "field", name: "endsAt", static: false, private: false, access: { has: function (obj) { return "endsAt" in obj; }, get: function (obj) { return obj.endsAt; }, set: function (obj, value) { obj.endsAt = value; } }, metadata: _metadata }, _endsAt_initializers, _endsAt_extraInitializers);
        __esDecorate(null, null, _completedAt_decorators, { kind: "field", name: "completedAt", static: false, private: false, access: { has: function (obj) { return "completedAt" in obj; }, get: function (obj) { return obj.completedAt; }, set: function (obj, value) { obj.completedAt = value; } }, metadata: _metadata }, _completedAt_initializers, _completedAt_extraInitializers);
        __esDecorate(null, null, _donations_decorators, { kind: "field", name: "donations", static: false, private: false, access: { has: function (obj) { return "donations" in obj; }, get: function (obj) { return obj.donations; }, set: function (obj, value) { obj.donations = value; } }, metadata: _metadata }, _donations_initializers, _donations_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Campaign = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Campaign = _classThis;
}();
exports.Campaign = Campaign;
