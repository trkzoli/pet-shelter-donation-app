"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shelter_entity_1 = require("./shelters/entities/shelter.entity");
var test = new shelter_entity_1.Shelter();
test.shelterName = 'Test'; // <-- Does this line give a TS error?
console.log('Shelter entity test:', test);
