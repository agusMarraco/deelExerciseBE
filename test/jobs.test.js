const {Contract, Job} = require("../src/model");
const {getUnpaidJobs} = require("../src/jobs");


test('Test Get all unpaid jobs for active contracts for user', async () => {
    const reqMock = {
        get: jest.fn(() => '2'),
        app: {
            get: (param) => {
                return {Contract, Job}
            }
        }
    };
    const resMock = {
        status: jest.fn(),
        json: (value) => JSON.stringify(value)
    }

    const result = await getUnpaidJobs(reqMock, resMock)
    expect(result.length == 2)
    expect(result.filter(job => job.dataValues.paid == null).length == 2)
})
