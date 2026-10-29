const bcrypt=require('bcryptjs');
const seed=require('./seed');
// Chỉ dùng khi USE_MOCK=true; dữ liệu mất khi restart server.
const users=seed.users.map(({passwordPlain,...u})=>({...u,passwordHash:bcrypt.hashSync(passwordPlain,10)}));
let nextId=3;
module.exports={users,allocateId:()=>nextId++};
