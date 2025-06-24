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
exports.SuccessStory = exports.SuccessStoryType = void 0;
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var pet_entity_1 = require("../../pets/entities/pet.entity");
var user_entity_1 = require("../../users/entities/user.entity");
var adoption_request_entity_1 = require("../../adoptions/entities/adoption-request.entity");
var SuccessStoryType;
(function (SuccessStoryType) {
    SuccessStoryType["ADOPTED_INTERNAL"] = "adopted_internal";
    SuccessStoryType["ADOPTED_EXTERNAL"] = "adopted_external";
    SuccessStoryType["DECEASED"] = "deceased";
    SuccessStoryType["ERROR"] = "error";
})(SuccessStoryType || (exports.SuccessStoryType = SuccessStoryType = {}));
var SuccessStory = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('success_stories'), (0, typeorm_1.Index)(['petId']), (0, typeorm_1.Index)(['type']), (0, typeorm_1.Index)(['createdAt'])];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _pet_decorators;
    var _pet_initializers = [];
    var _pet_extraInitializers = [];
    var _petId_decorators;
    var _petId_initializers = [];
    var _petId_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _affectedUserIds_decorators;
    var _affectedUserIds_initializers = [];
    var _affectedUserIds_extraInitializers = [];
    var _adopter_decorators;
    var _adopter_initializers = [];
    var _adopter_extraInitializers = [];
    var _adopterId_decorators;
    var _adopterId_initializers = [];
    var _adopterId_extraInitializers = [];
    var _adoptionRequest_decorators;
    var _adoptionRequest_initializers = [];
    var _adoptionRequest_extraInitializers = [];
    var _adoptionRequestId_decorators;
    var _adoptionRequestId_initializers = [];
    var _adoptionRequestId_extraInitializers = [];
    var _errorReason_decorators;
    var _errorReason_initializers = [];
    var _errorReason_extraInitializers = [];
    var _notificationsSent_decorators;
    var _notificationsSent_initializers = [];
    var _notificationsSent_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var SuccessStory = _classThis = /** @class */ (function () {
        function SuccessStory_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            // Pet relation
            this.pet = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _pet_initializers, void 0));
            this.petId = (__runInitializers(this, _pet_extraInitializers), __runInitializers(this, _petId_initializers, void 0));
            // Story type
            this.type = (__runInitializers(this, _petId_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            // Users to be notified (donor IDs)
            this.affectedUserIds = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _affectedUserIds_initializers, void 0));
            // Adopter (for internal adoptions)
            this.adopter = (__runInitializers(this, _affectedUserIds_extraInitializers), __runInitializers(this, _adopter_initializers, void 0));
            this.adopterId = (__runInitializers(this, _adopter_extraInitializers), __runInitializers(this, _adopterId_initializers, void 0));
            // Related adoption request (for internal adoptions)
            this.adoptionRequest = (__runInitializers(this, _adopterId_extraInitializers), __runInitializers(this, _adoptionRequest_initializers, void 0));
            this.adoptionRequestId = (__runInitializers(this, _adoptionRequest_extraInitializers), __runInitializers(this, _adoptionRequestId_initializers, void 0));
            // Error details (for error type)
            this.errorReason = (__runInitializers(this, _adoptionRequestId_extraInitializers), __runInitializers(this, _errorReason_initializers, void 0));
            // Notification tracking
            this.notificationsSent = (__runInitializers(this, _errorReason_extraInitializers), __runInitializers(this, _notificationsSent_initializers, void 0)); // userId -> sent status
            // Timestamp
            this.createdAt = (__runInitializers(this, _notificationsSent_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            __runInitializers(this, _createdAt_extraInitializers);
        }
        // Helper methods
        SuccessStory_1.prototype.shouldNotifyUser = function (userId) {
            return this.affectedUserIds.includes(userId) && !this.notificationsSent[userId];
        };
        SuccessStory_1.prototype.markNotificationSent = function (userId) {
            this.notificationsSent[userId] = true;
        };
        SuccessStory_1.prototype.getBonusPoints = function () {
            // Adoption and compassion bonuses give 1 PawPoint
            // Error bonus also gives 1 PawPoint
            switch (this.type) {
                case SuccessStoryType.ADOPTED_EXTERNAL:
                case SuccessStoryType.DECEASED:
                case SuccessStoryType.ERROR:
                    return 1;
                case SuccessStoryType.ADOPTED_INTERNAL:
                    // Internal adoption: only non-adopters get bonus
                    return 1;
                default:
                    return 0;
            }
        };
        SuccessStory_1.prototype.getStoryTitle = function () {
            switch (this.type) {
                case SuccessStoryType.ADOPTED_INTERNAL:
                case SuccessStoryType.ADOPTED_EXTERNAL:
                    return 'Adoption Success!';
                case SuccessStoryType.DECEASED:
                    return 'In Loving Memory';
                case SuccessStoryType.ERROR:
                    return 'Update from Shelter';
                default:
                    return 'Pet Update';
            }
        };
        SuccessStory_1.prototype.getStoryMessage = function (petName, shelterName) {
            switch (this.type) {
                case SuccessStoryType.ADOPTED_INTERNAL:
                    return "Great news! ".concat(petName, " has found their forever home through Project Eden. Thank you for your support in making this possible!");
                case SuccessStoryType.ADOPTED_EXTERNAL:
                    return "Wonderful news! ".concat(petName, " has been adopted and found their forever home. Your support helped care for them until they found their family!");
                case SuccessStoryType.DECEASED:
                    return "We're sad to share that ".concat(petName, " has passed away. ").concat(shelterName, " thanks you for your compassion and support during their time at the shelter.");
                case SuccessStoryType.ERROR:
                    return "".concat(shelterName, " has reported an error with ").concat(petName, "'s listing. ").concat(this.errorReason || 'The listing has been removed.', " We apologize for any inconvenience.");
                default:
                    return "Update about ".concat(petName, " from ").concat(shelterName, ".");
            }
        };
        // Factory methods
        SuccessStory_1.createAdoptionStory = function (petId, affectedUserIds, adopterId, adoptionRequestId) {
            var story = new SuccessStory();
            story.petId = petId;
            story.type = adopterId ? SuccessStoryType.ADOPTED_INTERNAL : SuccessStoryType.ADOPTED_EXTERNAL;
            story.affectedUserIds = affectedUserIds;
            story.adopterId = adopterId;
            story.adoptionRequestId = adoptionRequestId;
            return story;
        };
        SuccessStory_1.createDeceasedStory = function (petId, affectedUserIds) {
            var story = new SuccessStory();
            story.petId = petId;
            story.type = SuccessStoryType.DECEASED;
            story.affectedUserIds = affectedUserIds;
            return story;
        };
        SuccessStory_1.createErrorStory = function (petId, affectedUserIds, errorReason) {
            var story = new SuccessStory();
            story.petId = petId;
            story.type = SuccessStoryType.ERROR;
            story.affectedUserIds = affectedUserIds;
            story.errorReason = errorReason;
            return story;
        };
        return SuccessStory_1;
    }());
    __setFunctionName(_classThis, "SuccessStory");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _pet_decorators = [(0, typeorm_1.ManyToOne)(function () { return pet_entity_1.Pet; }), (0, typeorm_1.JoinColumn)()];
        _petId_decorators = [(0, typeorm_1.Column)()];
        _type_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: SuccessStoryType }), (0, class_validator_1.IsEnum)(SuccessStoryType)];
        _affectedUserIds_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', default: [] }), (0, class_validator_1.IsArray)()];
        _adopter_decorators = [(0, typeorm_1.ManyToOne)(function () { return user_entity_1.User; }, { nullable: true }), (0, typeorm_1.JoinColumn)()];
        _adopterId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _adoptionRequest_decorators = [(0, typeorm_1.ManyToOne)(function () { return adoption_request_entity_1.AdoptionRequest; }, { nullable: true }), (0, typeorm_1.JoinColumn)()];
        _adoptionRequestId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _errorReason_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _notificationsSent_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', default: {} })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _pet_decorators, { kind: "field", name: "pet", static: false, private: false, access: { has: function (obj) { return "pet" in obj; }, get: function (obj) { return obj.pet; }, set: function (obj, value) { obj.pet = value; } }, metadata: _metadata }, _pet_initializers, _pet_extraInitializers);
        __esDecorate(null, null, _petId_decorators, { kind: "field", name: "petId", static: false, private: false, access: { has: function (obj) { return "petId" in obj; }, get: function (obj) { return obj.petId; }, set: function (obj, value) { obj.petId = value; } }, metadata: _metadata }, _petId_initializers, _petId_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _affectedUserIds_decorators, { kind: "field", name: "affectedUserIds", static: false, private: false, access: { has: function (obj) { return "affectedUserIds" in obj; }, get: function (obj) { return obj.affectedUserIds; }, set: function (obj, value) { obj.affectedUserIds = value; } }, metadata: _metadata }, _affectedUserIds_initializers, _affectedUserIds_extraInitializers);
        __esDecorate(null, null, _adopter_decorators, { kind: "field", name: "adopter", static: false, private: false, access: { has: function (obj) { return "adopter" in obj; }, get: function (obj) { return obj.adopter; }, set: function (obj, value) { obj.adopter = value; } }, metadata: _metadata }, _adopter_initializers, _adopter_extraInitializers);
        __esDecorate(null, null, _adopterId_decorators, { kind: "field", name: "adopterId", static: false, private: false, access: { has: function (obj) { return "adopterId" in obj; }, get: function (obj) { return obj.adopterId; }, set: function (obj, value) { obj.adopterId = value; } }, metadata: _metadata }, _adopterId_initializers, _adopterId_extraInitializers);
        __esDecorate(null, null, _adoptionRequest_decorators, { kind: "field", name: "adoptionRequest", static: false, private: false, access: { has: function (obj) { return "adoptionRequest" in obj; }, get: function (obj) { return obj.adoptionRequest; }, set: function (obj, value) { obj.adoptionRequest = value; } }, metadata: _metadata }, _adoptionRequest_initializers, _adoptionRequest_extraInitializers);
        __esDecorate(null, null, _adoptionRequestId_decorators, { kind: "field", name: "adoptionRequestId", static: false, private: false, access: { has: function (obj) { return "adoptionRequestId" in obj; }, get: function (obj) { return obj.adoptionRequestId; }, set: function (obj, value) { obj.adoptionRequestId = value; } }, metadata: _metadata }, _adoptionRequestId_initializers, _adoptionRequestId_extraInitializers);
        __esDecorate(null, null, _errorReason_decorators, { kind: "field", name: "errorReason", static: false, private: false, access: { has: function (obj) { return "errorReason" in obj; }, get: function (obj) { return obj.errorReason; }, set: function (obj, value) { obj.errorReason = value; } }, metadata: _metadata }, _errorReason_initializers, _errorReason_extraInitializers);
        __esDecorate(null, null, _notificationsSent_decorators, { kind: "field", name: "notificationsSent", static: false, private: false, access: { has: function (obj) { return "notificationsSent" in obj; }, get: function (obj) { return obj.notificationsSent; }, set: function (obj, value) { obj.notificationsSent = value; } }, metadata: _metadata }, _notificationsSent_initializers, _notificationsSent_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SuccessStory = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SuccessStory = _classThis;
}();
exports.SuccessStory = SuccessStory;
