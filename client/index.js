document.querySelector('button').onclick = () => {
    eel.logTasks()((value) => {
        console.log(value)
    });
};