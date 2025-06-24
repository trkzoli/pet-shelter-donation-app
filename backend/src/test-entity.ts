import { Shelter } from './shelters/entities/shelter.entity';

const test = new Shelter();
test.shelterName = 'Test'; // <-- Does this line give a TS error?

console.log('Shelter entity test:', test); 