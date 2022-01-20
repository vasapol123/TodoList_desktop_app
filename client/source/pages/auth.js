function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

$(document).on('ready', async function() {
    const redirect = '../../index.html';

    $('.signup').hide();

    const token = getCookie("token");
    const tokenId = getCookie('tokenId');

    if (token && tokenId) {
        await eel.setToken(token, tokenId)();
        window.location.href = redirect;
    }

    $('.login__form').on('submit', async function(event) {
        event.preventDefault();

        const user = await eel.login($(this).children('.login__email').val(), $(this).children('.login__password').val())();
        
        if (user.error) {
            console.log(user);

            return;
        }
        const token = await eel.getToken()();

        setCookie("token", token._Token__token, 1);
        setCookie('tokenId', token._Token__id, 1);
        window.location.href = redirect;
    });

    $('.login__to-signup').children('span').on('click', function() {
        $(this).parent().parent().hide();
        $('.signup').show();
    });

    $('.signup__form').on('submit', async function(event) {
        event.preventDefault();

        const email = $(this).children('.signup__email').val();
        const password = $(this).children('.signup__password').val();
        const confirm = $(this).children('.signup__confirm').val();

        if (password != confirm) {
            console.log('false');
        }

        const newUser = await eel.createUser(email, password)();

        if (newUser.error) {
            console.log(newUser.error);
            return
        }

        window.location.href = redirect;
    });
});