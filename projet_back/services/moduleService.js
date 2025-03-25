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

module.exports = {
    getAllModules
};