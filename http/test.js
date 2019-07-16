const { request } = require('./request');
const fs = require('fs');

~async function(){
    // const { data } = await request('https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT'); // test https get request
    // const { data } = await request('http://10.10.15.16:8091/#/login'); // test http get requet 
    // const { data } = await request('http://localhost:3000/#/login'); //#号只会被游览器当成anchor处理，不会被发送给服务端
    // const { data } = await request('http://localhost:3000',{ data:{ name:'xwt', age:18 } })
    // const { data } = await request('http://localhost:3000/hello', { method:'POST', data:{ name:'xwt', age:18 }, headers:{ 'cache-control':'no-cache' } })
    const png = fs.readFileSync('./imgs/卖家人脸.jpg');
    const { data } = await request('http://localhost:3000/savePic', { data:png, dataType:'raw', method:'POST' });
    console.log(data.toString());
}().catch(e => {
    console.error(e);
})