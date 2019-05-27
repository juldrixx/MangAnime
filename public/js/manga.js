'use strict';

function getCookie(cname) {
    let name = cname + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
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

let updateManga = function (username, title, chapter) {
    fetch('api/update/manga/' + username + '/' + title + '/' + chapter)
        .then(function () {
            location.reload();
        })
        .catch(function (error) {
            console.log(error);
        });
};

let getManga = function () {
    let container = document.querySelector('#container');
    let div_container_mt = document.createElement('div');
    let h1_title = document.querySelector('#title');
    let h2_season = document.querySelector('#season');
    let div_add_manga = document.createElement('div');
    let div_manga = document.createElement('div');

    div_container_mt.className = 'container mt-40';
    h1_title.innerHTML = 'Mes mangas';
    h2_season.innerHTML = '';
    div_add_manga.id = 'add_manga';
    div_manga.className = 'row mt-30';
    div_manga.id = 'manga';

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    div_container_mt.appendChild(div_add_manga);
    div_container_mt.appendChild(div_manga);
    container.appendChild(div_container_mt);

    let div_form = document.createElement('div');
    let div_input = document.createElement('div');
    let input_url_manga = document.createElement('input');
    let span_group_button = document.createElement('span');
    let input_btn = document.createElement('input');

    div_form.id = 'rss_input';
    div_input.className = 'input-group col-md-12';
    input_url_manga.type = 'text';
    input_url_manga.name = 'url_manga';
    input_url_manga.id = 'url_manga';
    input_url_manga.className = 'form-control';
    input_url_manga.placeholder = 'http://fanfox.net/rss/...';

    input_btn.type = 'submit';
    input_btn.name = 'submit';
    input_btn.className = 'btn';
    input_btn.value = 'Ajouter';
    input_btn.onclick = function () {
        let rss = document.querySelector('#url_manga').value;

        fetch('/api/add', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'type': 'manga',
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
    div_input.appendChild(input_url_manga);
    div_input.appendChild(span_group_button);
    div_add_manga.appendChild(div_form);

    fetch('api/get/manga/' + username)
        .then(function (reponse) {
            return reponse.json();
        })
        .catch(function (error) {
            getManga();
            console.log(error);
        })
        .then(function (mangas) {
            let parent = div_add_manga;
            let tableau = document.createElement('table');
            let entete = document.createElement('thead');
            let row_entete = document.createElement('tr');
            let col_state = document.createElement('th');
            let col_title = document.createElement('th');
            let col_last_read = document.createElement('th');
            let col_last_chapter = document.createElement('th');
            let col_btn = document.createElement('th');

            tableau.className = 'table table-hover table-dark';
            col_state.scope = 'col';
            col_state.innerHTML = '';
            col_title.scope = 'col';
            col_title.innerHTML = 'Manga';
            col_last_read.scope = 'col';
            col_last_read.innerHTML = 'Dernier chapitre lu';
            col_last_chapter.scope = 'col';
            col_last_chapter.innerHTML = 'Dernier chapitre sorti';
            col_btn.scope = 'col';
            col_state.innerHTML = '';

            row_entete.appendChild(col_state);
            row_entete.appendChild(col_title);
            row_entete.appendChild(col_last_read);
            row_entete.appendChild(col_last_chapter);
            row_entete.appendChild(col_btn);
            entete.appendChild(row_entete);
            tableau.appendChild(entete);

            let body = document.createElement('tbody');
            mangas.sort(function (a, b) {
                return (a.not_completed === b.not_completed) ? 0 : a.not_completed ? -1 : 1;
            });
            mangas.forEach(element => {
                let parent = body;
                let row = document.createElement('tr');
                let state = document.createElement('th');
                let title = document.createElement('td');
                let last_read = document.createElement('td');
                let last_chapter = document.createElement('td');
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
                last_read.innerHTML = element.last_release_viewed;
                last_read.onclick = function () {

                    last_read.innerHTML = '';
                    last_read.onclick = '';

                    let zone_nombre = document.createElement('input');
                    let zone_nombre_btn = document.createElement('input');
                    
                    zone_nombre.type = 'number';
                    zone_nombre.id = 'new_last_read';
                    if (element.last_read === 0) {
                        zone_nombre.value = 1;
                    }
                    else {
                        zone_nombre.value = element.last_release_viewed;
                    }

                    zone_nombre_btn.type = 'submit';
                    zone_nombre_btn.name = 'submit';
                    zone_nombre_btn.className = 'btn_ok';
                    zone_nombre_btn.value = 'OK';
                    zone_nombre_btn.onclick = function () {
                        console.log(parseFloat(document.querySelector('#new_last_read').value), element.last_release, parseFloat(document.querySelector('#new_last_read').value) <= element.last_release, parseFloat(document.querySelector('#new_last_read').value) >= 1)
                        if (parseFloat(document.querySelector('#new_last_read').value) <= element.last_release && parseFloat(document.querySelector('#new_last_read').value) >= 1) {
                            updateManga(username, element.url.split('/')[element.url.split('/').length - 2], parseFloat(document.querySelector('#new_last_read').value));
                        }
                    };

                    zone_nombre.min = 1;
                    zone_nombre.max = element.last_release;
                    zone_nombre.step = 0.1;

                    last_read.appendChild(zone_nombre);
                    last_read.appendChild(zone_nombre_btn);
                };
                last_chapter.innerHTML = element.last_release;

                ul_icon.className = 'icon_manga_anime';
                if (!element.not_completed) {
                    a_state.className = 'fa fa-check';
                }
                else {
                    a_state.className = 'fa fa-times';
                    a_state.href = '';
                    a_state.addEventListener('click', function () {
                        updateManga(username, element.url.split('/')[element.url.split('/').length - 2], element.last_release);
                    });
                }

                a_link.href = element.url;
                a_link.target = '_blank';
                a_link.className = 'fa fa-link';
                a_trash.className = 'fa fa-trash';
                a_trash.href = '';
                a_trash.addEventListener('click', function () {
                    fetch('/api/del/manga', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            'type': 'manga',
                            'username': username,
                            'rss': (element.url.replace('/manga/', '/rss/')).slice(0, -1) + '.xml',
                            'title': element.url.split('/')[element.url.split('/').length - 2],
                        }),
                    })
                        .then(function () {
                            location.reload();
                        })
                        .catch(function (error) {
                            getManga();
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
                row.appendChild(last_read);
                row.appendChild(last_chapter);
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

getManga();