const {isNil, isEmpty} = require("rambda");
const {sequelize} = require("./model");
const {Op} = require("sequelize");
const moment = require('moment')

async function getBestClients(req, res) {
    const profileId = req.get('profile_id');
    // mock verification to represent some kind of auth for the admin routes, can be done with router filters
    if (profileId !== '1234admin') {
        res.status(403).send('Not Authorized to the admin api')
        return
    }

    const start = req.query.start
    const end = req.query.end;

    const validateDateResult = validateDateRange(start, end)
    if (!validateDateResult.valid) {
        res.status(400).send(validateDateResult.message);
        return
    }

    //default limit 2 or the specified one
    const limit = isNil(req.query.limit) ? 2 : req.query.limit
    const {Job, Contract, Profile} = req.app.get('models')

    const clientProfiles = await Profile.findAll({
        where: {
            type: 'client'
        }
    })

    // I think it can be done tidier with raw sql, but I wanted to use sequelize
    const topClients = await Contract.findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('price')), 'priceSum'],
            ['clientId', 'clientId']
        ],
        limit: limit,
        subQuery: false,
        group: [
            'clientId'
        ],
        order: [[Job, 'price', 'DESC']],
        include: [
            {
                model: Job,
                attributes: ['price'],
                where: {
                    [Op.and]: {
                        paid: true,
                        paymentDate: {
                            [Op.between]: [start, end]
                        },


                    }

                },
            }
        ],
        where: {
            clientId: {
                [Op.in]: [clientProfiles.map(cp => cp.dataValues.id)]
            }
        },

    })
    if (isNil(topClients) || isEmpty(topClients)) {
        res.status(200).send('No data available')
        return []
    }

    const topClientsToReturn = topClients.map(topClient => {
            const client = clientProfiles.find(client => client.dataValues.id == topClient.dataValues.clientId)
            return {
                id: client.id,
                fullName: client.lastName + ' ' + client.firstName,
                paid: topClient.dataValues.priceSum
            }
        }
    )
    res.json(topClientsToReturn)
    return topClientsToReturn;
}

/**
 * Common method to validate date range
 * @param start
 * @param end
 * @returns {{valid: boolean, message: string}}
 */
function validateDateRange(start, end) {
    const status = {
        valid: true,
        message: ''
    }
    if (isNil(start) || isNil(end)) {
        status.message = 'Start and end must be defined'
        status.valid = false
        return status
    }
    const momentStart = moment(start, 'YYYY-MM-DD');
    const momentEnd = moment(end, 'YYYY-MM-DD');
    const isValidDateRange = momentStart.isValid() && momentEnd.isValid() && momentStart.isBefore(momentEnd)

    if (!isValidDateRange) {
        status.message = 'Date range not valid'
        status.valid = false
        return status
    }
    return status;

}

async function getBestProfession(req, res) {
    const profileId = req.get('profile_id');
    if (profileId !== '1234admin') {
        res.status(403).send('Not Authorized to the admin api')
        return
    }

    const start = req.query.start
    const end = req.query.end;

    const validateDateResult = validateDateRange(start, end)
    if (!validateDateResult.valid) {
        res.status(400).send(validateDateResult.message);
        return
    }

    const {Job, Contract, Profile} = req.app.get('models')

    // I think it can be done tidier with raw sql, but I wanted to use sequelize
    const topEarners = await Profile.findAll({
        attributes: [
            'profession',
            [sequelize.fn('sum', sequelize.col('price')), 'priceSum'],

        ],
        group: [
            'profession',
        ],
        order: [['priceSum', 'DESC']],
        include: [
            {
                model: Contract,
                as: 'Contractor',
                include: {
                    model: Job, where: {

                        [Op.and]: {
                            paid: true,
                            paymentDate: {
                                [Op.between]: [start, end]
                            },


                        }
                    }
                }
            },
        ], where: {}
    })
    if (isNil(topEarners) || isEmpty(topEarners)) {
        res.status(200).send('No data available')
        return []
    }

    const result = {bestProfession: topEarners[0].profession, amount: topEarners[0].dataValues.priceSum}
    res.json(result)
    return result
}

module.exports = {
    getBestClients,
    getBestProfession
}