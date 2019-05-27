'use strict';
const MongoClient = require('mongodb').MongoClient;

var db_anime_manager = function () {
    var _ = this;
    

};


db_anime_manager.prototype.getRssUrl = function (username) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
            if (err) reject(console.log(err));
            let db = client.db('manganime');
            db.collection('users')
                .findOne({'type': 'anime', 'name': username},
                    (err, result) => {
                        if (result === null) {
                            reject();
                        }
                        else {
                            resolve(result.rss_url);
                        }
                });
        });
    });
};

db_anime_manager.prototype.getInformation = function (username, title_url) {
    var _ = this;
   
    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
        if (err) reject(console.log(err));
        let db = client.db('manganime');
        db.collection('anime')
            .findOne({'name': username, 'title_url': title_url},
                (err, result) => {
                    if (result === null) {
                        reject();
                    }
                    else {
                        resolve({
                            'name': result.name,
                            'title_url': result.title_url,
                            'last_release_viewed': parseFloat(result.last_viewed),
                            'last_release': parseFloat(result.last_episode),
                            'release_date': result.release_date,
                            'release_url': result.release_url,
                            'release_language': result.release_language,
                        });
                    }
                });
        });
    });
};

db_anime_manager.prototype.insert = function (name, title_url, last_episode, release_date, release_url, release_language, title) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
            if (err) reject(console.log(err));
            let db = client.db('manganime');
            let newAnime = {
                'name': name,
                'title_url': title_url,
                'last_viewed': 0,
                'last_episode': parseFloat(last_episode),
                'release_date': release_date,
                'release_url': release_url,
                'release_language': release_language,
            };
        
            db.collection('anime').insertOne(newAnime, function (err, res) {
                if (err) reject(err);
                console.log('1 document inserted');
                client.close();
            });
            resolve({
                'title': title,
                'last_release_viewed': 0,
                'last_release': parseFloat(last_episode),
                'release_date': release_date,
                'release_url': release_url,
                'release_language': release_language,
            });
        });
    });
};

db_anime_manager.prototype.update = function (name, title_url, last_viewed, last_episode, release_date, release_url, release_language, title) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
            if (err) reject(console.log(err));
            let db = client.db('manganime');
            let anime = {
                'name': name,
                'title_url': title_url,
            };

            let anime_updates = {
                $set: {
                    'name': name,
                    'title_url': title_url,
                    'last_viewed': parseFloat(last_viewed),
                    'last_episode': parseFloat(last_episode),
                    'release_date': release_date,
                    'release_url': release_url,
                    'release_language': release_language,
                }
            }

            db.collection('anime').updateOne(anime, anime_updates, function (err, res) {
                if (err) reject(err);
                console.log('1 document updated');
                client.close();
            });

            resolve({
                'title': title,
                'last_release_viewed': parseFloat(last_viewed),
                'last_release': parseFloat(last_episode),
                'release_date': release_date,
                'release_url': release_url,
                'release_language': release_language,
            });
        });
    });
};

db_anime_manager.prototype.updateOne = function (name, title_url, last_viewed) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
            if (err) reject(console.log(err));
            let db = client.db('manganime');
            let anime = {
                'name': name,
                'title_url': title_url,
            };

            let anime_updates = {
                $set: {
                    'name': name,
                    'title_url': title_url,
                    'last_viewed': parseFloat(last_viewed),
                }
            }

            db.collection('anime').updateOne(anime, anime_updates, function (err, res) {
                if (err) reject(err);
                console.log('Only 1 document updated');
                client.close();
            });

            resolve();
        });
    });
};

module.exports = db_anime_manager;