const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const {getBestClients, getBestProfession} = require("./admin");
const {makeDeposit} = require("./balance");
const {payJob, getUnpaidJobs} = require("./jobs");
const {getContractById, getAllContracts} = require("./contracts");
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)


/**
 * Fixed contracts API, now filtering with the validated profile ID and retrieving the contract only if the
 * contractor or the client is in it.
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
    return await getContractById(req, res);
})

app.get('/contracts', getProfile, async (req, res) => {
    return await getAllContracts(req, res);
})

app.get('/jobs/unpaid', getProfile, async (req, res) => {
    await getUnpaidJobs(req, res);
})

app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    await payJob(req, res);
})

app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
    await makeDeposit(req, res);
})

app.get('/admin/best-profession', async (req, res) => {
    return await getBestProfession(req, res);
})

app.get('/admin/best-clients', async (req, res) => {
    return await getBestClients(req, res);
})

module.exports = app;
