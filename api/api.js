'use strict';

// import des modules parser
var parser_jetanime = require('./modules/parser_jetanime.js');
var parser_fanfox = require('./modules/parser_fanfox.js');

// import des modules db
var db_anime_manager = require('./modules/db_anime_manager.js');
var db_manga_manager = require('./modules/db_manga_manager.js');

// import du module Express
var express = require('express');
var app = express();
/*var HttpProxyAgent = require( 'http-proxy-agent' );
var urlencode = require('urlencode');*/
var fetch = require('node-fetch');
var xpath = require('xpath');
var DOMParser = require('xmldom').DOMParser;
var bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

app.get('/get/:type/:username', function (request, response) {
    console.log('############ GET ' + request.params.type + ' ############');

    var promise = new Promise(function (res, rej) {
        try {
            let db = eval('new db_' + request.params.type + '_manager()');

            db.getRssUrl(request.params.username).then(function (rss_url) {
                var fct_get_data = function (url) {
                    return new Promise(function (resolve, reject) {
                        let url_splitted = url.split('.');
                        let site = url_splitted[0].includes('www') ? url_splitted[1] : url_splitted[0].split('://')[1];

                        try {
                            let parser = eval('new parser_' + site + '(\'' + url + '\')');
                                
                            parser.getInformation().then(function (information) {
                                db.getInformation(request.params.username, information.title_url).then(function (informationDB) {
                                    return informationDB;
                                })
                                .catch(function () {
                                    db.insert(request.params.username, information.title_url, information.release_number, information.release_date,
                                    information.release_url,information.release_language, information.title).then(function (result) {
                                        result.not_completed = true;
                                        result.url = information.url;
                                        resolve(result);
                                    });
                                })
                                .then(function (informationDB) {
                                    if (informationDB.last_release_viewed !== information.release_number) {
                                        db.update(request.params.username, information.title_url, informationDB.last_release_viewed, information.release_number,
                                        information.release_date, information.release_url,information.release_language, information.title).then(function (result) {
                                            result.not_completed = true;
                                            result.url = information.url;
                                            resolve(result);
                                        });
                                    }
                                    else {
                                        information.not_completed = false;
                                        resolve({
                                                'title': information.title,
                                                'last_release_viewed': parseFloat(informationDB.last_release_viewed),
                                                'last_release': parseFloat(information.release_number),
                                                'release_date': information.release_date,
                                                'release_url': information.release_url,
                                                'release_language': information.release_language,
                                                'url': information.url,
                                                'not_completed': false,
                                        });
                                    }
                                });
                            });
                        } catch (error) {
                            reject(error);
                        }
                    });
                };

                Promise.all(rss_url.map(fct_get_data)).then(function (result) {
                    res(result);
                })
                .catch(function (err) {
                    rej(err);
                });
            });
        } catch (error) {
            rej(error);
        }
    });
    
    promise.then(function (result) {
        response.set({'Content-Type': 'text/json', 'charset': 'utf-8'});
        response.send(JSON.stringify(result));
    })
    .catch(function (err) {
        console.log(err);
        response.send([]);
    });
});

app.get('/update/:type/:username/:title/:value', function (request, respond) {
    console.log('############ Update ' + request.params.type + ' ############');
    let db = eval('new db_' + request.params.type + '_manager()');
    db.updateOne(request.params.username, request.params.title, request.params.value).then(function (result) {
            respond.send();
        });
});

app.post('/add', function (request, response) {
    /*console.log('############ ADD ' + request.body.type + ' ############');
    let db = eval('new db_' + request.params.type + '_manager()');
    db.insertOne(request.params.username, information.title_url, information.release_number, information.release_date,
        information.release_url,information.release_language, information.title).then(function (result) {
            result.not_completed = true;
            result.url = information.url;
            resolve(result);
        });*/
    /*
    let db;

    MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
        if (err) return console.log(err);
        db = client.db('manganime');
        db.collection('users')
            .findOne({'type': request.body.type, 'name': request.body.username},
                (err, result) => {
                    if (result !== null) {
                        let rss_url = result.rss_url;
                        if (!rss_url.includes(request.body.rss)) {
                            rss_url.push(request.body.rss);
                            let update_query = {
                                'type': request.body.type,
                                'name': request.body.username,
                            };

                            let new_values = {
                                $set: {
                                    'type': result.type,
                                    'name': result.name,
                                    'rss_url': rss_url,
                                },
                            };

                            db.collection('users').updateOne(update_query, new_values, function (err, res) {
                                if (err) throw err;
                                console.log('1 document updated');
                                client.close();
                                response.send();
                            });
                        }
                    }
                    else {
                        let myquery = {
                            'type': request.body.type,
                            'name': request.body.username,
                            'rss_url': [request.body.rss],
                        };
                        db.collection('users').insertOne(myquery, function (err, res) {
                            if (err) throw err;
                            console.log('1 document inserted');
                            client.close();
                            response.send();
                        });
                    }
                });
    });*/
});

app.post('/del/:type', function (request, respond) {
    console.log('############ DEL ' + request.params.type + ' ############');
    let db;

    MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
        if (err) return console.log(err);
        db = client.db('manganime');
        db.collection('users')
            .findOne({'type': request.params.type, 'name': request.body.username},
                (err, result) => {
                    if (result !== null) {
                        let rss_url = result.rss_url;
                        if (rss_url.includes(request.body.rss)) {
                            let index = rss_url.indexOf(request.body.rss);

                            if (index > -1) {
                                rss_url.splice(index, 1);
                            }

                            let update_query = {
                                'type': request.body.type,
                                'name': request.body.username,
                            };

                            let new_values = {
                                $set: {
                                    'type': result.type,
                                    'name': result.name,
                                    'rss_url': rss_url,
                                },
                            };

                            db.collection('users').updateOne(update_query, new_values, function (err, res) {
                                if (err) throw err;
                                console.log('1 document updated');
                                client.close();
                                respond.send();
                            });
                        }
                    }
                    else {
                        client.close();
                        respond.send();
                    }
                });
    });
});


/*fetch('https://www.novelupdates.com/series/that-person-later-on/')
    .then(function (reponse) {
        return reponse.text();
    })
    .then(function (reponse) {
        var doc = new DOMParser().parseFromString(reponse, 'text/html');
        var nodes = xpath.select("//*[@id='myTable']", doc);
        console.log(nodes)
    })
    .catch(function (error) {
        console.log(error);
    });*/
// export de notre application vers le serveur principal
module.exports = app;