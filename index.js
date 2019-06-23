const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const http = require('http');
const querystring = require('querystring');
const { concat } = require('./utils');

let router = {
    '/getMp4'(req, res, data, mPath){
        const readStream = fs.createReadStream(path.resolve(__dirname, './source/sock.mp4'));
        readStream.pipe(res);
    },
    '/static/*'(req, res, data, mPath){
        const subPath = mPath.substring(8);
            const readStream = fs.createReadStream(path.resolve(__dirname, './source', subPath));
            readStream.on('error',(e)=>{
                requestError(res, mPath);
            })
            readStream.pipe(res);
    }
}

const server = http.createServer(async (req, res)=>{
    // cross domain
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    let { url, method } = req;
    method = method.toLowerCase();
    let data = null;
    const urlList = url.split('?');
    const params = { req, res, path:urlList[0] };
    if(method == 'get'){
        data = querystring.parse(urlList[1] || '');
        next(params, data);
    }else if(method == 'post'){
        data = Buffer.alloc(0);
        req.on('data',(d) => {
            data = concat(data, d);
        });
        req.on('end',() => {
            next(params, data);
        })
    }
});
server.on('error',(e)=>{
    console.log('server error', e);
});
server.on('close',()=>{
    console.log('server closed');
})
server.listen(8080);

function next({ req, res, path }, data){
    /* console.log(Buffer.isBuffer(data) ? data.toString('utf8') : data);
    res.end('success:' + path); */
    let handler = null;
    const staticReg = /^\/static\//;
    if(staticReg.test(path)){
        handler = router['/static/*'];
    }else{
        handler = router[path];
    }
    if(handler == undefined){
        requestError(res, path);
    }else{
        handler(req, res, data, path);
    }
}

function requestError(res, path){
    res.end('http request 404!\n' + path);
}


