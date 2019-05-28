'use strict';

// import des modules parser
var parser_jetanime = require('./modules/parser_jetanime.js');
var parser_fanfox = require('./modules/parser_fanfox.js');
var parser_japscan = require('./modules/parser_japscan.js');

// import des modules db7
var db_users_manager = require('./modules/db_users_manager.js');
var db_anime_manager = require('./modules/db_anime_manager.js');
var db_manga_manager = require('./modules/db_manga_manager.js');

// import du module Express
var express = require('express');
var app = express();
/*var HttpProxyAgent = require( 'http-proxy-agent' );
var urlencode = require('urlencode');*/
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

app.get('/get/:type/:username', function (request, response) {
    console.log('############ GET ' + request.params.type + ' ############');

    let promise = new Promise(function (res, rej) {
        try {
            let dbUser = eval('new db_users_manager(\'' + request.params.type + '\')');
            dbUser.getRssUrl(request.params.username).then(function (rss_url) {
                var fct_get_data = function (url) {
                    return new Promise(function (resolve, reject) {
                        let url_splitted = url.split('.');
                        let site = url_splitted[0].includes('www') ? url_splitted[1] : url_splitted[0].split('://')[1];

                        try {
                            let db = eval('new db_' + request.params.type + '_manager()');
                            let parser = eval('new parser_' + site + '(\'' + url + '\')');

                            parser.getInformation().then(function (information) {
                                db.getInformation(request.params.username, information.title_url).then(function (informationDB) {
                                    return informationDB;
                                })
                                .then(function (informationDB) {
                                    if (informationDB.last_release_viewed !== information.release_number) {
                                        db.update(request.params.username, information.title_url, informationDB.last_release_viewed, information.release_number,
                                        information.release_date, information.release_url, information.release_language, information.title).then(function (result) {
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
                                })
                                .catch(function () {
                                    db.insert(request.params.username, information.title_url, information.release_number, information.release_date,
                                    information.release_url, information.release_language, information.title).then(function (result) {
                                        result.not_completed = true;
                                        result.url = information.url;
                                        resolve(result);
                                    });
                                });
                            })
                            .catch(function (error) {
                                reject(error);
                            });
                        }
                        catch (error) {
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
            })
            .catch(function (error) {
                rej(error);
            });
        }
        catch (error) {
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
    db.updateOne(request.params.username, request.params.title, request.params.value).then(function () {
        respond.send();
    });
});

app.post('/add', function (request, response) {
    console.log('############ ADD ' + request.body.type + ' ############');
    let url_splitted = request.body.rss.split('.');
    let site = url_splitted[0].includes('www') ? url_splitted[1] : url_splitted[0].split('://')[1];

    let promise = new Promise(function (res, rej) {
        try {
            let parser = eval('new parser_' + site + '(\'' + request.body.rss + '\')');
            parser.verifyURL().then(function () {
                let db = eval('new db_users_manager(\'' + request.body.type + '\')');
                db.addMedia(request.body.username, request.body.rss).then(function () {
                    res();
                })
                .catch(function (error) {
                    rej(error);
                });
            })
            .catch(function (error) {
                rej(error);
            });
        }
        catch (error) {
            console.log('Site "' + site + '" isn\'t managed');
            rej('Site "' + site + '" isn\'t managed');
        }
    });

    promise.then(function () {
        response.send(true);
    })
    .catch(function (err) {
        console.log(err);
        response.send(false);
    });
});

app.post('/del/:type', function (request, response) {
    console.log('############ DEL ' + request.params.type + ' ############');

    let promise = new Promise(function (res, rej) {
        try {
            let db = eval('new db_users_manager(\'' + request.body.type + '\')');
            db.delMedia(request.body.username, request.body.rss).then(function () {
                res();
            })
            .catch(function (error) {
                rej(error);
            });
        }
        catch (error) {
            rej(error);
        }
    });

    promise.then(function () {
        response.send(true);
    })
    .catch(function (err) {
        console.log(err);
        response.send(false);
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