const addTodoElement = (name) => {
    const todoButton = $('<button>', {
        class: 'todo-list__button',
        click: async function() {
            const nameInput = $('<input>', {
                class: 'tasks__form',
            })

            const addTaskButton = $('<button>', { class: 'tasks__button' })

            $('#tasks').css('display', '');

            tasks = await eel.getTasks(name)();

            $('#tasks > ul').remove();

            const ul = $('<ul>', { class: 'tasks__list' }).appendTo('#tasks');

            tasks.forEach((task) => {
                $('<li>', { class: `tasks__item` }).text(task.name).appendTo(ul);
            });
        }
    }).text(name);

    todoButton.wrap('<div class="todo-list__container"></div>',).parent().appendTo('#todo-list');
};

$(document).on('ready', async function() {
    const items = await eel.getTodoList()();

    items.forEach((item) => {
        addTodoElement(item.topic)
    });  

    $('#tasks').css('display', 'none');

    $('.header__button').on('click', function() {
        const inputValue = $('.header__input').val();
        eel.createTodoList(inputValue)((value) => {
            addTodoElement(value);
        });
    });
});