const {Op} = require("sequelize");

async function getAllContracts(req, res) {
    const {Contract} = req.app.get('models')
    const profileId = req.get('profile_id')
    const contract = await Contract.findAll({
        where: {
            [Op.and]: {
                [Op.not]: {
                    status: 'terminated'
                }, [Op.or]: {
                    ContractorId: profileId, ClientId: profileId
                }
            }
        }
    })
    if (!contract) return res.status(404).end()
    res.json(contract)
    return contract
}
async function getContractById(req, res) {
    const {Contract} = req.app.get('models')
    const profileId = req.get('profile_id')
    const {id} = req.params
    const contract = await Contract.findOne({
        where: {
            [Op.and]: {
                id, [Op.or]: {
                    ContractorId: profileId, ClientId: profileId
                }
            }
        }
    })
    if (!contract) return res.status(404).end()
    res.json(contract)
    return contract
}

module.exports = {
    getContractById,
    getAllContracts
}