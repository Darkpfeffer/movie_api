const http= require('http'),
    url= require('url'),
    fs= require('fs');

http.createServer((request, response) => {
    let addr= request.url
        q= url.parse(addr, true),
        filePath= '';

    fs.appendFile('log.txt', 'URL: '+ addr+ '\nTimestamp: '+ new Date()+ '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });

    if (q.pathname.includes('documentation')) {
        filePath= 'documentation.html';
    } else {
        filePath= 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }
    })
}).listen(8080);
console.log('Server is running on Port 8080.');