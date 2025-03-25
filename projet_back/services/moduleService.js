const { get } = require("../routes/users");
const client = require("./db");

const getAllModules = async () => {
    const modules = await client.query('SELECT * FROM module');
    let formatModules = await Promise.all(modules.rows.map(async (module) => {
        if (module.pair_id === null) {
            return {
                id: module.id,
                hostname: module.hostname,
                type: module.type
            };
        } else {
            const pair_name = await client.query('SELECT * FROM module WHERE id = $1', [module.pair_id]);
            return {
                id: module.id,
                hostname: module.hostname,
                pair_hostname: pair_name.rows[0].hostname,
                type: module.type
            };
        }
    }));

    return formatModules;
};

const pairModules = async (moduleInId, moduleOutId) => {
    const moduleIn = await getModuleById(moduleInId);
    const moduleOut = await getModuleById(moduleOutId);
    
    if (moduleIn.type !== moduleOut.type) {
        await client.query('UPDATE module set pair_id = $2 WHERE id = $1', [moduleInId, moduleOutId]);
        await client.query('UPDATE module set pair_id = $1 WHERE id = $2', [moduleInId, moduleOutId]);
    } else {
        throw new Error('Les deux modules sélectionnés sont des modules de même type et donc ne peuvent pas être associés');
    }
};

const getModuleById = async (id) => {
    const module = await client.query('SELECT * FROM module WHERE id = $1', [id]);
    return module.rows[0];
};

module.exports = {
    getAllModules, pairModules
};