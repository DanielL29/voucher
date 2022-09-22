import { faker } from '@faker-js/faker'

function createVoucher() {
    return {
        id: faker.datatype.number({ min: 1, max: 100 }),
        code: faker.random.alphaNumeric(16),
        discount: faker.datatype.number({ min: 1, max: 100 }),
        used: false,
    }
}

export default {
    createVoucher
}