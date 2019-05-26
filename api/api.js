'use strict';

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
    let db;

    MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
        if (err) return console.log(err);
        db = client.db('manganime');
        db.collection('users')
            .findOne({'type': request.params.type, 'name': request.params.username},
                (err, result) => {
                    if (result !== null) {
                        let rss_url = result.rss_url;

                        if (rss_url.length === 0) {
                            client.close();
                            response.send([]);
                        }

                        let datas = [];
                        let itemsProcessed = 0;
                        rss_url.forEach(element => {
                            fetch(element)
                                .then(function (reponse) {
                                    return reponse.text();
                                })
                                .then(function (reponse) {
                                    if (request.params.type === 'manga') {
                                        let doc = new DOMParser().parseFromString(reponse);
                                        let nodes = xpath.select('//item/title', doc);
                                        let titles_chapters = [];

                                        nodes.forEach(function (element) {
                                            titles_chapters.push(element.firstChild.data);
                                        });

                                        let title = xpath.select('//channel/title', doc)[0].firstChild.data;
                                        let title_chapter = titles_chapters[0];
                                        let title_chapter_array = title_chapter.split('Ch.');
                                        let chapter = parseInt(title_chapter_array[1]);
                                        let new_chapter = false;
                                        let title_url = element.split('/')[element.split('/').length - 1].split('.xml')[0];

                                        db.collection(request.params.type)
                                            .findOne({'name': request.params.username, 'title_url': title_url},
                                                (err, result) => {
                                                    if (result === null) {
                                                        let myquery = {
                                                            'name': request.params.username,
                                                            'title_url': title_url,
                                                            'last_read': 0,
                                                            'last_chapter': chapter,
                                                        };

                                                        db.collection(request.params.type).insertOne(myquery, function (err, res) {
                                                            if (err) throw err;
                                                            console.log('1 document inserted');
                                                        });
                                                        result = myquery;
                                                    }

                                                    if (result.last_chapter !== chapter) {
                                                        let myquery = {
                                                            'name': request.params.username,
                                                            'title_url': title_url,
                                                        };

                                                        let new_values = {
                                                            $set: {
                                                                'name': request.params.username,
                                                                'title_url': title_url,
                                                                'last_read': parseFloat(result.last_read),
                                                                'last_chapter': parseFloat(chapter),
                                                            },
                                                        };
                                                        db.collection(request.params.type).updateOne(myquery, new_values, function (err, res) {
                                                            if (err) throw err;
                                                            console.log('1 document updated');
                                                        });

                                                        result = {
                                                            'name': request.params.username,
                                                            'title_url': title_url,
                                                            'last_read': parseFloat(result.last_read),
                                                            'last_chapter': parseFloat(chapter),
                                                        };
                                                    }

                                                    new_chapter = !(result.last_read === result.last_chapter);
                                                    let link = xpath.select('//item/link', doc)[0].firstChild.data;
                                                    let data = {
                                                        'title': title,
                                                        'last_read': parseFloat(result.last_read),
                                                        'last_chapter': parseFloat(chapter),
                                                        'url': link.split('/manga/')[0] + '/manga/' + link.split('/manga/')[1].split('/')[0] + '/',
                                                        'not_completed': new_chapter,
                                                    };

                                                    datas.push(data);
                                                    itemsProcessed += 1;
                                                    if (itemsProcessed === rss_url.length) {
                                                        response.set({'Content-Type': 'text/json', 'charset': 'utf-8'});
                                                        client.close();
                                                        response.send(JSON.stringify(datas));
                                                    }

                                                });
                                    }
                                    else if (request.params.type === 'anime') {
                                        let doc = new DOMParser().parseFromString(reponse);
                                        let nodes = xpath.select('//item/title', doc);
                                        let titles = [];

                                        nodes.forEach(function (element) {
                                            titles.push(element.firstChild.data);
                                        });

                                        let title = titles[0];
                                        let title_array = title.split(' ');
                                        let episode = parseInt(title_array[title_array.length - 2]);
                                        let new_episode = false;
                                        let title_url = element.split('/')[element.split('/').length - 2];

                                        db.collection(request.params.type)
                                            .findOne({'name': request.params.username, 'title_url': title_url},
                                                (err, result) => {
                                                    if (result === null) {
                                                        let myquery = {
                                                            'name': request.params.username,
                                                            'title_url': title_url,
                                                            'last_viewed': 0,
                                                            'last_episode': parseFloat(episode),
                                                        };

                                                        db.collection(request.params.type).insertOne(myquery, function (err, res) {
                                                            if (err) throw err;
                                                            console.log('1 document inserted');
                                                            client.close();
                                                        });
                                                        result = myquery;
                                                    }

                                                    if (result.last_episode !== episode) {
                                                        let myquery = {
                                                            'name': request.params.username,
                                                            'title_url': title_url,
                                                        };

                                                        let new_values = {
                                                            $set: {
                                                                'name': request.params.username,
                                                                'title_url': title_url,
                                                                'last_viewed': parseFloat(result.last_viewed),
                                                                'last_episode': parseFloat(episode),
                                                            },
                                                        };
                                                        db.collection(request.params.type).updateOne(myquery, new_values, function (err, res) {
                                                            if (err) throw err;
                                                            console.log('1 document updated');
                                                        });

                                                        result = {
                                                            'name': request.params.username,
                                                            'title_url': title_url,
                                                            'last_viewed': parseFloat(result.last_viewed),
                                                            'last_episode': parseFloat(episode),
                                                        };
                                                    }

                                                    new_episode = !(result.last_viewed === result.last_episode);
                                                    let data = {
                                                        'title': title.replace(episode, '').replace('VOSTFR', '').replace('Episode', ''),
                                                        'last_viewed': parseFloat(result.last_viewed),
                                                        'last_episode': parseFloat(episode),
                                                        'url': element.replace('rss', 'anime'),
                                                        'not_completed': new_episode,
                                                    };

                                                    datas.push(data);
                                                    itemsProcessed += 1;
                                                    if (itemsProcessed === rss_url.length) {
                                                        response.set({'Content-Type': 'text/json', 'charset': 'utf-8'});
                                                        client.close();
                                                        response.send(JSON.stringify(datas));
                                                    }
                                                });
                                    }
                                    else {
                                        client.close();
                                        response.send([]);
                                    }
                                })
                                .catch(function (error) {
                                    console.log(error);
                                });
                        });

                    }
                    else {
                        client.close();
                        response.send([]);
                    }
                });
    });
});

app.get('/update/:type/:username/:title/:value', function (request, respond) {
    console.log('############ Update ' + request.params.type + ' ############');
    let db;

    MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
        if (err) return console.log(err);
        db = client.db('manganime');
        db.collection(request.params.type)
            .findOne({'name': request.params.username, 'title_url': request.params.title},
                (err, result) => {
                    if (request.params.type === 'manga') {
                        if (result === null) {
                            let myquery = {
                                'name': request.params.username,
                                'title_url': request.params.title,
                                'last_read': parseFloat(request.params.value),
                                'last_chapter': 'NA',
                            };

                            db.collection(request.params.type).insertOne(myquery, function (err, res) {
                                if (err) throw err;
                                console.log('1 document inserted');
                                client.close();
                            });
                        }
                        else {
                            let update_query = {
                                'name': request.params.username,
                                'title_url': request.params.title,
                            };

                            let new_values = {
                                $set: {
                                    'name': request.params.username,
                                    'title_url': request.params.title,
                                    'last_read': parseFloat(request.params.value),
                                    'last_chapter': parseFloat(result.last_chapter),
                                },
                            };

                            db.collection(request.params.type).updateOne(update_query, new_values, function (err, res) {
                                if (err) throw err;
                                console.log('1 document updated');
                                client.close();
                                respond.send();
                            });
                        }

                    }
                    else if (result === null) {
                        let myquery = {
                            'name': request.params.username,
                            'title_url': request.params.title,
                            'last_viewed': parseFloat(request.params.value),
                            'last_episode': 'NA',
                        };

                        db.collection(request.params.type).insertOne(myquery, function (err, res) {
                            if (err) throw err;
                            console.log('1 document inserted');
                            client.close();
                        });
                    }
                    else {
                        let update_query = {
                            'name': request.params.username,
                            'title_url': request.params.title,
                        };

                        let new_values = {
                            $set: {
                                'name': request.params.username,
                                'title_url': request.params.title,
                                'last_viewed': parseFloat(request.params.value),
                                'last_episode': parseFloat(result.last_episode),
                            },
                        };

                        db.collection(request.params.type).updateOne(update_query, new_values, function (err, res) {
                            if (err) throw err;
                            console.log('1 document updated');
                            client.close();
                            respond.send();
                        });
                    }
                });
    });
});

app.post('/add', function (request, response) {
    console.log('############ ADD ' + request.body.type + ' ############');
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
    });
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