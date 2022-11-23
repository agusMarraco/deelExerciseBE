const {sequelize} = require("./model");
const {isNil} = require("rambda");
const {Op} = require("sequelize");

/**
 * Using transaction to make deposit to avoid inconsistent information
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function makeDeposit(req, res) {
    try {

        const profileId = req.get('profile_id');
        const {userId} = req.params;
        if (profileId != userId) {
            res.status(400).send('Cant deposit to another user')
            return
        }
        const result = await sequelize.transaction(async (t) => {
            const {Job, Contract, Profile} = req.app.get('models')
            const depositAmount = req.body.amount;
            if (isNil(depositAmount)) return 'Deposit amount is not valid'
            const jobsNotPaidForClientAmountSum = await Job.sum('price', {
                include: {
                    model: Contract, where: {
                        ClientId: profileId,
                    }
                }, where: {
                    [Op.and]: {
                        paid: {
                            [Op.not]: true
                        }
                    }
                }
            })

            const maxDepositAmountAvailable = jobsNotPaidForClientAmountSum * 0.25;
            if (maxDepositAmountAvailable < depositAmount) return 'cant deposit, amount exceeds 25% of the sum of not paid jobs'

            const clientProfile = await Profile.findOne({where: {id: userId}})
            await Profile.update({balance: clientProfile.balance + depositAmount}, {
                where: {
                    id: clientProfile.id,
                }
            })

            return 'Amount deposited'
        });

        if (!result) res.json([])
        res.json(result)

    } catch (error) {
        console.error(error)
        res.status(500).end()
    }
}

module.exports = {
    makeDeposit
}