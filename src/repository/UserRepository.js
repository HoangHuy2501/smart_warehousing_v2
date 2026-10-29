const {getPool,sql}=require('../config/connectData');
const env=require('../config/env');
const store=require('../mock/store');
class UserRepository {
  async getAll(){
    if(env.mock) return store.users.map(({passwordHash,...u})=>({...u}));
    const pool=await getPool();const result=await pool.request().query('SELECT id,name,email,role,status,created_at FROM dbo.Users ORDER BY id');return result.recordset;
  }
  async findById(id){
    if(env.mock) return store.users.find(u=>u.id===id)||null;
    const pool=await getPool();const r=await pool.request().input('id',sql.Int,id).query('SELECT id,name,email,password_hash AS passwordHash,role,status,created_at FROM dbo.Users WHERE id=@id');return r.recordset[0]||null;
  }
  async findByEmail(email){
    if(env.mock) return store.users.find(u=>u.email.toLowerCase()===email.toLowerCase())||null;
    const pool=await getPool();const r=await pool.request().input('email',sql.NVarChar(255),email).query('SELECT id,name,email,password_hash AS passwordHash,role,status,created_at FROM dbo.Users WHERE email=@email');return r.recordset[0]||null;
  }
  async create({name,email,passwordHash,role='User'}){
    if(env.mock){const u={id:store.allocateId(),name,email,passwordHash,role,status:true};store.users.push(u);return u;}
    const pool=await getPool();const r=await pool.request().input('name',sql.NVarChar(100),name).input('email',sql.NVarChar(255),email).input('hash',sql.NVarChar(255),passwordHash).input('role',sql.NVarChar(20),role)
      .query('INSERT INTO dbo.Users(name,email,password_hash,role) OUTPUT INSERTED.id,INSERTED.name,INSERTED.email,INSERTED.role,INSERTED.status,INSERTED.created_at VALUES(@name,@email,@hash,@role)');return r.recordset[0];
  }
  async updateName(id,name){
    if(env.mock){const u=store.users.find(u=>u.id===id);if(!u)return null;u.name=name;return u;}
    const pool=await getPool();const r=await pool.request().input('id',sql.Int,id).input('name',sql.NVarChar(100),name)
      .query('UPDATE dbo.Users SET name=@name OUTPUT INSERTED.id,INSERTED.name,INSERTED.email,INSERTED.role,INSERTED.status WHERE id=@id');return r.recordset[0]||null;
  }
  async delete(id){
    if(env.mock){const i=store.users.findIndex(u=>u.id===id);if(i<0)return false;store.users.splice(i,1);return true;}
    const pool=await getPool();const r=await pool.request().input('id',sql.Int,id).query('DELETE FROM dbo.Users WHERE id=@id');return r.rowsAffected[0]>0;
  }
}
module.exports=new UserRepository();
