eel.expose(onButtonClick);
function onButtonClick() {
    const userInput = document.getElementsByClassName('header__input')[0].value
    return userInput;
};

let taskObjects = [];

const createTaskElement = (textContent) => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    const iEdit = document.createElement('i');

    span.textContent = textContent;

    // create editing icon
    iEdit.className = 'fas fa-pencil-alt fa-lg';
    iEdit.onclick = function() {
        const nameInput = document.createElement('input');
        const updateButton = document.createElement('button');

        nameInput.value = this.previousSibling.textContent;
        updateButton.textContent = 'update';

        task = taskObjects.find((task) => { 
            return task.name === textContent;
        });
        
        updateButton.onclick = async function() {
            updatedTask = await eel.updateTask(task._id, { "name": nameInput.value })();
            span.textContent = updatedTask.name;
            nameInput.remove();
            updateButton.remove();
        }

        this.parentElement.appendChild(nameInput);
        this.parentElement.appendChild(updateButton);
    }

    div.appendChild(span);
    div.appendChild(iEdit);

    // create deleting icon
    const iDelete = document.createElement('i');
    iDelete.className = 'fas fa-trash fa-lg';
    iDelete.onclick = async function() {
        task = taskObjects.find((task) => { 
            return task.name === textContent;
        });

        await eel.deleteTask(task._id)();

        this.parentElement.parentElement.remove();

        taskObjects = taskObjects.filter((taskObject) => {
            return task._id !== taskObject._id
        });
        console.log(taskObjects);
    }

    div.appendChild(iDelete);
    return div;
};

const renderTasks = async (topic, element) => {
    element.style.display = 'block';
    
    tasks = await eel.getTasks(topic)();
    const ul = document.createElement('ul');
    element.appendChild(ul);

    tasks.forEach((element) => {
        taskObjects.push(element);
        const li = document.createElement('li');

        ul.appendChild(li);

        li.appendChild(createTaskElement(element.name));

    });
};

const addTaskElement = (name, element) => {
    const li = document.createElement('li');
    li.appendChild(createTaskElement(name));
    element.children[3].appendChild(li);
}

const createTodoElement = (topic) => {
    const todoElement = document.createElement('button');
    todoElement.innerHTML = topic;

    todoElement.onclick = async function() {
        const tasksElement = document.getElementById('tasks');
        tasksElement.innerHTML = '';
        taskObjects = [];
        
        const nameInput = document.createElement('input');
        const dateInput = document.createElement('input');
        const taskButton = document.createElement('button');

        dateInput.type = 'date';
        console.log(dateInput);
        taskButton.textContent = 'Add';
        tasksElement.appendChild(nameInput);
        tasksElement.appendChild(dateInput);
        tasksElement.appendChild(taskButton);
        
        await renderTasks(this.textContent, tasksElement);
        
        taskButton.onclick = async function() {
            console.log(dateInput.value);
            task = await eel.createTask(nameInput.value)();
            taskObjects.push(task);
            console.log(taskObjects);
            addTaskElement(task.name, tasksElement);
        };
        console.log(taskObjects);
    };

    document.getElementById('todo-list').appendChild(todoElement);
};

// initial fetch data from local database
eel.getTodoList()((values) => {
    values.forEach((value) => {
        createTodoElement(value.topic);
    });
});

document.getElementById('tasks').style.display = 'none';

document.querySelector('.header__button').onclick = () => {
    eel.createTodoList()((value) => {
        createTodoElement(value);
    });
};
