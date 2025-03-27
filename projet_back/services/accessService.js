const client = require("./db");

// Verify access using an RFID card and a PIN code
const verifyAccess = async (cardId, pinCode) => {
    // 1. Check if the card exists and if it is active
    const cardQuery = `
        SELECT r.id, r.card_id, r.is_active, r.user_id
        FROM rfid_cards r
        WHERE r.card_id = $1`;

    const cardResult = await client.query(cardQuery, [cardId]);

    if (cardResult.rows.length === 0) {
        return {
            success: false,
            message: "RFID card not found"
        };
    }

    const rfidCard = cardResult.rows[0];

    if (!rfidCard.is_active) {
        // Log the failed access attempt
        await logAccessAttempt(cardId, rfidCard.user_id, false, "RFID card is disabled");
        return {
            success: false,
            message: "RFID card disabled"
        };
    }

    if (!rfidCard.user_id) {
        // Log the failed access attempt
        await logAccessAttempt(cardId, null, false, "No user associated with this card");
        return {
            success: false,
            message: "RFID card not associated with a user"
        };
    }

    // 2. Check if the user has an active access code matching the provided PIN code
    const codeQuery = `
        SELECT a.id, a.code, a.is_active, u.id as user_id, u.name, u.firstname
        FROM access_codes a
        JOIN users u ON a.user_id = u.id
        WHERE a.user_id = $1 AND a.code = $2`;

    const codeResult = await client.query(codeQuery, [rfidCard.user_id, pinCode]);

    if (codeResult.rows.length === 0) {
        // Log the failed access attempt
        await logAccessAttempt(cardId, rfidCard.user_id, false, "Invalid PIN code");
        return {
            success: false,
            message: "Invalid PIN code"
        };
    }

    const accessCode = codeResult.rows[0];

    if (!accessCode.is_active) {
        // Log the failed access attempt
        await logAccessAttempt(cardId, rfidCard.user_id, false, "Access code disabled");
        return {
            success: false,
            message: "Access code disabled"
        };
    }

    // 3. If everything is valid, access authorized
    // Log the successful access attempt
    await logAccessAttempt(cardId, rfidCard.user_id, true, "Access authorized");

    return {
        success: true,
        message: `Welcome, ${accessCode.firstname} ${accessCode.name}`,
        userData: {
            user_id: accessCode.user_id,
            name: accessCode.name,
            firstname: accessCode.firstname
        }
    };
};

// Function to log access attempts
const logAccessAttempt = async (identifier, userId, success, message) => {
    const query = `
        INSERT INTO access_logs 
        (access_type, identifier, user_id, success, created_at) 
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`;

    // Use 'rfid' as access type (according to constraint)
    await client.query(query, ['rfid', identifier, userId, success]);
};

const updateCodePinUser = async (userId, createCode) => {
    try {
        const existingCodeResult = await client.query(`SELECT id FROM access_codes WHERE user_id = $1`, [userId]);
        if (existingCodeResult.rows.length === 0) {
            throw new Error("The provided user does not have a PIN code");
        } else {
            await client.query( `UPDATE access_codes SET code = $2 WHERE user_id = $1`, [userId, createCode]);
        }

        return;
    } catch (error) {
        throw new Error(error.message);
    }
};

const createUserPin = async (userId, createCode) => {
    try {
        const existingCodeResult = await client.query(`SELECT id FROM access_codes WHERE user_id = $1`, [userId]);

        if (existingCodeResult.rows.length > 0) {
            throw new Error("The provided PIN code already exists for this user.");
        } else {
            await client.query( `INSERT INTO access_codes (user_id, code, is_active) VALUES ($1, $2, true)`, [userId, createCode]);
        }
        return;
    } catch (error) {
        throw new Error(error.message);
    }
};

const disabledUserPin = async (user_id) => {
    console.log(user_id)
    try {
        await client.query( `UPDATE access_codes SET is_active = false WHERE user_id = $1`, [user_id]);
        return;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getAllAccess = async () => {
    try {
        const result = await client.query('SELECT * FROM access_codes');
        return result.rows;
    } catch (error) {
        throw new Error(error);
    }
};

const getAccessByIdUserBd = async (id) => {
    const user = await client.query('SELECT * FROM access_codes WHERE user_id = $1::uuid', [id]);
    return user.rows[0];
};

module.exports = {
    verifyAccess,
    logAccessAttempt,
    updateCodePinUser,
    createUserPin,
    disabledUserPin,
    getAllAccess,
    getAccessByIdUserBd
};