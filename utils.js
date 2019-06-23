const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// 需要转换的函数
let methods = {
    access: fs,
    unlink: fs,
    readdir:fs,
    mkdir:fs,
    rmdir:fs
}

// 将对应的方法转化为promisify类型的，方便用于异步函数
for(let method in methods){
    const _module = methods[method];
    methods[method] = promisify(_module[method]);
}

// 声明转化好后的函数
const { access, unlink, readdir, rmdir, mkdir } = methods;

// 如果是文件，则直接删除。如果是文件夹，则递归删除
async function remove(mPath){
    let stat = await lstat(mPath);
    // 路径不存在
    if(stat === null) return;
    if(stat.isFile()){ // 删除的对象使文件
        unlink(mPath).catch(processError);
    }else if(stat.isDirectory()){ // 删除的对象使目录
        const list = await readdir(mPath);
        await Promise.all(list.map(p=>remove(path.join(mPath,p))));
        await rmdir(mPath);
    }
}

// 如果是文件夹，则递归拷贝。如果是文件，则直接拷贝
async function copy(from, to, clear = true){
    let stat = await lstat(from);
    // 不存在复制对象
    if(stat === null) return;
    // 在拷贝之前，如果目标已经存在则删除
    clear && await remove(to);
    if(stat.isFile()){
        copyFileOrDir(true, from, to);
    }else if(stat.isDirectory()){
        const list = await readdir(from);
        await copyFileOrDir(false, from ,to);
        list.forEach(p=>{
            copy(path.join(from, p), path.join(to, p), false);
        })
    }
}

// 复制单个文件或者文件夹
function copyFileOrDir(isFile=true, from, to){
    return new Promise((resolve,reject)=>{
        if(isFile){
            const readStream = fs.createReadStream(from);
            const writeStream = fs.createWriteStream(to);
            readStream.on('error',reject);
            writeStream.on('error',reject);
            writeStream.on('finish',resolve);
            readStream.pipe(writeStream);
        }else{
            resolve(mkdir(to));
        }
    });
}

// 判断文件是否存在函数
async function isExist(path){
    try{
        await access(path);
        return true;
    }catch(e){
        return false;
    }
}

async function lstat(...args){
    const ls = promisify(fs.lstat);
    try{
        return await ls(...args);
    }catch(e){
        return null;
    }
}

// 错误几种处理函数
function processError(e){
    console.log(e);
}

// 连接buffer
function concat(...args){
    let length = 0;
    let bufferList = args.reduce((pre,current) => {
        if(Buffer.isBuffer(current)){
            pre.push(current);
            length += current.length;
        }
        return pre;
    },[]);
    return Buffer.concat(bufferList, length);
}

exports.copy = copy;
exports.remove = remove;
exports.isExist = isExist;
exports.concat = concat;