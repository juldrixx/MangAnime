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