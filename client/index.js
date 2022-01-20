const createTaskElement = (task) => {
    const taskElement = $('<li>', { class: 'task__item' })
    .append($('<div>', { class: 'task__content' })
    .append([ 
        $('<div>', { class: 'task__checkbox checkbox' }).append([
            $('<input>', {
                class: 'checkbox__input',
                type: 'checkbox',
                change: async function() {
                    const task = $(this).parents('.task__item').data('task');

                    const updatedTask = await eel.updateTask(task._id, { "_completed": $(this).is(':checked') })();
                    if (updatedTask.error) {
                        $('.task__form').after(createInvalidElement(updatedTask.error))

                        return
                    }
                    const taskNameInput = $(this).parent().next('.task__name');

                    if (updatedTask._completed) {
                        taskNameInput.css({
                            'text-decoration': 'line-through',
                            'color': 'rgba(0, 0, 0, 0.2)'
                        });
                    }
                    else {
                        taskNameInput.css({ 
                            'text-decoration': 'none',
                            'color': 'rgba(0, 0, 0, 1)'
                        });
                    }
                }
            })
            .prop('checked', task._completed),
            $('<span>', { class: 'checkbox__checkmark' })
        ]),
        $('<input>', {
            class: 'task__name',
            disabled: 'disabled'
        })
        .css({
            'text-decoration': function() {
                if (task._completed) {
                        return 'line-through';
                }
            },
            'color': function() {
                if (task._completed) {
                        return 'rgba(0, 0, 0, 0.2)'
                }
            }
        })
        .val(task._name),
        $('<p>', {
            class: 'task__date-p'
        })
        .append([
            $('<span>').text(task._deadline.split(':')[1]),
            $('<span>').text(task._deadline.split(':')[0])
        ]),
        $('<button>', { 
            class: 'task__edit',
            type: 'button'
        })
        .on('click',
            async function() {
                let iteration = $(this).data('iteration') || 1;
                const nameInput = $(this).prevAll('.task__name');

                switch (iteration) {
                    case 1: {
                        // editing task
                        $(this).parents().children('.task__name').not('button').removeAttr('disabled');
                        $(this).prev().trigger('focus');
                        $(this).text('Save');

                        break;
                    }
                    case 2: {
                        $(this).parents().children('.task__name').not('button').attr('disabled', 'disabled');
                        $(this).text('Edit');
                        const task = $(this).parents('.task__item').data('task');

                        const newData = {
                            "_name": nameInput.val()
                        };
                        
                        const updatedTask = await eel.updateTask(task._id, newData)();

                        if (updatedTask.error) {
                            $('.task__form').after(createInvalidElement(updatedTask.error))
                            
                            break;
                        }
                        $(this).parents('.task__item').data('task', updatedTask);

                        nameInput.val(updatedTask._name);

                        break;
                    }
                }
                iteration++;
                if (iteration > 2) iteration = 1;
                $(this).data('iteration', iteration);
            }
        )
        .text('Edit'),
        $('<button>', { 
            class: 'task__delete',
            type: 'button',
            click: async function() {
                await eel.deleteTask(task._id)();

                $(this).parents('.task__item').fadeOut('fast', () => {
                    $(this).parents('.task__item').remove();
                });
            }
        })
        .text('Delete')
    ]));

    taskElement.data('task', task);

    return taskElement;
};

const createListElement = (list) => {
    function edit(event) {
        event.stopPropagation();
        const contents = $(this).prevAll();

        $(this).parent().prop('disabled', true);
        contents.css('pointer-events', 'auto');
        contents.prop('contenteditable', true).trigger('focus');
        $(this).text('Save');
        $(this).one('click', save);
    }

    async function save(event) {
        event.stopPropagation();

        const contents = $(this).prevAll('p');
        
        $(this).parent().prop('disabled', false);
        contents.css('pointer-events', 'none');
        const updatedContents = [];
        contents.each(function(_, content) {
            updatedContents.push(content.textContent);
        });

        const updatedList = await eel.updateList(list._id, {
            "_topic": updatedContents[1],
            "_description": updatedContents[0]
        })();

        if (updatedList.error) {
            $('.list__form').after(createInvalidElement(updatedList.error));
        }

        contents.prop('contenteditable', false);

        $(this).text('Edit');
        $(this).one('click', edit);
    }

    const listElement = $('<div>', { class: 'list__item' })
    .append($('<button>', {
        class: 'list__content',
        click: async function() {
            $('#task > *').remove();
            $('#list').hide();
    
            createTaskForm().prependTo('#task');
    
            $('#task').show();
    
            const ul = $('<ul>', { class: 'task__menu' }).appendTo('#task');
    
            $('<div>', { 
                class: 'task__back',
                click: async () => {
                    $('#list').show();
                    $('#task').children().remove();
    
                    const tasks = await eel.getTasks(list._id)();
    
                    console.log($(this).children('.list__tasks').text(`${tasks.length} tasks`));
                }
            })
            .append(
                $('<i>', { class: 'fas fa-chevron-left' }),
                $('<p>').text('Lists')
            ).prependTo('#task');
    
            const tasks = await eel.getTasks(list._id)();
    
            tasks.forEach((task) => {
                const taskElement = createTaskElement(task);
                taskElement.appendTo(ul);
            });
        }
    })
    .append([
        $('<p>', {
            class: 'list__topic',
            click: function(event) {
                event.stopPropagation();
            },
            keypress: function(event) {
                 return event.which != 13; 
            }
        })
        .css('pointer-events', 'none')
        .text(list._topic),
        $('<p>', { 
            class: 'list__description',
            click: function(event) {
                event.stopPropagation();
            }
        })
        .css({ 
            'pointer-events': 'none' 
        })
        .text(list._description || "No description"),
        $('<button>', { 
            class: 'list__edit'
        })
        .text('Edit')
        .one('click', edit),
        $('<button>', { 
            class: 'list__delete',
            click: async function(event) {
                event.stopPropagation();

                const list = $(this).parents('.list__item').data('list');

                await eel.deleteList(list._id)();

                $(this).parents('.list__item').fadeOut('fast', () => {
                    $(this).parents('.list__item').remove();
                });
            } 
        }).text('Delete'),
        $('<p>', { class: 'list__tasks' }).text(`${list._List__tasks.length} tasks`),
        $('<p>', { class: 'list__date' }).text(list._date)
    ]));
    console.log(list);
    listElement.data('list', list);

    return listElement;
};

const createTaskForm = () => {
    return $('<form>', {
        class: 'task__form',
        submit: async function(event) {
            event.preventDefault();

            const name = $(this).children('.task__input').val();
            const deadline = $(this).children('.task__date').val();

            const dateFormat = `${moment(new Date(deadline)).from(moment(new Date()))}:${moment(new Date(deadline)).format('DD/MM/YYYY')}`;
            console.log(dateFormat);
            task = await eel.createTask(name, dateFormat)();
            createTaskElement(task).appendTo($('.task__menu'));

            $(this).children('.task__input').val('');
            $(this).children('.task__date').val('');
        }
    })
    .append([
        $('<input>', { class: 'task__input', placeholder: 'Add some topic' }),
        $('<input>', { 
            class: 'task__date',
            type: 'date'
        }),
        $('<button>', { class: 'task__button' }).text('Create')
    ]);
};

const createInvalidElement = (text) => {
    const invalidElement = $('<div>', {
        class: 'invalid'
    }).append([
        $('<p>').text(text),
        $('<i>', { 
            class: 'fas fa-slash',
            click: function() {
                $(this).parent().remove();
            }
        })
    ]);
    
    return invalidElement;
};

const createListForm = () => {
    /*
    *   <form class="list__form">
    *       <input class="list__input" placeholder="Add some topic" />
    *       <textarea class="list__textarea" placeholder="Add some description"></textarea>
    *       <button class="list__button">Create</button>
    *       <i class="fas fa-times fa-lg"></i>
    *   </form>
    */
    return $('<form>', {
        class: 'list__form',
        submit: async function(event) {
            event.preventDefault();

            const _list = await eel.createList($(this).children('.list__input').val(), $(this).children('.list__textarea').val())();
            
            $('.header__list-toggle').one('click', function() {
                $('#list').children().prepend(createListForm());
            });
            
            if (_list.error) {
                $('.list__form').after(createInvalidElement(_list.error));

                return
            }
            
            $('.list__menu').append(createListElement(_list));

            $(this).fadeOut('fast', () => {
                $(this).remove();
            });
        }
    }).append([
        $('<input>', { class: 'list__input', placeholder: 'Add some topic' }),
        $('<textarea>', { class: 'list__textarea', placeholder: 'Add some description' }),
        $('<button>', { class: 'list__button' }).text('Create'),
        $('<i>', { 
            class: 'fas fa-times fa-lg',
            click: function() {
                $('.header__list-toggle').one('click', function() {
                    $('#list').children().prepend(createListForm());
                });

                $(this).parent().fadeOut('fast', () => {
                    $(this).parent().remove();
                });
            }
        })
    ]).fadeIn('fast');
};

function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

$(document).on('ready', async function() {
    const items = await eel.getLists()();
    const ul = $('<ul>', { class: 'list__menu' }).appendTo('#list');

    items.forEach((item) => {
        ul.append(createListElement(item));
    });  

    $('#task').hide();
    
    $('.header__list-toggle').one('click', function() {
        $('#list').prepend(createListForm());
    });

    $('.header__logout').on('click', async function() {
        user = await eel.getCurrentUser()();
        await eel.logout(user._User__id)();

        eraseCookie('token');
        eraseCookie('tokenId');
        window.location.href = './pages/auth.html';
    });

    $(document).on('click', function(event) {
        const isDropdownButton = event.target.matches('[data-dropdown-button]');
        if (!isDropdownButton && event.target.closest('[data-dropdown]') != null) return;

        let currentDropdown;
        if (isDropdownButton) {
            currentDropdown = event.target.closest('[data-dropdown]');
            currentDropdown.classList.toggle('active');
        }

        $('[data-dropdown].active').each((_, dropdown) => {
            if (dropdown === currentDropdown) return;
            dropdown.classList.remove('active');
        })
    });
});