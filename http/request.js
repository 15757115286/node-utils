const http = require("http");
const https = require("https");


function isPrimitiveObj(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
// option是在原始的node http上option封装了data 与 dataType 2个内容。
function request(url, option) {
  let _resolve = null,
    _reject = null;
  const promise = new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  });
  try {
    const httpObj = /^\s*https:\/\//.test(url) ? https : http;
    option = Object.assign(
      {
        method: "GET",
        dataType: "JSON"
      },
      option
    );
    let { method, data, dataType } = option;
    method = method.toUpperCase();
    if (method === "GET" && isPrimitiveObj(data)) {
      const dataList = [];
      for (let key in data) {
        dataList.push(`${key} = ${data[key]}`);
      }
      url = `${url}?${dataList.join("&")}`;
      data = null;
    }
    const req = httpObj.request(url, option, res => {
      let data = Buffer.alloc(0);
      res.on("error", _reject);
      res.on("data", d => {
        data = Buffer.concat([data, d]);
      });
      res.on("end", () => {
        _resolve({ data, response:res });
      });
    });
    req.on("error", _reject);
    if (data !== null) {
      dataType = dataType.toUpperCase();
      if (method === "POST") {
        if(dataType === "JSON") req.end(JSON.stringify(data));
        else if(dataType === "RAW") req.end(data);
        else req.end();
      } else {
        req.end(data);
      }
    } else {
      req.end();
    }
  } catch (e) {
      _reject(e);
  } finally {
    return promise;
  }
}

exports.request = request;