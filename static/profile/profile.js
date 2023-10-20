const button = document.getElementById('signout_button');
button.onclick = () => {
    google.accounts.id.disableAutoSelect();
    const http = new XMLHttpRequest();
    http.open('GET', 'http://localhost:3000/auth/log_out');
    http.send();

    http.onreadystatechange = (event) => {
        if (http.readyState !== 4) return;
        window.location = '/feed';
    }
}