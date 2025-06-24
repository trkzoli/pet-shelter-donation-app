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
exports.AdoptionRequest = exports.AdoptionStatus = void 0;
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var user_entity_1 = require("../../users/entities/user.entity");
var pet_entity_1 = require("../../pets/entities/pet.entity");
var shelter_entity_1 = require("../../shelters/entities/shelter.entity");
var AdoptionStatus;
(function (AdoptionStatus) {
    AdoptionStatus["PENDING"] = "pending";
    AdoptionStatus["APPROVED"] = "approved";
    AdoptionStatus["DENIED"] = "denied";
    AdoptionStatus["CANCELLED"] = "cancelled";
})(AdoptionStatus || (exports.AdoptionStatus = AdoptionStatus = {}));
var AdoptionRequest = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('adoption_requests'), (0, typeorm_1.Index)(['userId', 'status']), (0, typeorm_1.Index)(['petId', 'status']), (0, typeorm_1.Index)(['shelterId', 'status']), (0, typeorm_1.Index)(['createdAt']), (0, typeorm_1.Check)("\"pawPointsUsedForReduction\" >= 0"), (0, typeorm_1.Check)("\"feeReduction\" >= 0")];
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
    var _shelter_decorators;
    var _shelter_initializers = [];
    var _shelter_extraInitializers = [];
    var _shelterId_decorators;
    var _shelterId_initializers = [];
    var _shelterId_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _message_decorators;
    var _message_initializers = [];
    var _message_extraInitializers = [];
    var _pawPointsUsedForReduction_decorators;
    var _pawPointsUsedForReduction_initializers = [];
    var _pawPointsUsedForReduction_extraInitializers = [];
    var _feeReduction_decorators;
    var _feeReduction_initializers = [];
    var _feeReduction_extraInitializers = [];
    var _emailSentAt_decorators;
    var _emailSentAt_initializers = [];
    var _emailSentAt_extraInitializers = [];
    var _approvedAt_decorators;
    var _approvedAt_initializers = [];
    var _approvedAt_extraInitializers = [];
    var _deniedAt_decorators;
    var _deniedAt_initializers = [];
    var _deniedAt_extraInitializers = [];
    var _cancelledAt_decorators;
    var _cancelledAt_initializers = [];
    var _cancelledAt_extraInitializers = [];
    var _statusReason_decorators;
    var _statusReason_initializers = [];
    var _statusReason_extraInitializers = [];
    var _adoptionProofImage_decorators;
    var _adoptionProofImage_initializers = [];
    var _adoptionProofImage_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _expiresAt_decorators;
    var _expiresAt_initializers = [];
    var _expiresAt_extraInitializers = [];
    var AdoptionRequest = _classThis = /** @class */ (function () {
        function AdoptionRequest_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            // User relation
            this.user = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _user_initializers, void 0));
            this.userId = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            // Pet relation
            this.pet = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _pet_initializers, void 0));
            this.petId = (__runInitializers(this, _pet_extraInitializers), __runInitializers(this, _petId_initializers, void 0));
            // Shelter relation
            this.shelter = (__runInitializers(this, _petId_extraInitializers), __runInitializers(this, _shelter_initializers, void 0));
            this.shelterId = (__runInitializers(this, _shelter_extraInitializers), __runInitializers(this, _shelterId_initializers, void 0));
            // Request details
            this.status = (__runInitializers(this, _shelterId_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.message = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _message_initializers, void 0));
            // PawPoints usage
            this.pawPointsUsedForReduction = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _pawPointsUsedForReduction_initializers, void 0));
            this.feeReduction = (__runInitializers(this, _pawPointsUsedForReduction_extraInitializers), __runInitializers(this, _feeReduction_initializers, void 0));
            // Email tracking
            this.emailSentAt = (__runInitializers(this, _feeReduction_extraInitializers), __runInitializers(this, _emailSentAt_initializers, void 0));
            // Status tracking
            this.approvedAt = (__runInitializers(this, _emailSentAt_extraInitializers), __runInitializers(this, _approvedAt_initializers, void 0));
            this.deniedAt = (__runInitializers(this, _approvedAt_extraInitializers), __runInitializers(this, _deniedAt_initializers, void 0));
            this.cancelledAt = (__runInitializers(this, _deniedAt_extraInitializers), __runInitializers(this, _cancelledAt_initializers, void 0));
            this.statusReason = (__runInitializers(this, _cancelledAt_extraInitializers), __runInitializers(this, _statusReason_initializers, void 0));
            // Proof of adoption
            this.adoptionProofImage = (__runInitializers(this, _statusReason_extraInitializers), __runInitializers(this, _adoptionProofImage_initializers, void 0));
            // Timestamps
            this.createdAt = (__runInitializers(this, _adoptionProofImage_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            // Expiry (7 days from creation)
            this.expiresAt = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _expiresAt_initializers, void 0));
            __runInitializers(this, _expiresAt_extraInitializers);
        }
        Object.defineProperty(AdoptionRequest_1.prototype, "isExpired", {
            // Helper methods
            get: function () {
                return new Date() > this.expiresAt;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AdoptionRequest_1.prototype, "canBeCancelled", {
            get: function () {
                var twentyFourHours = 24 * 60 * 60 * 1000;
                return (this.status === AdoptionStatus.PENDING &&
                    Date.now() - this.createdAt.getTime() < twentyFourHours);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AdoptionRequest_1.prototype, "finalAdoptionFee", {
            get: function () {
                // This would need the pet's adoption fee
                // Implemented in service layer
                return 0;
            },
            enumerable: false,
            configurable: true
        });
        // Status change methods
        AdoptionRequest_1.prototype.approve = function (proofImage) {
            if (this.status !== AdoptionStatus.PENDING) {
                throw new Error('Only pending requests can be approved');
            }
            if (this.isExpired) {
                throw new Error('This adoption request has expired');
            }
            this.status = AdoptionStatus.APPROVED;
            this.approvedAt = new Date();
            if (proofImage) {
                this.adoptionProofImage = proofImage;
            }
        };
        AdoptionRequest_1.prototype.deny = function (reason) {
            if (this.status !== AdoptionStatus.PENDING) {
                throw new Error('Only pending requests can be denied');
            }
            this.status = AdoptionStatus.DENIED;
            this.deniedAt = new Date();
            this.statusReason = reason;
        };
        AdoptionRequest_1.prototype.cancel = function () {
            if (!this.canBeCancelled) {
                throw new Error('This request cannot be cancelled (24-hour window has passed)');
            }
            this.status = AdoptionStatus.CANCELLED;
            this.cancelledAt = new Date();
        };
        AdoptionRequest_1.prototype.calculateFeeReduction = function () {
            // $5 reduction per PawPoint used
            this.feeReduction = this.pawPointsUsedForReduction * 5;
        };
        // Factory method
        AdoptionRequest_1.create = function (userId, petId, shelterId, pawPointsToUse, message) {
            if (pawPointsToUse === void 0) { pawPointsToUse = 0; }
            var request = new AdoptionRequest();
            request.userId = userId;
            request.petId = petId;
            request.shelterId = shelterId;
            request.pawPointsUsedForReduction = pawPointsToUse;
            request.message = message;
            request.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            request.calculateFeeReduction();
            return request;
        };
        return AdoptionRequest_1;
    }());
    __setFunctionName(_classThis, "AdoptionRequest");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _user_decorators = [(0, typeorm_1.ManyToOne)(function () { return user_entity_1.User; }), (0, typeorm_1.JoinColumn)()];
        _userId_decorators = [(0, typeorm_1.Column)()];
        _pet_decorators = [(0, typeorm_1.ManyToOne)(function () { return pet_entity_1.Pet; }), (0, typeorm_1.JoinColumn)()];
        _petId_decorators = [(0, typeorm_1.Column)()];
        _shelter_decorators = [(0, typeorm_1.ManyToOne)(function () { return shelter_entity_1.Shelter; }), (0, typeorm_1.JoinColumn)()];
        _shelterId_decorators = [(0, typeorm_1.Column)()];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: AdoptionStatus, default: AdoptionStatus.PENDING }), (0, class_validator_1.IsEnum)(AdoptionStatus)];
        _message_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Max)(1000)];
        _pawPointsUsedForReduction_decorators = [(0, typeorm_1.Column)({ default: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
        _feeReduction_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
        _emailSentAt_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _approvedAt_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _deniedAt_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _cancelledAt_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _statusReason_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _adoptionProofImage_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        _expiresAt_decorators = [(0, typeorm_1.Column)({ type: 'timestamp' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _pet_decorators, { kind: "field", name: "pet", static: false, private: false, access: { has: function (obj) { return "pet" in obj; }, get: function (obj) { return obj.pet; }, set: function (obj, value) { obj.pet = value; } }, metadata: _metadata }, _pet_initializers, _pet_extraInitializers);
        __esDecorate(null, null, _petId_decorators, { kind: "field", name: "petId", static: false, private: false, access: { has: function (obj) { return "petId" in obj; }, get: function (obj) { return obj.petId; }, set: function (obj, value) { obj.petId = value; } }, metadata: _metadata }, _petId_initializers, _petId_extraInitializers);
        __esDecorate(null, null, _shelter_decorators, { kind: "field", name: "shelter", static: false, private: false, access: { has: function (obj) { return "shelter" in obj; }, get: function (obj) { return obj.shelter; }, set: function (obj, value) { obj.shelter = value; } }, metadata: _metadata }, _shelter_initializers, _shelter_extraInitializers);
        __esDecorate(null, null, _shelterId_decorators, { kind: "field", name: "shelterId", static: false, private: false, access: { has: function (obj) { return "shelterId" in obj; }, get: function (obj) { return obj.shelterId; }, set: function (obj, value) { obj.shelterId = value; } }, metadata: _metadata }, _shelterId_initializers, _shelterId_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: function (obj) { return "message" in obj; }, get: function (obj) { return obj.message; }, set: function (obj, value) { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
        __esDecorate(null, null, _pawPointsUsedForReduction_decorators, { kind: "field", name: "pawPointsUsedForReduction", static: false, private: false, access: { has: function (obj) { return "pawPointsUsedForReduction" in obj; }, get: function (obj) { return obj.pawPointsUsedForReduction; }, set: function (obj, value) { obj.pawPointsUsedForReduction = value; } }, metadata: _metadata }, _pawPointsUsedForReduction_initializers, _pawPointsUsedForReduction_extraInitializers);
        __esDecorate(null, null, _feeReduction_decorators, { kind: "field", name: "feeReduction", static: false, private: false, access: { has: function (obj) { return "feeReduction" in obj; }, get: function (obj) { return obj.feeReduction; }, set: function (obj, value) { obj.feeReduction = value; } }, metadata: _metadata }, _feeReduction_initializers, _feeReduction_extraInitializers);
        __esDecorate(null, null, _emailSentAt_decorators, { kind: "field", name: "emailSentAt", static: false, private: false, access: { has: function (obj) { return "emailSentAt" in obj; }, get: function (obj) { return obj.emailSentAt; }, set: function (obj, value) { obj.emailSentAt = value; } }, metadata: _metadata }, _emailSentAt_initializers, _emailSentAt_extraInitializers);
        __esDecorate(null, null, _approvedAt_decorators, { kind: "field", name: "approvedAt", static: false, private: false, access: { has: function (obj) { return "approvedAt" in obj; }, get: function (obj) { return obj.approvedAt; }, set: function (obj, value) { obj.approvedAt = value; } }, metadata: _metadata }, _approvedAt_initializers, _approvedAt_extraInitializers);
        __esDecorate(null, null, _deniedAt_decorators, { kind: "field", name: "deniedAt", static: false, private: false, access: { has: function (obj) { return "deniedAt" in obj; }, get: function (obj) { return obj.deniedAt; }, set: function (obj, value) { obj.deniedAt = value; } }, metadata: _metadata }, _deniedAt_initializers, _deniedAt_extraInitializers);
        __esDecorate(null, null, _cancelledAt_decorators, { kind: "field", name: "cancelledAt", static: false, private: false, access: { has: function (obj) { return "cancelledAt" in obj; }, get: function (obj) { return obj.cancelledAt; }, set: function (obj, value) { obj.cancelledAt = value; } }, metadata: _metadata }, _cancelledAt_initializers, _cancelledAt_extraInitializers);
        __esDecorate(null, null, _statusReason_decorators, { kind: "field", name: "statusReason", static: false, private: false, access: { has: function (obj) { return "statusReason" in obj; }, get: function (obj) { return obj.statusReason; }, set: function (obj, value) { obj.statusReason = value; } }, metadata: _metadata }, _statusReason_initializers, _statusReason_extraInitializers);
        __esDecorate(null, null, _adoptionProofImage_decorators, { kind: "field", name: "adoptionProofImage", static: false, private: false, access: { has: function (obj) { return "adoptionProofImage" in obj; }, get: function (obj) { return obj.adoptionProofImage; }, set: function (obj, value) { obj.adoptionProofImage = value; } }, metadata: _metadata }, _adoptionProofImage_initializers, _adoptionProofImage_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: function (obj) { return "expiresAt" in obj; }, get: function (obj) { return obj.expiresAt; }, set: function (obj, value) { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AdoptionRequest = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AdoptionRequest = _classThis;
}();
exports.AdoptionRequest = AdoptionRequest;
