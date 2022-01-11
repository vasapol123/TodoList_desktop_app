document.querySelector('button').onclick = () => {
    eel.logTasks()((value) => {
        document.querySelector(".title").innerHTML = value;
    });
};