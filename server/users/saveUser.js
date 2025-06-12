import executeQuery from '../sql/sqlUtils.js';


const createUser = async (username, hashedPassword) => {
    return new Promise((resolve, reject) => {
        executeQuery('INSERT INTO casademiranda.users (username, password_hash) VALUES (?, ?)', [username, hashedPassword]).then((result, error) => {
            if (error) reject(error);
            resolve(result)
        })
    })
}

export {createUser};