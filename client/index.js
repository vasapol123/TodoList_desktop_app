document.querySelector('button').onclick = () => {
    eel.printText()((value) => {
        document.querySelector('h1').innerHTML = value;
    });
};