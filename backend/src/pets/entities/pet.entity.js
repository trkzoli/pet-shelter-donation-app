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
exports.Pet = exports.PetStatus = exports.PetGender = exports.PetType = void 0;
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var shelter_entity_1 = require("../../shelters/entities/shelter.entity");
var donation_entity_1 = require("../../donations/entities/donation.entity");
var adoption_request_entity_1 = require("../../adoptions/entities/adoption-request.entity");
var success_story_entity_1 = require("../../success-stories/entities/success-story.entity");
var PetType;
(function (PetType) {
    PetType["DOG"] = "dog";
    PetType["CAT"] = "cat";
})(PetType || (exports.PetType = PetType = {}));
var PetGender;
(function (PetGender) {
    PetGender["MALE"] = "male";
    PetGender["FEMALE"] = "female";
})(PetGender || (exports.PetGender = PetGender = {}));
var PetStatus;
(function (PetStatus) {
    PetStatus["DRAFT"] = "draft";
    PetStatus["PUBLISHED"] = "published";
    PetStatus["ADOPTED"] = "adopted";
    PetStatus["REMOVED"] = "removed";
})(PetStatus || (exports.PetStatus = PetStatus = {}));
var Pet = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('pets'), (0, typeorm_1.Index)(['shelterId', 'status']), (0, typeorm_1.Index)(['createdAt'])];
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
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _breed_decorators;
    var _breed_initializers = [];
    var _breed_extraInitializers = [];
    var _age_decorators;
    var _age_initializers = [];
    var _age_extraInitializers = [];
    var _gender_decorators;
    var _gender_initializers = [];
    var _gender_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _vaccinated_decorators;
    var _vaccinated_initializers = [];
    var _vaccinated_extraInitializers = [];
    var _dewormed_decorators;
    var _dewormed_initializers = [];
    var _dewormed_extraInitializers = [];
    var _spayedNeutered_decorators;
    var _spayedNeutered_initializers = [];
    var _spayedNeutered_extraInitializers = [];
    var _adoptionFee_decorators;
    var _adoptionFee_initializers = [];
    var _adoptionFee_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _story_decorators;
    var _story_initializers = [];
    var _story_extraInitializers = [];
    var _mainImage_decorators;
    var _mainImage_initializers = [];
    var _mainImage_extraInitializers = [];
    var _additionalImages_decorators;
    var _additionalImages_initializers = [];
    var _additionalImages_extraInitializers = [];
    var _microchipNumber_decorators;
    var _microchipNumber_initializers = [];
    var _microchipNumber_extraInitializers = [];
    var _vetRecords_decorators;
    var _vetRecords_initializers = [];
    var _vetRecords_extraInitializers = [];
    var _monthlyGoals_decorators;
    var _monthlyGoals_initializers = [];
    var _monthlyGoals_extraInitializers = [];
    var _goalsLastReset_decorators;
    var _goalsLastReset_initializers = [];
    var _goalsLastReset_extraInitializers = [];
    var _totalDonationsReceived_decorators;
    var _totalDonationsReceived_initializers = [];
    var _totalDonationsReceived_extraInitializers = [];
    var _currentMonthDonations_decorators;
    var _currentMonthDonations_initializers = [];
    var _currentMonthDonations_extraInitializers = [];
    var _currentMonthDistribution_decorators;
    var _currentMonthDistribution_initializers = [];
    var _currentMonthDistribution_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _publishedAt_decorators;
    var _publishedAt_initializers = [];
    var _publishedAt_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _donations_decorators;
    var _donations_initializers = [];
    var _donations_extraInitializers = [];
    var _adoptionRequests_decorators;
    var _adoptionRequests_initializers = [];
    var _adoptionRequests_extraInitializers = [];
    var _successStories_decorators;
    var _successStories_initializers = [];
    var _successStories_extraInitializers = [];
    var _validateImages_decorators;
    var _checkEditability_decorators;
    var Pet = _classThis = /** @class */ (function () {
        function Pet_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            // Shelter relation
            this.shelter = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _shelter_initializers, void 0));
            this.shelterId = (__runInitializers(this, _shelter_extraInitializers), __runInitializers(this, _shelterId_initializers, void 0));
            // Basic information
            this.name = (__runInitializers(this, _shelterId_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.breed = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _breed_initializers, void 0));
            this.age = (__runInitializers(this, _breed_extraInitializers), __runInitializers(this, _age_initializers, void 0));
            this.gender = (__runInitializers(this, _age_extraInitializers), __runInitializers(this, _gender_initializers, void 0));
            this.type = (__runInitializers(this, _gender_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            // Medical information
            this.vaccinated = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _vaccinated_initializers, void 0));
            this.dewormed = (__runInitializers(this, _vaccinated_extraInitializers), __runInitializers(this, _dewormed_initializers, void 0));
            this.spayedNeutered = (__runInitializers(this, _dewormed_extraInitializers), __runInitializers(this, _spayedNeutered_initializers, void 0));
            // Adoption details
            this.adoptionFee = (__runInitializers(this, _spayedNeutered_extraInitializers), __runInitializers(this, _adoptionFee_initializers, void 0));
            this.description = (__runInitializers(this, _adoptionFee_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            this.story = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _story_initializers, void 0));
            // Images
            this.mainImage = (__runInitializers(this, _story_extraInitializers), __runInitializers(this, _mainImage_initializers, void 0));
            this.additionalImages = (__runInitializers(this, _mainImage_extraInitializers), __runInitializers(this, _additionalImages_initializers, void 0));
            // Verification
            this.microchipNumber = (__runInitializers(this, _additionalImages_extraInitializers), __runInitializers(this, _microchipNumber_initializers, void 0));
            this.vetRecords = (__runInitializers(this, _microchipNumber_extraInitializers), __runInitializers(this, _vetRecords_initializers, void 0));
            // Monthly goals (JSON)
            this.monthlyGoals = (__runInitializers(this, _vetRecords_extraInitializers), __runInitializers(this, _monthlyGoals_initializers, void 0));
            this.goalsLastReset = (__runInitializers(this, _monthlyGoals_extraInitializers), __runInitializers(this, _goalsLastReset_initializers, void 0));
            // Donation tracking
            this.totalDonationsReceived = (__runInitializers(this, _goalsLastReset_extraInitializers), __runInitializers(this, _totalDonationsReceived_initializers, void 0));
            this.currentMonthDonations = (__runInitializers(this, _totalDonationsReceived_extraInitializers), __runInitializers(this, _currentMonthDonations_initializers, void 0));
            // Donation distribution for current month
            this.currentMonthDistribution = (__runInitializers(this, _currentMonthDonations_extraInitializers), __runInitializers(this, _currentMonthDistribution_initializers, void 0));
            // Status
            this.status = (__runInitializers(this, _currentMonthDistribution_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.publishedAt = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _publishedAt_initializers, void 0));
            // Timestamps
            this.createdAt = (__runInitializers(this, _publishedAt_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            // Relations (to be defined in other entities)
            this.donations = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _donations_initializers, void 0));
            this.adoptionRequests = (__runInitializers(this, _donations_extraInitializers), __runInitializers(this, _adoptionRequests_initializers, void 0));
            this.successStories = (__runInitializers(this, _adoptionRequests_extraInitializers), __runInitializers(this, _successStories_initializers, void 0));
            __runInitializers(this, _successStories_extraInitializers);
        }
        Object.defineProperty(Pet_1.prototype, "isEditable", {
            // Virtual fields
            get: function () {
                var twentyFourHours = 24 * 60 * 60 * 1000;
                return Date.now() - this.createdAt.getTime() < twentyFourHours;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pet_1.prototype, "totalMonthlyGoal", {
            get: function () {
                return (this.monthlyGoals.vaccination +
                    this.monthlyGoals.food +
                    this.monthlyGoals.medical +
                    this.monthlyGoals.other);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pet_1.prototype, "monthlyGoalProgress", {
            get: function () {
                if (this.totalMonthlyGoal === 0)
                    return 0;
                return Math.round((this.currentMonthDonations / this.totalMonthlyGoal) * 100);
            },
            enumerable: false,
            configurable: true
        });
        // Hooks
        Pet_1.prototype.validateImages = function () {
            if (!this.mainImage) {
                throw new Error('Main image is required');
            }
            if (this.additionalImages.length > 10) {
                throw new Error('Maximum 10 additional images allowed');
            }
        };
        Pet_1.prototype.checkEditability = function () {
            // This should be handled at the service level with proper checks
            // Only allow certain fields to be updated after 24 hours
        };
        // Helper methods
        Pet_1.prototype.canBeEdited = function () {
            return this.isEditable;
        };
        Pet_1.prototype.publish = function () {
            if (this.status !== PetStatus.DRAFT) {
                throw new Error('Only draft pets can be published');
            }
            this.status = PetStatus.PUBLISHED;
            this.publishedAt = new Date();
        };
        Pet_1.prototype.markAsAdopted = function () {
            if (this.status !== PetStatus.PUBLISHED) {
                throw new Error('Only published pets can be marked as adopted');
            }
            this.status = PetStatus.ADOPTED;
        };
        Pet_1.prototype.remove = function (reason) {
            if (this.status !== PetStatus.PUBLISHED) {
                throw new Error('Only published pets can be removed');
            }
            this.status = PetStatus.REMOVED;
        };
        Pet_1.prototype.resetMonthlyGoals = function () {
            this.currentMonthDonations = 0;
            this.currentMonthDistribution = { vaccination: 0, food: 0, medical: 0, other: 0 };
            this.goalsLastReset = new Date();
        };
        Pet_1.prototype.shouldResetGoals = function () {
            if (!this.goalsLastReset)
                return true;
            var daysSinceReset = Math.floor((Date.now() - this.goalsLastReset.getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceReset >= 31;
        };
        Pet_1.prototype.distributeDonation = function (amount) {
            var total = this.totalMonthlyGoal;
            if (total === 0) {
                // Equal distribution if no goals set
                var quarter = amount / 4;
                return {
                    vaccination: quarter,
                    food: quarter,
                    medical: quarter,
                    other: quarter,
                };
            }
            // Distribute proportionally to goal amounts
            return {
                vaccination: (amount * this.monthlyGoals.vaccination) / total,
                food: (amount * this.monthlyGoals.food) / total,
                medical: (amount * this.monthlyGoals.medical) / total,
                other: (amount * this.monthlyGoals.other) / total,
            };
        };
        return Pet_1;
    }());
    __setFunctionName(_classThis, "Pet");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _shelter_decorators = [(0, typeorm_1.ManyToOne)(function () { return shelter_entity_1.Shelter; }), (0, typeorm_1.JoinColumn)()];
        _shelterId_decorators = [(0, typeorm_1.Column)()];
        _name_decorators = [(0, typeorm_1.Column)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(100)];
        _breed_decorators = [(0, typeorm_1.Column)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(100)];
        _age_decorators = [(0, typeorm_1.Column)(), (0, class_validator_1.IsString)()];
        _gender_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: PetGender }), (0, class_validator_1.IsEnum)(PetGender)];
        _type_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: PetType }), (0, class_validator_1.IsEnum)(PetType)];
        _vaccinated_decorators = [(0, typeorm_1.Column)({ default: false }), (0, class_validator_1.IsBoolean)()];
        _dewormed_decorators = [(0, typeorm_1.Column)({ default: false }), (0, class_validator_1.IsBoolean)()];
        _spayedNeutered_decorators = [(0, typeorm_1.Column)({ default: false }), (0, class_validator_1.IsBoolean)()];
        _adoptionFee_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
        _description_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(2000)];
        _story_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(5000)];
        _mainImage_decorators = [(0, typeorm_1.Column)(), (0, class_validator_1.IsString)()];
        _additionalImages_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', default: [] }), (0, class_validator_1.IsArray)(), (0, class_validator_1.ArrayMaxSize)(10)];
        _microchipNumber_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _vetRecords_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _monthlyGoals_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', default: { vaccination: 0, food: 0, medical: 0, other: 0 } }), (0, class_validator_1.IsJSON)()];
        _goalsLastReset_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _totalDonationsReceived_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
        _currentMonthDonations_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
        _currentMonthDistribution_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', default: { vaccination: 0, food: 0, medical: 0, other: 0 } }), (0, class_validator_1.IsJSON)()];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: PetStatus, default: PetStatus.DRAFT }), (0, class_validator_1.IsEnum)(PetStatus)];
        _publishedAt_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        _donations_decorators = [(0, typeorm_1.OneToMany)(function () { return donation_entity_1.Donation; }, function (donation) { return donation.pet; })];
        _adoptionRequests_decorators = [(0, typeorm_1.OneToMany)(function () { return adoption_request_entity_1.AdoptionRequest; }, function (request) { return request.pet; })];
        _successStories_decorators = [(0, typeorm_1.OneToMany)(function () { return success_story_entity_1.SuccessStory; }, function (story) { return story.pet; })];
        _validateImages_decorators = [(0, typeorm_1.BeforeInsert)(), (0, typeorm_1.BeforeUpdate)()];
        _checkEditability_decorators = [(0, typeorm_1.BeforeUpdate)()];
        __esDecorate(_classThis, null, _validateImages_decorators, { kind: "method", name: "validateImages", static: false, private: false, access: { has: function (obj) { return "validateImages" in obj; }, get: function (obj) { return obj.validateImages; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _checkEditability_decorators, { kind: "method", name: "checkEditability", static: false, private: false, access: { has: function (obj) { return "checkEditability" in obj; }, get: function (obj) { return obj.checkEditability; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _shelter_decorators, { kind: "field", name: "shelter", static: false, private: false, access: { has: function (obj) { return "shelter" in obj; }, get: function (obj) { return obj.shelter; }, set: function (obj, value) { obj.shelter = value; } }, metadata: _metadata }, _shelter_initializers, _shelter_extraInitializers);
        __esDecorate(null, null, _shelterId_decorators, { kind: "field", name: "shelterId", static: false, private: false, access: { has: function (obj) { return "shelterId" in obj; }, get: function (obj) { return obj.shelterId; }, set: function (obj, value) { obj.shelterId = value; } }, metadata: _metadata }, _shelterId_initializers, _shelterId_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _breed_decorators, { kind: "field", name: "breed", static: false, private: false, access: { has: function (obj) { return "breed" in obj; }, get: function (obj) { return obj.breed; }, set: function (obj, value) { obj.breed = value; } }, metadata: _metadata }, _breed_initializers, _breed_extraInitializers);
        __esDecorate(null, null, _age_decorators, { kind: "field", name: "age", static: false, private: false, access: { has: function (obj) { return "age" in obj; }, get: function (obj) { return obj.age; }, set: function (obj, value) { obj.age = value; } }, metadata: _metadata }, _age_initializers, _age_extraInitializers);
        __esDecorate(null, null, _gender_decorators, { kind: "field", name: "gender", static: false, private: false, access: { has: function (obj) { return "gender" in obj; }, get: function (obj) { return obj.gender; }, set: function (obj, value) { obj.gender = value; } }, metadata: _metadata }, _gender_initializers, _gender_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _vaccinated_decorators, { kind: "field", name: "vaccinated", static: false, private: false, access: { has: function (obj) { return "vaccinated" in obj; }, get: function (obj) { return obj.vaccinated; }, set: function (obj, value) { obj.vaccinated = value; } }, metadata: _metadata }, _vaccinated_initializers, _vaccinated_extraInitializers);
        __esDecorate(null, null, _dewormed_decorators, { kind: "field", name: "dewormed", static: false, private: false, access: { has: function (obj) { return "dewormed" in obj; }, get: function (obj) { return obj.dewormed; }, set: function (obj, value) { obj.dewormed = value; } }, metadata: _metadata }, _dewormed_initializers, _dewormed_extraInitializers);
        __esDecorate(null, null, _spayedNeutered_decorators, { kind: "field", name: "spayedNeutered", static: false, private: false, access: { has: function (obj) { return "spayedNeutered" in obj; }, get: function (obj) { return obj.spayedNeutered; }, set: function (obj, value) { obj.spayedNeutered = value; } }, metadata: _metadata }, _spayedNeutered_initializers, _spayedNeutered_extraInitializers);
        __esDecorate(null, null, _adoptionFee_decorators, { kind: "field", name: "adoptionFee", static: false, private: false, access: { has: function (obj) { return "adoptionFee" in obj; }, get: function (obj) { return obj.adoptionFee; }, set: function (obj, value) { obj.adoptionFee = value; } }, metadata: _metadata }, _adoptionFee_initializers, _adoptionFee_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _story_decorators, { kind: "field", name: "story", static: false, private: false, access: { has: function (obj) { return "story" in obj; }, get: function (obj) { return obj.story; }, set: function (obj, value) { obj.story = value; } }, metadata: _metadata }, _story_initializers, _story_extraInitializers);
        __esDecorate(null, null, _mainImage_decorators, { kind: "field", name: "mainImage", static: false, private: false, access: { has: function (obj) { return "mainImage" in obj; }, get: function (obj) { return obj.mainImage; }, set: function (obj, value) { obj.mainImage = value; } }, metadata: _metadata }, _mainImage_initializers, _mainImage_extraInitializers);
        __esDecorate(null, null, _additionalImages_decorators, { kind: "field", name: "additionalImages", static: false, private: false, access: { has: function (obj) { return "additionalImages" in obj; }, get: function (obj) { return obj.additionalImages; }, set: function (obj, value) { obj.additionalImages = value; } }, metadata: _metadata }, _additionalImages_initializers, _additionalImages_extraInitializers);
        __esDecorate(null, null, _microchipNumber_decorators, { kind: "field", name: "microchipNumber", static: false, private: false, access: { has: function (obj) { return "microchipNumber" in obj; }, get: function (obj) { return obj.microchipNumber; }, set: function (obj, value) { obj.microchipNumber = value; } }, metadata: _metadata }, _microchipNumber_initializers, _microchipNumber_extraInitializers);
        __esDecorate(null, null, _vetRecords_decorators, { kind: "field", name: "vetRecords", static: false, private: false, access: { has: function (obj) { return "vetRecords" in obj; }, get: function (obj) { return obj.vetRecords; }, set: function (obj, value) { obj.vetRecords = value; } }, metadata: _metadata }, _vetRecords_initializers, _vetRecords_extraInitializers);
        __esDecorate(null, null, _monthlyGoals_decorators, { kind: "field", name: "monthlyGoals", static: false, private: false, access: { has: function (obj) { return "monthlyGoals" in obj; }, get: function (obj) { return obj.monthlyGoals; }, set: function (obj, value) { obj.monthlyGoals = value; } }, metadata: _metadata }, _monthlyGoals_initializers, _monthlyGoals_extraInitializers);
        __esDecorate(null, null, _goalsLastReset_decorators, { kind: "field", name: "goalsLastReset", static: false, private: false, access: { has: function (obj) { return "goalsLastReset" in obj; }, get: function (obj) { return obj.goalsLastReset; }, set: function (obj, value) { obj.goalsLastReset = value; } }, metadata: _metadata }, _goalsLastReset_initializers, _goalsLastReset_extraInitializers);
        __esDecorate(null, null, _totalDonationsReceived_decorators, { kind: "field", name: "totalDonationsReceived", static: false, private: false, access: { has: function (obj) { return "totalDonationsReceived" in obj; }, get: function (obj) { return obj.totalDonationsReceived; }, set: function (obj, value) { obj.totalDonationsReceived = value; } }, metadata: _metadata }, _totalDonationsReceived_initializers, _totalDonationsReceived_extraInitializers);
        __esDecorate(null, null, _currentMonthDonations_decorators, { kind: "field", name: "currentMonthDonations", static: false, private: false, access: { has: function (obj) { return "currentMonthDonations" in obj; }, get: function (obj) { return obj.currentMonthDonations; }, set: function (obj, value) { obj.currentMonthDonations = value; } }, metadata: _metadata }, _currentMonthDonations_initializers, _currentMonthDonations_extraInitializers);
        __esDecorate(null, null, _currentMonthDistribution_decorators, { kind: "field", name: "currentMonthDistribution", static: false, private: false, access: { has: function (obj) { return "currentMonthDistribution" in obj; }, get: function (obj) { return obj.currentMonthDistribution; }, set: function (obj, value) { obj.currentMonthDistribution = value; } }, metadata: _metadata }, _currentMonthDistribution_initializers, _currentMonthDistribution_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _publishedAt_decorators, { kind: "field", name: "publishedAt", static: false, private: false, access: { has: function (obj) { return "publishedAt" in obj; }, get: function (obj) { return obj.publishedAt; }, set: function (obj, value) { obj.publishedAt = value; } }, metadata: _metadata }, _publishedAt_initializers, _publishedAt_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _donations_decorators, { kind: "field", name: "donations", static: false, private: false, access: { has: function (obj) { return "donations" in obj; }, get: function (obj) { return obj.donations; }, set: function (obj, value) { obj.donations = value; } }, metadata: _metadata }, _donations_initializers, _donations_extraInitializers);
        __esDecorate(null, null, _adoptionRequests_decorators, { kind: "field", name: "adoptionRequests", static: false, private: false, access: { has: function (obj) { return "adoptionRequests" in obj; }, get: function (obj) { return obj.adoptionRequests; }, set: function (obj, value) { obj.adoptionRequests = value; } }, metadata: _metadata }, _adoptionRequests_initializers, _adoptionRequests_extraInitializers);
        __esDecorate(null, null, _successStories_decorators, { kind: "field", name: "successStories", static: false, private: false, access: { has: function (obj) { return "successStories" in obj; }, get: function (obj) { return obj.successStories; }, set: function (obj, value) { obj.successStories = value; } }, metadata: _metadata }, _successStories_initializers, _successStories_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Pet = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Pet = _classThis;
}();
exports.Pet = Pet;
