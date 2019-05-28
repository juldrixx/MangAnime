'use strict';
var fetch = require('node-fetch');
var xpath = require('xpath');
var DOMParser = require('xmldom').DOMParser;

var parser_jetanime = function (rss_url) {
    var _ = this;
    _.rss_url = rss_url;
};

parser_jetanime.prototype.getInformation = function () {
    var _ = this;
    return new Promise(function (resolve, reject) {
        fetch(_.rss_url)
        .then(function (reponse) {
            return reponse.text();
        })
        .then(function (reponse) {
            try {
                let doc = new DOMParser().parseFromString(reponse);

                let date = xpath.select('//item[1]/pubDate', doc)[0].firstChild.data;
                let day_date = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                let month_date = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                let title = xpath.select('//item[1]/title', doc)[0].firstChild.data;
                let release_url = xpath.select('//item[1]/link', doc)[0].firstChild.data;
                let release_date = {
                    'day_name': day_date.indexOf(date.split(',')[0]),
                    'day': parseInt(date.split(' ')[1]),
                    'month': month_date.indexOf(date.split(' ')[2]),
                    'year': parseInt(date.split(' ')[3]),
                };
                let release_number = parseFloat(title.split(' ')[title.split(' ').length - 2]);
                let release_language = title.split(' ')[title.split(' ').length - 1];

                resolve({
                    'title': title.replace(release_number, '').replace(release_language, '').replace('Episode', '').trim(),
                    'release_url': release_url,
                    'release_date': release_date,
                    'release_number': release_number,
                    'release_language': release_language,
                    'title_url': _.rss_url.split('/')[_.rss_url.split('/').length - 2],
                    'url': _.rss_url.replace('rss', 'anime'),
                });
            }
            catch (error) {
                reject('RSS URL INCORRECT !');
            }
        })
        .catch(function (error) {
            reject(error);
        });
    });
};

parser_jetanime.prototype.verifyURL = function () {
    var _ = this;
    return new Promise(function (resolve, reject) {
        fetch(_.rss_url)
        .then(function (reponse) {
            return reponse.text();
        })
        .then(function () {
            _.getInformation().then(function (){
                resolve();
            })
            .catch(function (error) {
                reject(error);
            });
        })
        .catch(function (error) {
            reject(error);
        });
    });
};

module.exports = parser_jetanime;