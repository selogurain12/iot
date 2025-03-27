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
            let pair_id = "";
            if (module.type === 'IN') {
                pair_id = await client.query('SELECT id FROM module_pairing WHERE module_in_id = $1 and module_out_id = $2', [module.id, module.pair_id]);
            } else {
                pair_id = await client.query('SELECT id FROM module_pairing WHERE module_in_id = $2 and module_out_id = $1', [module.id, module.pair_id]);
            }

            console.log("pair_id : " + pair_id.rows[0].id);
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

const getModulePairing = async () => {
    return await client.query('SELECT id FROM module_pairing');
}

// isPairing = false => unpair
const pairOrUnpairModules = async (moduleInId, moduleOutId, isPairing) => {
    if (!isPairing) {
        await client.query('UPDATE module set pair_id = null WHERE id = $1', [moduleInId]);
        await client.query('UPDATE module set pair_id = null WHERE id = $2', [moduleOutId]);
        await client.query('DELETE module_pairing WHERE module_in_id = $1 AND module_out_id = $2', [moduleInId, moduleOutId]);
        return null;
    } else {
        const moduleIn = await getModuleById(moduleInId);
        const moduleOut = await getModuleById(moduleOutId);
        if (moduleIn.type !== moduleOut.type) {
            await client.query('UPDATE module set pair_id = $2 WHERE id = $1', [moduleInId, moduleOutId]);
            await client.query('UPDATE module set pair_id = $1 WHERE id = $2', [moduleInId, moduleOutId]);
            await client.query('INSERT INTO module_pairing (module_in_id, module_out_id) VALUES($2, $1)', [moduleOutId, moduleInId]);
            return await client.query('SELECT id FROM module_pairing WHERE module_in_id = $1 AND module_out_id = $2', [moduleInId, moduleOutId]);
        } else {
            throw new Error('Les deux modules sélectionnés sont des modules de même type et donc ne peuvent pas être associés');
        }
        return null;
    }
};

const getModuleById = async (id) => {
    const module = await client.query('SELECT * FROM module WHERE id = $1', [id]);
    return module.rows[0];
};

module.exports = {
    getAllModules,
    pairOrUnpairModules,
    getModulePairing
};