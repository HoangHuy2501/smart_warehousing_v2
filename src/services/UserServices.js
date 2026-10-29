const repo=require('../repository/UserRepository');
const ApiError=require('../utils/ApiError');
const publicUser=({passwordHash,...user})=>user;
class UserServices {
 async getAll(){return (await repo.getAll()).map(publicUser);}
 async getById(id){const user=await repo.findById(id);if(!user)throw ApiError.NotFound('Không tìm thấy user');return publicUser(user);}
 async updateName(id,name){const u=await repo.updateName(id,name.trim());if(!u)throw ApiError.NotFound('Không tìm thấy user');return publicUser(u);}
 async delete(id){if(!await repo.delete(id))throw ApiError.NotFound('Không tìm thấy user');}
}
module.exports=new UserServices();
