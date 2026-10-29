const repo=require('../repository/UserRepository');
const ApiError=require('../utils/ApiError');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const env=require('../config/env');
class AuthServices {
 async register(data){
  const email=data.email.trim().toLowerCase();
  if(await repo.findByEmail(email))throw ApiError.Conflict('Email đã tồn tại');
  const passwordHash=await bcrypt.hash(data.password,10);
  try {const u=await repo.create({name:data.name.trim(),email,passwordHash,role:'User'});return {id:u.id,name:u.name,email:u.email,role:u.role};}
  catch(err){if(err.number===2601||err.number===2627)throw ApiError.Conflict('Email đã tồn tại');throw err;}
 }
 async login({email,password}){
  const user=await repo.findByEmail(String(email).trim().toLowerCase());
  if(!user||!user.status||!(await bcrypt.compare(String(password),user.passwordHash)))throw ApiError.Unauthorized('Email hoặc mật khẩu không đúng');
  return {accessToken:jwt.sign({userId:user.id,role:user.role},env.jwtSecret,{algorithm:'HS256',expiresIn:env.jwtExpiresIn}),tokenType:'Bearer',expiresIn:env.jwtExpiresIn,user:{id:user.id,name:user.name,email:user.email,role:user.role}};
 }
}
module.exports=new AuthServices();
