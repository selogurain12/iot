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
            // Requête pour récupérer le nom du module associé
            const pair_name_result = await client.query('SELECT * FROM module WHERE id = $1', [module.pair_id]);

            // Vérifie si le module associé existe
            if (pair_name_result.rows.length === 0) {
                return {
                    id: module.id,
                    hostname: module.hostname,
                    type: module.type,
                    error: "Module associé non trouvé"
                };
            }

            const pair_name = pair_name_result.rows[0];
            let pair_id = "";

            // Requête pour obtenir le pair_id
            if (module.type === 'IN') {
                const pair_id_result = await client.query('SELECT id FROM module_pairing WHERE module_in_id = $1 and module_out_id = $2', [module.id, module.pair_id]);
                // Vérifie si la requête pour le pair_id a retourné des résultats
                if (pair_id_result.rows.length > 0) {
                    pair_id = pair_id_result.rows[0].id;
                } else {
                    pair_id = "Aucun appairage trouvé";
                }
            } else {
                const pair_id_result = await client.query('SELECT id FROM module_pairing WHERE module_in_id = $2 and module_out_id = $1', [module.id, module.pair_id]);
                // Vérifie si la requête pour le pair_id a retourné des résultats
                if (pair_id_result.rows.length > 0) {
                    pair_id = pair_id_result.rows[0].id;
                } else {
                    pair_id = "Aucun appairage trouvé";
                }
            }

            return {
                id: module.id,
                hostname: module.hostname,
                pair_hostname: pair_name.hostname,
                type: module.type,
                pair_id: pair_id
            };
        }
    }));

    return formatModules;
};

const getModulePairing = async () => {
    // Requête pour obtenir les appairages et les informations des modules associés
    const modulePairingQuery = `
        SELECT 
            mp.id AS pairing_id,
            m_in.hostname AS module_in_hostname,
            m_out.hostname AS module_out_hostname
        FROM 
            module_pairing mp
        JOIN 
            module m_in ON mp.module_in_id = m_in.id
        JOIN 
            module m_out ON mp.module_out_id = m_out.id;
    `;
    const result = await client.query(modulePairingQuery);

    // Retourner les résultats avec les hostnames des modules
    return result.rows;
};


// isPairing = false => unpair
const pairOrUnpairModules = async (moduleInId, moduleOutId) => {
    isPairing = true;
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