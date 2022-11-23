const {Contract} = require("../src/model");
const {getAllContracts, getContractById} = require("../src/contracts");


test('Test Retrieve all contracts not terminated for user', async () => {
    const reqMock = {
        get: jest.fn(() => '1'),
        app: {
            get: (param) => {
                return {Contract}
            }
        }
    };
    const resMock = {
        status: jest.fn(),
        json: (value) => JSON.stringify(value)
    }

    const result = await getAllContracts(reqMock, resMock)
    expect(result.length == 1)
    expect(result[0].status !== 'terminated')
})

test('Test Retrieve Contract for user, only if is matching', async () => {
    const reqMock = {
        get: jest.fn(() => '1'),
        app: {
            get: () => {
                return {Contract}
            }
        },
        params: {
            id: '1'
        }
    };
    const resMock = {
        status: jest.fn(),
        json: (value) => JSON.stringify(value)
    }

    const result = await getContractById(reqMock, resMock)
    expect(result)
    expect(result.ClientId == '1')
    expect(result.status == 'terminated')
})