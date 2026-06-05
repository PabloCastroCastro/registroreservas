import executeQuery from '../sql/sqlUtils.js';


const createUser = async (username, hashedPassword, role = 'admin') => {
    return executeQuery(
        'INSERT INTO casademiranda.users (username, password_hash, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
    );
}

export {createUser};
