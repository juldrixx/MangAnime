'use strict';

function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = 'expires=' + d.toGMTString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

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

function deleteCookie() {
    let user = getCookie('username');
    let expires = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = 'username=' + user + ';' + expires + ';path=/';
}

function checkCookie() {
    let user = getCookie('username');
    if (user === '') {
        loadLogin();
    }
    else {
        loadHome();
    }
}

let loadLogin = function () {
    let container = document.querySelector('#container');
    let div_container_mt_40 = document.createElement('div');
    let div_title = document.createElement('div');
    let h1_title = document.createElement('h1');
    let h2_title = document.createElement('h2');
    let div_form = document.createElement('div');
    let div_input = document.createElement('div');
    let input_username = document.createElement('input');
    let span_group_button = document.createElement('span');
    let input_btn = document.createElement('input');


    div_container_mt_40.className = 'container mt-40';
    div_title.className = 'w-100 text-white';
    div_title.id = 'titre';
    h2_title.innerHTML = "Veuillez indiquer votre Nom d'utilisateur";
    h1_title.innerHTML = 'Bon retour parmi nous !';

    div_form.id = 'username_input';
    div_input.className = 'input-group col-md-12';
    input_username.type = 'text';
    input_username.name = 'username';
    input_username.id = 'username';
    input_username.className = 'form-control';
    input_username.placeholder = 'Nom d\'utilisateur';

    input_btn.type = 'submit';
    input_btn.name = 'submit';
    input_btn.className = 'btn';
    input_btn.value = 'Valider';
    input_btn.onclick = function () {
        let div_username = document.querySelector('#username');
        let user = div_username.value;
        if (user !== '' && user !== null) {
            setCookie('username', user, 365);
            loadHome();
        }
    };

    span_group_button.appendChild(input_btn);
    div_form.appendChild(div_input);
    div_input.appendChild(input_username);
    div_input.appendChild(span_group_button);
    div_container_mt_40.appendChild(div_form);

    div_title.appendChild(h1_title);
    div_title.appendChild(h2_title);
    container.appendChild(div_title);
    container.appendChild(div_container_mt_40);
};

let loadHome = function () {
    let div_overlay = document.querySelector('.overlay');
    let deconnection = document.createElement('a');
    deconnection.className = 'fa fa-times-circle';
    deconnection.href = '';
    deconnection.onclick = function () {
        deleteCookie();
    };
    div_overlay.appendChild(deconnection);

    let container = document.querySelector('#container');
    let div_btn = document.createElement('div');
    let div_btn_manga = document.createElement('div');
    let div_manga = document.createElement('div');
    let label_btn_manga = document.createElement('label');
    let div_btn_anime = document.createElement('div');
    let div_anime = document.createElement('div');
    let label_btn_anime = document.createElement('label');
    let btn_manga = document.createElement('input');
    let btn_anime = document.createElement('input');

    div_btn.id = 'div_btn';
    div_btn_anime.id = 'div_btn_anime';
    div_btn_manga.id = 'div_btn_manga';
    div_anime.id = 'div_anime';
    div_manga.id = 'div_manga';
    btn_manga.type = 'submit';
    btn_manga.name = 'submit';
    btn_manga.className = 'btn btn-info btn-md';
    btn_manga.id = 'btn_manga';
    btn_manga.value = '';
    label_btn_manga.id = 'label_btn_manga';
    label_btn_manga.innerHTML = 'Manga';
    btn_manga.onclick = function () {
        document.location.href = '/manga.html';
    };

    btn_anime.type = 'submit';
    btn_anime.name = 'submit';
    btn_anime.className = 'btn btn-info btn-md';
    btn_anime.id = 'btn_anime';
    btn_anime.value = '';
    label_btn_anime.id = 'label_btn_anime';
    label_btn_anime.innerHTML = 'Anime';
    btn_anime.onclick = function () {
        document.location.href = '/anime.html';
    };

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    div_btn_manga.appendChild(btn_manga);
    div_btn_anime.appendChild(btn_anime);
    div_manga.appendChild(label_btn_manga);
    div_anime.appendChild(label_btn_anime);
    div_manga.appendChild(div_btn_manga);
    div_anime.appendChild(div_btn_anime);
    div_btn.appendChild(div_manga);
    div_btn.appendChild(div_anime);
    container.appendChild(div_btn);
};

checkCookie();