'use strict';
const MongoClient = require('mongodb').MongoClient;

var db_users_manager = function (type) {
    var _ = this;
    _.type = type;
};

db_users_manager.prototype.getRssUrl = function (username) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
            if (err) reject(err);
            let db = client.db('manganime');
            db.collection('users')
                .findOne({'type': _.type, 'name': username},
                    (err, result) => {
                        if (result === null) {
                            reject('User "' + username + '" doesn\'t exist !');
                        }
                        else {
                            resolve(result.rss_url);
                        }
                    });
        });
    });
};

db_users_manager.prototype.addMedia = function (username, media) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        _.getRssUrl(username).then(function (rss_url) {
            if (!rss_url.includes(media)) {
                rss_url.push(media);
                _.update(username, rss_url).then(function () {
                    resolve();
                })
                .catch(function (error) {
                    reject(error);
                });
            }
            else {
                reject('URL RSS already exists !');
            }
        })
        .catch(function (error) {
            console.log(error);
            _.insert(username, media).then(function () {
                resolve();
            })
            .catch(function (error) {
                reject(error);
            });
        });
    });
};

db_users_manager.prototype.insert = function (username, media) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
            if (err) reject(err);
            let db = client.db('manganime');
            let newMedia = {
                'type': _.type,
                'name': username,
                'rss_url': [media],
            };

            db.collection('users').insertOne(newMedia, function (err, res) {
                if (err) reject(err);
                console.log('1 media inserted');
                client.close();
                resolve();
            });
        });
    });
};

db_users_manager.prototype.update = function (username, medias) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        let update_query = {
            'type': _.type,
            'name': username,
        };

        let new_values = {
            $set: {
                'type': _.type,
                'name': username,
                'rss_url': medias,
            },
        };

        MongoClient.connect('mongodb://juldrixx:juldrix834679@ds255754.mlab.com:55754/manganime', {useNewUrlParser: true}, (err, client) => {
            if (err) reject(err);

            let db = client.db('manganime');
            db.collection('users').updateOne(update_query, new_values, function (err, res) {
                if (err) reject(err);
                console.log('1 user updated');
                client.close();
                resolve();
            });
        });
    });
};

db_users_manager.prototype.delMedia = function (username, media) {
    var _ = this;

    return new Promise(function (resolve, reject) {
        _.getRssUrl(username).then(function (rss_url) {
            if (rss_url.includes(media)) {
                rss_url.splice(rss_url.indexOf(media), 1);

                _.update(username, rss_url).then(function () {
                    resolve();
                })
                .catch(function (error) {
                    reject(error);
                });
            }
            else {
                reject('URL RSS already exists !');
            }
        })
        .catch(function (error) {
            reject(error);
        });
    });
}


module.exports = db_users_manager;