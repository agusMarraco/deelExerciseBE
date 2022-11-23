const {isNil, isEmpty} = require("rambda");
const {sequelize} = require("./model");
const {Op} = require("sequelize");

async function getBestClients(req, res) {
    const profileId = req.get('profile_id');
    if (profileId !== '1234admin') {
        res.status(403).send('Not Authorized to the admin api')
        return
    }

    const start = req.query.start
    const end = req.query.end;

    if (isNil(start) || isNil(end)) {
        return 'Start and end must be defined'
    }

    const limit = isNil(req.query.limit) ? 2 : req.query.limit
    const {Job, Contract, Profile} = req.app.get('models')

    const clientProfiles = await Profile.findAll({
        where: {
            type: 'client'
        }
    })

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
        return
    }

    res.json(topClients.map(topClient => {
        return {
            client:
            clientProfiles.find(client => client.dataValues.id == topClient.dataValues.clientId).id
        }
    }))
}

async function getBestProfession(req, res) {
    const profileId = req.get('profile_id');
    if (profileId !== '1234admin') {
        res.status(403).send('Not Authorized to the admin api')
        return
    }

    const start = req.query.start
    const end = req.query.end;

    if (isNil(start) || isNil(end)) {
        return 'Start and end must be defined'
    }

    const {Job, Contract, Profile} = req.app.get('models')

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
        return
    }

    res.json({bestProfession: topEarners[0].profession, amount: topEarners[0].dataValues.priceSum})
}

module.exports = {
    getBestClients,
    getBestProfession
}