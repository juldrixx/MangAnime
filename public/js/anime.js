'use strict';

function getCookie(cname) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i += 1) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}


let username = getCookie('username');

let updateAnime = function (username, title, episode) {
    fetch('api/update/anime/' + username + '/' + title + '/' + episode)
        .then(function () {
            location.reload();
        })
        .catch(function (error) {
            console.log(error);
        });
};

let getAnime = function () {
    let saison  = ['Hiver', 'Printemps', 'Été', 'Automne'];
    let month = new Date().getMonth();
    if (month === 12) {
        month = 1;
    }
    else {
        month += 1;
    }

    let container = document.querySelector('#container');
    let div_container_mt = document.createElement('div');
    let h1_title = document.querySelector('#title');
    let h2_season = document.querySelector('#season');
    let div_add_anime = document.createElement('div');
    let div_anime = document.createElement('div');

    div_container_mt.className = 'container mt-100';
    h1_title.innerHTML = 'Mes animes';
    h2_season.innerHTML = saison[Math.floor(month/3)] + ' ' + new Date().getFullYear();;
    div_add_anime.id = 'add_anime';
    div_anime.className = 'row mt-30';
    div_anime.id = 'anime';

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    div_container_mt.appendChild(div_add_anime);
    div_container_mt.appendChild(div_anime);
    container.appendChild(div_container_mt);

    let div_form = document.createElement('div');
    let div_input = document.createElement('div');
    let input_url_anime = document.createElement('input');
    let span_group_button = document.createElement('span');
    let input_btn = document.createElement('input');

    div_form.id = 'rss_input';
    div_input.className = 'input-group col-md-12';
    span_group_button.className = 'input-group-btn';
    input_url_anime.type = 'text';
    input_url_anime.name = 'url_anime';
    input_url_anime.id = 'url_anime';
    input_url_anime.className = 'form-control';
    input_url_anime.placeholder = 'https://www.jetanime.co/rss/...';

    input_btn.type = 'submit';
    input_btn.name = 'submit';
    input_btn.className = 'btn';
    input_btn.value = 'Ajouter';
    input_btn.onclick = function () {
        let rss = document.querySelector('#url_anime').value;

        fetch('/api/add', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'type': 'anime',
                'username': username,
                'rss': rss,
            }),
        })
            .then(function () {
                location.reload();
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    span_group_button.appendChild(input_btn);
    div_form.appendChild(div_input);
    div_input.appendChild(input_url_anime);
    div_input.appendChild(span_group_button);
    div_add_anime.appendChild(div_form);

    fetch('api/get/anime/' + username)
        .then(function (reponse) {
            return reponse.json();
        })
        .catch(function (error) {
            getAnime();
            console.log(error);
        })
        .then(function (animes) {

            let parent = div_add_anime;
            let tableau = document.createElement('table');
            let entete = document.createElement('thead');
            let row_entete = document.createElement('tr');
            let col_state = document.createElement('th');
            let col_title = document.createElement('th');
            let col_last_viewed = document.createElement('th');
            let col_last_episode = document.createElement('th');
            let col_btn = document.createElement('th');

            tableau.className = 'table table-hover table-dark';
            col_state.scope = 'col';
            col_state.innerHTML = '';
            col_title.scope = 'col';
            col_title.innerHTML = 'Anime';
            col_last_viewed.scope = 'col';
            col_last_viewed.innerHTML = 'Dernier épisode vu';
            col_last_episode.scope = 'col';
            col_last_episode.innerHTML = 'Dernier épisode sorti';
            col_btn.scope = 'col';
            col_state.innerHTML = '';

            row_entete.appendChild(col_state);
            row_entete.appendChild(col_title);
            row_entete.appendChild(col_last_viewed);
            row_entete.appendChild(col_last_episode);
            row_entete.appendChild(col_btn);
            entete.appendChild(row_entete);
            tableau.appendChild(entete);

            let body = document.createElement('tbody');
            animes.sort(function (a, b) {
                return (a.not_completed === b.not_completed) ? 0 : a.not_completed ? -1 : 1;
            });
            animes.forEach(element => {
                let parent = body;
                let row = document.createElement('tr');
                let state = document.createElement('th');
                let title = document.createElement('td');
                let last_viewed = document.createElement('td');
                let last_episode = document.createElement('td');
                let btn = document.createElement('td');
                let ul_icon = document.createElement('ul');
                let li_state = document.createElement('li');
                let a_state = document.createElement('a');
                let li_link = document.createElement('li');
                let a_link = document.createElement('a');
                let li_trash = document.createElement('li');
                let a_trash = document.createElement('a');

                state.scope = 'row';
                if (element.not_completed) {
                    state.innerHTML = 'Not completed';
                }
                else {
                    state.innerHTML = '';
                }

                title.innerHTML = element.title;
                last_viewed.innerHTML = element.last_viewed;
                last_viewed.onclick = function () {

                    last_viewed.innerHTML = '';
                    last_viewed.onclick = '';

                    let zone_nombre = document.createElement('input');
                    let zone_nombre_btn = document.createElement('input');

                    zone_nombre.type = 'number';
                    zone_nombre.id = 'new_last_viewed';
                    if (element.last_viewed === 0) {
                        zone_nombre.value = 1;
                    }
                    else {
                        zone_nombre.value = element.last_viewed;
                    }

                    zone_nombre_btn.type = 'submit';
                    zone_nombre_btn.name = 'submit';
                    zone_nombre_btn.className = 'btn_ok';
                    zone_nombre_btn.value = 'OK';
                    zone_nombre_btn.onclick = function () {
                        if (document.querySelector('#new_last_viewed').value <= element.last_episode && document.querySelector('#new_last_viewed').value >= 1) {
                            updateAnime(username, element.url.split('/')[element.url.split('/').length - 2], document.querySelector('#new_last_viewed').value);
                        }
                    };

                    zone_nombre.min = 1;
                    zone_nombre.max = element.last_episode;

                    last_viewed.appendChild(zone_nombre);
                    last_viewed.appendChild(zone_nombre_btn);
                };
                last_episode.innerHTML = element.last_episode;

                ul_icon.className = 'icon_manga_anime';
                if (!element.not_completed) {
                    a_state.className = 'fa fa-check';
                }
                else {
                    a_state.className = 'fa fa-times';
                    a_state.href = '';
                    a_state.addEventListener('click', function () {
                        updateAnime(username, element.url.split('/')[element.url.split('/').length - 2], element.last_episode);
                    });
                }

                a_link.href = element.url;
                a_link.target = '_blank';
                a_link.className = 'fa fa-link';
                a_trash.className = 'fa fa-trash';
                a_trash.href = '';
                a_trash.addEventListener('click', function () {
                    fetch('/api/del/anime', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            'type': 'anime',
                            'username': username,
                            'rss': element.url.replace('/anime/', '/rss/'),
                            'title': element.url.split('/')[element.url.split('/').length - 2],
                        }),
                    })
                        .then(function () {
                            location.reload();
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                });

                li_trash.appendChild(a_trash);
                li_link.appendChild(a_link);
                li_state.appendChild(a_state);
                ul_icon.appendChild(li_state);
                ul_icon.appendChild(li_link);
                ul_icon.appendChild(li_trash);
                btn.appendChild(ul_icon);
                row.appendChild(state);
                row.appendChild(title);
                row.appendChild(last_viewed);
                row.appendChild(last_episode);
                row.appendChild(btn);
                parent.appendChild(row);
            });

            tableau.appendChild(body);
            parent.appendChild(tableau);
        })
        .catch(function (error) {
            console.log(error);
        });
};

getAnime();