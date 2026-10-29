// Không cần DB thật; USE_MOCK và JWT_SECRET set trước khi require app.
process.env.USE_MOCK='true';process.env.JWT_SECRET='test-secret-for-local-integration-123456789';
const test=require('node:test');const assert=require('node:assert/strict');
const app=require('../src/app');
let server,base;
test.before(async()=>{server=app.listen(0);await new Promise(resolve=>server.once('listening',resolve));base=`http://127.0.0.1:${server.address().port}`;});
test.after(async()=>{await new Promise(resolve=>server.close(resolve));});
const request=(route,method='GET',body,token)=>fetch(base+route,{method,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
test('flow: register → login → GET /users/:id → update',async()=>{
 const email='flow-'+Date.now()+'@example.com';
 let r=await request('/api/auth/register','POST',{name:'Flow Test',email,password:'Password123!'});assert.equal(r.status,201);let u=(await r.json()).data;
 r=await request('/api/auth/login','POST',{email,password:'Password123!'});assert.equal(r.status,200);const token=(await r.json()).data.accessToken;
 r=await request('/api/users/'+u.id,'GET',null,token);assert.equal((await r.json()).data.name,'Flow Test');
 r=await request('/api/users/'+u.id,'PUT',{name:'Đã cập nhật'},token);assert.equal((await r.json()).data.name,'Đã cập nhật');
 r=await request('/api/users','GET',null,token);assert.equal(r.status,403);
 r=await request('/does-not-exist');assert.equal(r.status,404);
});
