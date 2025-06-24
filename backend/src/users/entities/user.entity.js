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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.ExperienceLevel = exports.FenceStatus = exports.YardStatus = exports.OwnershipStatus = exports.HousingType = exports.UserRole = void 0;
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var bcrypt = require("bcrypt");
var shelter_entity_1 = require("../../shelters/entities/shelter.entity");
var donation_entity_1 = require("../../donations/entities/donation.entity");
var pawpoint_transaction_entity_1 = require("../../donations/entities/pawpoint-transaction.entity");
var adoption_request_entity_1 = require("../../adoptions/entities/adoption-request.entity");
var UserRole;
(function (UserRole) {
    UserRole["DONOR"] = "donor";
    UserRole["SHELTER"] = "shelter";
})(UserRole || (exports.UserRole = UserRole = {}));
var HousingType;
(function (HousingType) {
    HousingType["HOUSE"] = "house";
    HousingType["APARTMENT"] = "apartment";
    HousingType["CONDO"] = "condo";
})(HousingType || (exports.HousingType = HousingType = {}));
var OwnershipStatus;
(function (OwnershipStatus) {
    OwnershipStatus["OWN"] = "own";
    OwnershipStatus["RENT"] = "rent";
    OwnershipStatus["FAMILY"] = "family";
})(OwnershipStatus || (exports.OwnershipStatus = OwnershipStatus = {}));
var YardStatus;
(function (YardStatus) {
    YardStatus["YES"] = "yes";
    YardStatus["NO"] = "no";
    YardStatus["SHARED"] = "shared";
})(YardStatus || (exports.YardStatus = YardStatus = {}));
var FenceStatus;
(function (FenceStatus) {
    FenceStatus["YES"] = "yes";
    FenceStatus["NO"] = "no";
    FenceStatus["PARTIALLY"] = "partially";
})(FenceStatus || (exports.FenceStatus = FenceStatus = {}));
var ExperienceLevel;
(function (ExperienceLevel) {
    ExperienceLevel["FIRST_TIME"] = "first_time";
    ExperienceLevel["SOME_EXPERIENCE"] = "some_experience";
    ExperienceLevel["EXPERIENCED"] = "experienced";
    ExperienceLevel["VERY_EXPERIENCED"] = "very_experienced";
})(ExperienceLevel || (exports.ExperienceLevel = ExperienceLevel = {}));
var User = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('users'), (0, typeorm_1.Index)(['email'], { unique: true }), (0, typeorm_1.Check)("\"pawPoints\" >= 0")];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _password_decorators;
    var _password_initializers = [];
    var _password_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _phone_decorators;
    var _phone_initializers = [];
    var _phone_extraInitializers = [];
    var _street_decorators;
    var _street_initializers = [];
    var _street_extraInitializers = [];
    var _city_decorators;
    var _city_initializers = [];
    var _city_extraInitializers = [];
    var _state_decorators;
    var _state_initializers = [];
    var _state_extraInitializers = [];
    var _zip_decorators;
    var _zip_initializers = [];
    var _zip_extraInitializers = [];
    var _country_decorators;
    var _country_initializers = [];
    var _country_extraInitializers = [];
    var _housingType_decorators;
    var _housingType_initializers = [];
    var _housingType_extraInitializers = [];
    var _ownershipStatus_decorators;
    var _ownershipStatus_initializers = [];
    var _ownershipStatus_extraInitializers = [];
    var _hasYard_decorators;
    var _hasYard_initializers = [];
    var _hasYard_extraInitializers = [];
    var _isFenced_decorators;
    var _isFenced_initializers = [];
    var _isFenced_extraInitializers = [];
    var _currentPets_decorators;
    var _currentPets_initializers = [];
    var _currentPets_extraInitializers = [];
    var _previousPets_decorators;
    var _previousPets_initializers = [];
    var _previousPets_extraInitializers = [];
    var _experienceLevel_decorators;
    var _experienceLevel_initializers = [];
    var _experienceLevel_extraInitializers = [];
    var _occupation_decorators;
    var _occupation_initializers = [];
    var _occupation_extraInitializers = [];
    var _workSchedule_decorators;
    var _workSchedule_initializers = [];
    var _workSchedule_extraInitializers = [];
    var _whyAdopt_decorators;
    var _whyAdopt_initializers = [];
    var _whyAdopt_extraInitializers = [];
    var _profileImage_decorators;
    var _profileImage_initializers = [];
    var _profileImage_extraInitializers = [];
    var _profileCompleteness_decorators;
    var _profileCompleteness_initializers = [];
    var _profileCompleteness_extraInitializers = [];
    var _pawPoints_decorators;
    var _pawPoints_initializers = [];
    var _pawPoints_extraInitializers = [];
    var _totalDonated_decorators;
    var _totalDonated_initializers = [];
    var _totalDonated_extraInitializers = [];
    var _emailVerified_decorators;
    var _emailVerified_initializers = [];
    var _emailVerified_extraInitializers = [];
    var _verificationCode_decorators;
    var _verificationCode_initializers = [];
    var _verificationCode_extraInitializers = [];
    var _verificationCodeExpiry_decorators;
    var _verificationCodeExpiry_initializers = [];
    var _verificationCodeExpiry_extraInitializers = [];
    var _resetToken_decorators;
    var _resetToken_initializers = [];
    var _resetToken_extraInitializers = [];
    var _resetTokenExpiry_decorators;
    var _resetTokenExpiry_initializers = [];
    var _resetTokenExpiry_extraInitializers = [];
    var _role_decorators;
    var _role_initializers = [];
    var _role_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _shelter_decorators;
    var _shelter_initializers = [];
    var _shelter_extraInitializers = [];
    var _donations_decorators;
    var _donations_initializers = [];
    var _donations_extraInitializers = [];
    var _pawPointTransactions_decorators;
    var _pawPointTransactions_initializers = [];
    var _pawPointTransactions_extraInitializers = [];
    var _adoptionRequests_decorators;
    var _adoptionRequests_initializers = [];
    var _adoptionRequests_extraInitializers = [];
    var _hashPassword_decorators;
    var _calculateProfileCompletion_decorators;
    var User = _classThis = /** @class */ (function () {
        function User_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            // Authentication fields
            this.email = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _email_initializers, void 0));
            this.password = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _password_initializers, void 0));
            this.name = (__runInitializers(this, _password_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.phone = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
            // Address fields
            this.street = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _street_initializers, void 0));
            this.city = (__runInitializers(this, _street_extraInitializers), __runInitializers(this, _city_initializers, void 0));
            this.state = (__runInitializers(this, _city_extraInitializers), __runInitializers(this, _state_initializers, void 0));
            this.zip = (__runInitializers(this, _state_extraInitializers), __runInitializers(this, _zip_initializers, void 0));
            this.country = (__runInitializers(this, _zip_extraInitializers), __runInitializers(this, _country_initializers, void 0));
            // Housing information (for donors)
            this.housingType = (__runInitializers(this, _country_extraInitializers), __runInitializers(this, _housingType_initializers, void 0));
            this.ownershipStatus = (__runInitializers(this, _housingType_extraInitializers), __runInitializers(this, _ownershipStatus_initializers, void 0));
            this.hasYard = (__runInitializers(this, _ownershipStatus_extraInitializers), __runInitializers(this, _hasYard_initializers, void 0));
            this.isFenced = (__runInitializers(this, _hasYard_extraInitializers), __runInitializers(this, _isFenced_initializers, void 0));
            // Pet experience fields
            this.currentPets = (__runInitializers(this, _isFenced_extraInitializers), __runInitializers(this, _currentPets_initializers, void 0));
            this.previousPets = (__runInitializers(this, _currentPets_extraInitializers), __runInitializers(this, _previousPets_initializers, void 0));
            this.experienceLevel = (__runInitializers(this, _previousPets_extraInitializers), __runInitializers(this, _experienceLevel_initializers, void 0));
            // Lifestyle fields
            this.occupation = (__runInitializers(this, _experienceLevel_extraInitializers), __runInitializers(this, _occupation_initializers, void 0));
            this.workSchedule = (__runInitializers(this, _occupation_extraInitializers), __runInitializers(this, _workSchedule_initializers, void 0));
            this.whyAdopt = (__runInitializers(this, _workSchedule_extraInitializers), __runInitializers(this, _whyAdopt_initializers, void 0));
            // Profile image
            this.profileImage = (__runInitializers(this, _whyAdopt_extraInitializers), __runInitializers(this, _profileImage_initializers, void 0));
            // Profile completion (calculated field)
            this.profileCompleteness = (__runInitializers(this, _profileImage_extraInitializers), __runInitializers(this, _profileCompleteness_initializers, void 0));
            // PawPoints and donations
            this.pawPoints = (__runInitializers(this, _profileCompleteness_extraInitializers), __runInitializers(this, _pawPoints_initializers, void 0));
            this.totalDonated = (__runInitializers(this, _pawPoints_extraInitializers), __runInitializers(this, _totalDonated_initializers, void 0));
            // Email verification
            this.emailVerified = (__runInitializers(this, _totalDonated_extraInitializers), __runInitializers(this, _emailVerified_initializers, void 0));
            this.verificationCode = (__runInitializers(this, _emailVerified_extraInitializers), __runInitializers(this, _verificationCode_initializers, void 0));
            this.verificationCodeExpiry = (__runInitializers(this, _verificationCode_extraInitializers), __runInitializers(this, _verificationCodeExpiry_initializers, void 0));
            // Password reset
            this.resetToken = (__runInitializers(this, _verificationCodeExpiry_extraInitializers), __runInitializers(this, _resetToken_initializers, void 0));
            this.resetTokenExpiry = (__runInitializers(this, _resetToken_extraInitializers), __runInitializers(this, _resetTokenExpiry_initializers, void 0));
            // User role
            this.role = (__runInitializers(this, _resetTokenExpiry_extraInitializers), __runInitializers(this, _role_initializers, void 0));
            // Timestamps
            this.createdAt = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            // Relations (to be defined in other entities)
            this.shelter = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _shelter_initializers, void 0));
            this.donations = (__runInitializers(this, _shelter_extraInitializers), __runInitializers(this, _donations_initializers, void 0));
            this.pawPointTransactions = (__runInitializers(this, _donations_extraInitializers), __runInitializers(this, _pawPointTransactions_initializers, void 0));
            this.adoptionRequests = (__runInitializers(this, _pawPointTransactions_extraInitializers), __runInitializers(this, _adoptionRequests_initializers, void 0));
            __runInitializers(this, _adoptionRequests_extraInitializers);
        }
        // Hooks
        User_1.prototype.hashPassword = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(this.password && !this.password.startsWith('$2b$'))) return [3 /*break*/, 2];
                            _a = this;
                            return [4 /*yield*/, bcrypt.hash(this.password, 10)];
                        case 1:
                            _a.password = _b.sent();
                            _b.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        User_1.prototype.calculateProfileCompletion = function () {
            var _this = this;
            var requiredFields = [
                'name',
                'phone',
                'street',
                'city',
                'state',
                'zip',
                'country',
                'housingType',
                'ownershipStatus',
                'currentPets',
                'experienceLevel',
                'occupation',
                'workSchedule',
                'whyAdopt',
            ];
            // Only calculate for donors
            if (this.role === UserRole.DONOR) {
                var filledFields = requiredFields.filter(function (field) { return _this[field]; });
                this.profileCompleteness = Math.round((filledFields.length / requiredFields.length) * 100);
            }
            else {
                // Shelters have different profile requirements, handled in Shelter entity
                this.profileCompleteness = 0;
            }
        };
        // Helper methods
        User_1.prototype.validatePassword = function (password) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, bcrypt.compare(password, this.password)];
                });
            });
        };
        User_1.prototype.generateVerificationCode = function () {
            this.verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
            this.verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        };
        User_1.prototype.generateResetToken = function () {
            var token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            this.resetToken = token;
            this.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            return token;
        };
        User_1.prototype.isVerificationCodeValid = function (code) {
            return !!(this.verificationCode === code &&
                this.verificationCodeExpiry &&
                this.verificationCodeExpiry > new Date());
        };
        User_1.prototype.isResetTokenValid = function (token) {
            return !!(this.resetToken === token &&
                this.resetTokenExpiry &&
                this.resetTokenExpiry > new Date());
        };
        return User_1;
    }());
    __setFunctionName(_classThis, "User");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _email_decorators = [(0, typeorm_1.Column)({ unique: true }), (0, class_validator_1.IsEmail)()];
        _password_decorators = [(0, typeorm_1.Column)(), (0, class_transformer_1.Exclude)(), (0, class_validator_1.MinLength)(6)];
        _name_decorators = [(0, typeorm_1.Column)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2)];
        _phone_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.Matches)(/^\+?[\d\s-()]+$/, { message: 'Invalid phone number format' })];
        _street_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _city_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _state_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _zip_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _country_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _housingType_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: HousingType, nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(HousingType)];
        _ownershipStatus_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: OwnershipStatus, nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(OwnershipStatus)];
        _hasYard_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: YardStatus, nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(YardStatus)];
        _isFenced_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: FenceStatus, nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(FenceStatus)];
        _currentPets_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _previousPets_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _experienceLevel_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: ExperienceLevel, nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(ExperienceLevel)];
        _occupation_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _workSchedule_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _whyAdopt_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _profileImage_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
        _profileCompleteness_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(100)];
        _pawPoints_decorators = [(0, typeorm_1.Column)({ default: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
        _totalDonated_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
        _emailVerified_decorators = [(0, typeorm_1.Column)({ default: false }), (0, class_validator_1.IsBoolean)()];
        _verificationCode_decorators = [(0, typeorm_1.Column)({ nullable: true, length: 4 }), (0, class_transformer_1.Exclude)()];
        _verificationCodeExpiry_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _resetToken_decorators = [(0, typeorm_1.Column)({ nullable: true }), (0, class_transformer_1.Exclude)()];
        _resetTokenExpiry_decorators = [(0, typeorm_1.Column)({ type: 'timestamp', nullable: true })];
        _role_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: UserRole }), (0, class_validator_1.IsEnum)(UserRole)];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        _shelter_decorators = [(0, typeorm_1.OneToOne)(function () { return shelter_entity_1.Shelter; }, function (shelter) { return shelter.user; })];
        _donations_decorators = [(0, typeorm_1.OneToMany)(function () { return donation_entity_1.Donation; }, function (donation) { return donation.user; })];
        _pawPointTransactions_decorators = [(0, typeorm_1.OneToMany)(function () { return pawpoint_transaction_entity_1.PawPointTransaction; }, function (transaction) { return transaction.user; })];
        _adoptionRequests_decorators = [(0, typeorm_1.OneToMany)(function () { return adoption_request_entity_1.AdoptionRequest; }, function (request) { return request.user; })];
        _hashPassword_decorators = [(0, typeorm_1.BeforeInsert)(), (0, typeorm_1.BeforeUpdate)()];
        _calculateProfileCompletion_decorators = [(0, typeorm_1.BeforeInsert)(), (0, typeorm_1.BeforeUpdate)()];
        __esDecorate(_classThis, null, _hashPassword_decorators, { kind: "method", name: "hashPassword", static: false, private: false, access: { has: function (obj) { return "hashPassword" in obj; }, get: function (obj) { return obj.hashPassword; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _calculateProfileCompletion_decorators, { kind: "method", name: "calculateProfileCompletion", static: false, private: false, access: { has: function (obj) { return "calculateProfileCompletion" in obj; }, get: function (obj) { return obj.calculateProfileCompletion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
        __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: function (obj) { return "password" in obj; }, get: function (obj) { return obj.password; }, set: function (obj, value) { obj.password = value; } }, metadata: _metadata }, _password_initializers, _password_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: function (obj) { return "phone" in obj; }, get: function (obj) { return obj.phone; }, set: function (obj, value) { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
        __esDecorate(null, null, _street_decorators, { kind: "field", name: "street", static: false, private: false, access: { has: function (obj) { return "street" in obj; }, get: function (obj) { return obj.street; }, set: function (obj, value) { obj.street = value; } }, metadata: _metadata }, _street_initializers, _street_extraInitializers);
        __esDecorate(null, null, _city_decorators, { kind: "field", name: "city", static: false, private: false, access: { has: function (obj) { return "city" in obj; }, get: function (obj) { return obj.city; }, set: function (obj, value) { obj.city = value; } }, metadata: _metadata }, _city_initializers, _city_extraInitializers);
        __esDecorate(null, null, _state_decorators, { kind: "field", name: "state", static: false, private: false, access: { has: function (obj) { return "state" in obj; }, get: function (obj) { return obj.state; }, set: function (obj, value) { obj.state = value; } }, metadata: _metadata }, _state_initializers, _state_extraInitializers);
        __esDecorate(null, null, _zip_decorators, { kind: "field", name: "zip", static: false, private: false, access: { has: function (obj) { return "zip" in obj; }, get: function (obj) { return obj.zip; }, set: function (obj, value) { obj.zip = value; } }, metadata: _metadata }, _zip_initializers, _zip_extraInitializers);
        __esDecorate(null, null, _country_decorators, { kind: "field", name: "country", static: false, private: false, access: { has: function (obj) { return "country" in obj; }, get: function (obj) { return obj.country; }, set: function (obj, value) { obj.country = value; } }, metadata: _metadata }, _country_initializers, _country_extraInitializers);
        __esDecorate(null, null, _housingType_decorators, { kind: "field", name: "housingType", static: false, private: false, access: { has: function (obj) { return "housingType" in obj; }, get: function (obj) { return obj.housingType; }, set: function (obj, value) { obj.housingType = value; } }, metadata: _metadata }, _housingType_initializers, _housingType_extraInitializers);
        __esDecorate(null, null, _ownershipStatus_decorators, { kind: "field", name: "ownershipStatus", static: false, private: false, access: { has: function (obj) { return "ownershipStatus" in obj; }, get: function (obj) { return obj.ownershipStatus; }, set: function (obj, value) { obj.ownershipStatus = value; } }, metadata: _metadata }, _ownershipStatus_initializers, _ownershipStatus_extraInitializers);
        __esDecorate(null, null, _hasYard_decorators, { kind: "field", name: "hasYard", static: false, private: false, access: { has: function (obj) { return "hasYard" in obj; }, get: function (obj) { return obj.hasYard; }, set: function (obj, value) { obj.hasYard = value; } }, metadata: _metadata }, _hasYard_initializers, _hasYard_extraInitializers);
        __esDecorate(null, null, _isFenced_decorators, { kind: "field", name: "isFenced", static: false, private: false, access: { has: function (obj) { return "isFenced" in obj; }, get: function (obj) { return obj.isFenced; }, set: function (obj, value) { obj.isFenced = value; } }, metadata: _metadata }, _isFenced_initializers, _isFenced_extraInitializers);
        __esDecorate(null, null, _currentPets_decorators, { kind: "field", name: "currentPets", static: false, private: false, access: { has: function (obj) { return "currentPets" in obj; }, get: function (obj) { return obj.currentPets; }, set: function (obj, value) { obj.currentPets = value; } }, metadata: _metadata }, _currentPets_initializers, _currentPets_extraInitializers);
        __esDecorate(null, null, _previousPets_decorators, { kind: "field", name: "previousPets", static: false, private: false, access: { has: function (obj) { return "previousPets" in obj; }, get: function (obj) { return obj.previousPets; }, set: function (obj, value) { obj.previousPets = value; } }, metadata: _metadata }, _previousPets_initializers, _previousPets_extraInitializers);
        __esDecorate(null, null, _experienceLevel_decorators, { kind: "field", name: "experienceLevel", static: false, private: false, access: { has: function (obj) { return "experienceLevel" in obj; }, get: function (obj) { return obj.experienceLevel; }, set: function (obj, value) { obj.experienceLevel = value; } }, metadata: _metadata }, _experienceLevel_initializers, _experienceLevel_extraInitializers);
        __esDecorate(null, null, _occupation_decorators, { kind: "field", name: "occupation", static: false, private: false, access: { has: function (obj) { return "occupation" in obj; }, get: function (obj) { return obj.occupation; }, set: function (obj, value) { obj.occupation = value; } }, metadata: _metadata }, _occupation_initializers, _occupation_extraInitializers);
        __esDecorate(null, null, _workSchedule_decorators, { kind: "field", name: "workSchedule", static: false, private: false, access: { has: function (obj) { return "workSchedule" in obj; }, get: function (obj) { return obj.workSchedule; }, set: function (obj, value) { obj.workSchedule = value; } }, metadata: _metadata }, _workSchedule_initializers, _workSchedule_extraInitializers);
        __esDecorate(null, null, _whyAdopt_decorators, { kind: "field", name: "whyAdopt", static: false, private: false, access: { has: function (obj) { return "whyAdopt" in obj; }, get: function (obj) { return obj.whyAdopt; }, set: function (obj, value) { obj.whyAdopt = value; } }, metadata: _metadata }, _whyAdopt_initializers, _whyAdopt_extraInitializers);
        __esDecorate(null, null, _profileImage_decorators, { kind: "field", name: "profileImage", static: false, private: false, access: { has: function (obj) { return "profileImage" in obj; }, get: function (obj) { return obj.profileImage; }, set: function (obj, value) { obj.profileImage = value; } }, metadata: _metadata }, _profileImage_initializers, _profileImage_extraInitializers);
        __esDecorate(null, null, _profileCompleteness_decorators, { kind: "field", name: "profileCompleteness", static: false, private: false, access: { has: function (obj) { return "profileCompleteness" in obj; }, get: function (obj) { return obj.profileCompleteness; }, set: function (obj, value) { obj.profileCompleteness = value; } }, metadata: _metadata }, _profileCompleteness_initializers, _profileCompleteness_extraInitializers);
        __esDecorate(null, null, _pawPoints_decorators, { kind: "field", name: "pawPoints", static: false, private: false, access: { has: function (obj) { return "pawPoints" in obj; }, get: function (obj) { return obj.pawPoints; }, set: function (obj, value) { obj.pawPoints = value; } }, metadata: _metadata }, _pawPoints_initializers, _pawPoints_extraInitializers);
        __esDecorate(null, null, _totalDonated_decorators, { kind: "field", name: "totalDonated", static: false, private: false, access: { has: function (obj) { return "totalDonated" in obj; }, get: function (obj) { return obj.totalDonated; }, set: function (obj, value) { obj.totalDonated = value; } }, metadata: _metadata }, _totalDonated_initializers, _totalDonated_extraInitializers);
        __esDecorate(null, null, _emailVerified_decorators, { kind: "field", name: "emailVerified", static: false, private: false, access: { has: function (obj) { return "emailVerified" in obj; }, get: function (obj) { return obj.emailVerified; }, set: function (obj, value) { obj.emailVerified = value; } }, metadata: _metadata }, _emailVerified_initializers, _emailVerified_extraInitializers);
        __esDecorate(null, null, _verificationCode_decorators, { kind: "field", name: "verificationCode", static: false, private: false, access: { has: function (obj) { return "verificationCode" in obj; }, get: function (obj) { return obj.verificationCode; }, set: function (obj, value) { obj.verificationCode = value; } }, metadata: _metadata }, _verificationCode_initializers, _verificationCode_extraInitializers);
        __esDecorate(null, null, _verificationCodeExpiry_decorators, { kind: "field", name: "verificationCodeExpiry", static: false, private: false, access: { has: function (obj) { return "verificationCodeExpiry" in obj; }, get: function (obj) { return obj.verificationCodeExpiry; }, set: function (obj, value) { obj.verificationCodeExpiry = value; } }, metadata: _metadata }, _verificationCodeExpiry_initializers, _verificationCodeExpiry_extraInitializers);
        __esDecorate(null, null, _resetToken_decorators, { kind: "field", name: "resetToken", static: false, private: false, access: { has: function (obj) { return "resetToken" in obj; }, get: function (obj) { return obj.resetToken; }, set: function (obj, value) { obj.resetToken = value; } }, metadata: _metadata }, _resetToken_initializers, _resetToken_extraInitializers);
        __esDecorate(null, null, _resetTokenExpiry_decorators, { kind: "field", name: "resetTokenExpiry", static: false, private: false, access: { has: function (obj) { return "resetTokenExpiry" in obj; }, get: function (obj) { return obj.resetTokenExpiry; }, set: function (obj, value) { obj.resetTokenExpiry = value; } }, metadata: _metadata }, _resetTokenExpiry_initializers, _resetTokenExpiry_extraInitializers);
        __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: function (obj) { return "role" in obj; }, get: function (obj) { return obj.role; }, set: function (obj, value) { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _shelter_decorators, { kind: "field", name: "shelter", static: false, private: false, access: { has: function (obj) { return "shelter" in obj; }, get: function (obj) { return obj.shelter; }, set: function (obj, value) { obj.shelter = value; } }, metadata: _metadata }, _shelter_initializers, _shelter_extraInitializers);
        __esDecorate(null, null, _donations_decorators, { kind: "field", name: "donations", static: false, private: false, access: { has: function (obj) { return "donations" in obj; }, get: function (obj) { return obj.donations; }, set: function (obj, value) { obj.donations = value; } }, metadata: _metadata }, _donations_initializers, _donations_extraInitializers);
        __esDecorate(null, null, _pawPointTransactions_decorators, { kind: "field", name: "pawPointTransactions", static: false, private: false, access: { has: function (obj) { return "pawPointTransactions" in obj; }, get: function (obj) { return obj.pawPointTransactions; }, set: function (obj, value) { obj.pawPointTransactions = value; } }, metadata: _metadata }, _pawPointTransactions_initializers, _pawPointTransactions_extraInitializers);
        __esDecorate(null, null, _adoptionRequests_decorators, { kind: "field", name: "adoptionRequests", static: false, private: false, access: { has: function (obj) { return "adoptionRequests" in obj; }, get: function (obj) { return obj.adoptionRequests; }, set: function (obj, value) { obj.adoptionRequests = value; } }, metadata: _metadata }, _adoptionRequests_initializers, _adoptionRequests_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        User = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return User = _classThis;
}();
exports.User = User;
