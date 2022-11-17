/**
 * MySQL Conifg 모듈 정의
 * @type {{host: string, port: number, database: string, user: string, password: string, insecureAuth: boolean, multipleStatements: boolean}}
 */
const mysql = {
    host: 'asciiworld.cafe24.com',
    port: 3306,
    database : 'ndsysdb',
    user: 'root',
    password: 'root9123',
    insecureAuth: true,
    multipleStatements: true
};

module.exports = mysql;