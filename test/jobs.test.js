const {Contract} = require("../src/model");
const {getAllContracts, getContractById} = require("../src/contracts");


test('Test Get All contracts', async () => {
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
})

test('Get Contract', async () => {
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
    expect(result.status == 'terminated')
})