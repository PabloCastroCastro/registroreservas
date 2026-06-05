import executeQuery from '../sql/sqlUtils.js';


const getUserByUsername = async (username) => {
    return new Promise((resolve, reject) => {
        executeQuery('SELECT * FROM casademiranda.users WHERE username = ?', [username]).then((result, error) => {
            if (error) reject(error);
            resolve(returnUser(result))
        })
    })
}

const returnUser = (result) => {
    if (result.length === 0) {
        console.log('Usuario no encontrado');
        return false;
    }

    return {
        id: result[0].id,
        username: result[0].username,
        password: result[0].password_hash,
        role: result[0].role ?? 'admin',
    };
}

export {getUserByUsername};
