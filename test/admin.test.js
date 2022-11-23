const {Contract, Job, Profile} = require("../src/model");
const {getBestProfession, getBestClients} = require("../src/admin");


test('Test get best paid profession', async () => {
    const reqMock = {
        get: jest.fn(() => '1234admin'),
        app: {
            get: () => {
                return {Contract, Job, Profile}
            }
        },
        query: {
            start: '2020-01-01',
            end: '2022-12-12'
        }
    };
    const resMock = {
        status: jest.fn(),
        json: (value) => JSON.stringify(value)
    }

    const result = await getBestProfession(reqMock, resMock)
    expect(result)
    expect(result.bestProfession == 'Programmer')
})

test('Test get best client', async () => {
    const reqMock = {
        get: jest.fn(() => '1234admin'),
        app: {
            get: () => {
                return {Contract, Job, Profile}
            }
        },
        query: {
            start: '2020-01-01',
            end: '2022-12-12'
        }
    };
    const resMock = {
        status: jest.fn(),
        json: (value) => JSON.stringify(value)
    }

    const result = await getBestClients(reqMock, resMock)
    expect(result)
    expect(result[0].fullName == 'Kethcum Ash')
    expect(result[1].fullName == 'Potter Harry')
})