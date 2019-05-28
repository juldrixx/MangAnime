'use strict';
const MongoClient = require('mongodb').MongoClient;

var db_manga_manager = function () {
    var _ = this;
};

db_manga_manager.prototype.getInformation = function (username, title_url) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
            if (err) reject(err);
            let db = client.db('manganime');
            db.collection('manga')
                .findOne({'name': username, 'title_url': title_url},
                    (err, result) => {
                        if (result === null || result === undefined) {
                            reject();
                        }
                        else {
                            resolve({
                                'name': result.name,
                                'title_url': result.title_url,
                                'last_release_viewed': parseFloat(result.last_read),
                                'last_release': parseFloat(result.last_chapter),
                                'release_date': result.release_date,
                                'release_url': result.release_url,
                                'release_language': result.release_language,
                            });
                        }
                    });
        });
    });
};

db_manga_manager.prototype.insert = function (name, title_url, last_chapter, release_date, release_url, release_language, title) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
            if (err) reject(err);
            let db = client.db('manganime');
            let newAnime = {
                'name': name,
                'title_url': title_url,
                'last_read': 0,
                'last_chapter': parseFloat(last_chapter),
                'release_date': release_date,
                'release_url': release_url,
                'release_language': release_language,
            };

            db.collection('manga').insertOne(newAnime, function (err, res) {
                if (err) reject(err);
                console.log('1 document inserted');
                client.close();
                resolve({
                    'title': title,
                    'last_release_viewed': 0,
                    'last_release': parseFloat(last_chapter),
                    'release_date': release_date,
                    'release_url': release_url,
                    'release_language': release_language,
                });
            });
        });
    });
};

db_manga_manager.prototype.update = function (name, title_url, last_read, last_chapter, release_date, release_url, release_language, title) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
            if (err) reject(err);
            let db = client.db('manganime');
            let anime = {
                'name': name,
                'title_url': title_url,
            };

            let anime_updates = {
                $set: {
                    'name': name,
                    'title_url': title_url,
                    'last_read': parseFloat(last_read),
                    'last_chapter': parseFloat(last_chapter),
                    'release_date': release_date,
                    'release_url': release_url,
                    'release_language': release_language,
                },
            };

            db.collection('manga').updateOne(anime, anime_updates, function (err, res) {
                if (err) reject(err);
                console.log('1 document updated');
                client.close();
                resolve({
                    'title': title,
                    'last_release_viewed': parseFloat(last_read),
                    'last_release': parseFloat(last_chapter),
                    'release_date': release_date,
                    'release_url': release_url,
                    'release_language': release_language,
                });
            });
        });
    });
};

db_manga_manager.prototype.updateOne = function (name, title_url, last_read) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
            if (err) reject(err);
            let db = client.db('manganime');
            let anime = {
                'name': name,
                'title_url': title_url,
            };

            let anime_updates = {
                $set: {
                    'name': name,
                    'title_url': title_url,
                    'last_read': parseFloat(last_read),
                },
            };

            db.collection('manga').updateOne(anime, anime_updates, function (err, res) {
                if (err) reject(err);
                console.log('Only 1 document updated');
                client.close();
                resolve();
            });
        });
    });
};


module.exports = db_manga_manager;