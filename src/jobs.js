const {sequelize} = require("./model");
const {Op} = require("sequelize");

async function payJob(req, res) {
    try {

        const result = await sequelize.transaction(async (t) => {
            const {Job, Contract, Profile} = req.app.get('models')
            const profileId = req.get('profile_id')
            const {job_id} = req.params
            const jobToPay = await Job.findOne({
                include: {
                    model: Contract, where: {
                        [Op.and]: {
                            status: 'in_progress', [Op.or]: {
                                ClientId: profileId,
                            }
                        }
                    }
                }, where: {
                    [Op.and]: {
                        paid: {
                            [Op.not]: true
                        }, id: job_id
                    }

                }
            })


            const client = await Profile.findOne({
                where: {
                    id: profileId
                }
            })

            if (!jobToPay) return 'Job was not found, id does not exist, profile association is wrong or it is already paid'
            if (client.balance <= jobToPay.price) return 'Profile balance is not enough to pay the job'
            const contractorId = jobToPay.Contract.ContractorId
            const contractorProfile = await Profile.findOne({
                where: {id: contractorId}
            })

            await Profile.update({balance: contractorProfile.balance + jobToPay.price}, {
                where: {
                    id: contractorId,
                }
            })
            await Profile.update({balance: client.balance - jobToPay.price}, {
                where: {
                    id: profileId,
                }
            })
            await Job.update({paid: true, paymentDate: sequelize.fn('NOW')}, {
                where: {
                    id: job_id,
                }
            })

            return {jobToPay, client, contractorProfile}
        });

        if (!result) res.json([])
        res.json(result)
        return result

    } catch (error) {
        console.error(error)
        res.status(500).end()
    }
}

async function getUnpaidJobs(req, res) {
    const {Job, Contract} = req.app.get('models')
    const profileId = req.get('profile_id')
    const jobs = await Job.findAll({
        include: {
            model: Contract, where: {
                [Op.and]: {
                    status: 'in_progress', [Op.or]: {
                        ContractorId: profileId, ClientId: profileId,
                    }
                }
            }
        }, where: {
            paid: {
                [Op.not]: true
            }
        }
    })
    if (!jobs) res.json([])
    res.json(jobs)
    return jobs
}

module.exports = {
    payJob,
    getUnpaidJobs
}