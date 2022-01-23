const updateTaskDate = async (task) => {
    const deadlineDate = task._deadline.split(':')[1].split('/');

    const deadlineFromNow = moment(
        deadlineDate, 'DD MM YYYY'
    )
    .from(moment(new Date()));

    console.log(deadlineDate, deadlineFromNow);

    const isOverdue = moment(
        deadlineDate, 'DD MM YYYY'
    )
    .isBefore(moment(new Date()));

    if (deadlineFromNow !== task._deadline.split(':')[0]) {
        const updatedTask = await eel.updateTask(task._id, {
            "_deadline": `${deadlineFromNow}:${task._deadline.split(':')[1]}`,
            ...(!task._completed && !task._overdue && isOverdue) && { "_overdue": isOverdue }
        })();

        if (updatedTask.error) {
            return { error: updatedTask.error };
            // $('.task__form').after(createInvalidElement(updatedTask.error));
        }
        return updatedTask;
    }
    return null;
};

const createTaskElement = async (task) => {
    const taskElement = $('<li>', { class: 'task__item' })
    .append($('<div>', { class: 'task__content' })
    .append([ 
        $('<div>', { class: 'task__checkbox checkbox' }).append([
            $('<input>', {
                class: 'checkbox__input',
                type: 'checkbox',
                change: async function() {
                    const task = $(this).parents('.task__item').data('task');
                    const isCompleted = $(this).is(':checked');

                    const deadlineDate = task._deadline.split(':')[1].split('/');
                    const isOverdue = !isCompleted && moment(
                        deadlineDate, 'DD MM YYYY'
                    )
                    .isBefore(moment(new Date()));

                    const updatedTask = await eel.updateTask(task._id, {
                         ...({}) && { "_completed": isCompleted },
                         ...(!task._completed) && { "_overdue": isOverdue }
                    })();

                    if (updatedTask.error) {
                        alert(updatedTask.error);
                        // $('.task__form').after(createInvalidElement(updatedTask.error));
                        return;
                    }

                    if (isCompleted) {
                        $(this).parents('.task__item').detach().appendTo($('.task__completed'));
                    }
                    else if (!isCompleted) {
                        $(this).parents('.task__item').detach().appendTo($('.task__incomplete'));
                    }
                    

                    if (isOverdue) {
                        $(this).prop('disabled', true);
                    }

                    const taskName = $(this).parent().nextAll('.task__name');
                    const taskDate = $(this).parent().nextAll('.task__date-p');
                    if (updatedTask._completed) {
                        taskName.css({
                            'text-decoration': 'line-through',
                            'color': 'rgba(0, 0, 0, 0.2)'
                        });
                        taskDate.css({
                            'color': 'rgba(0, 0, 0, 0.2)'
                        });
                    }
                    else {
                        taskName.css({ 
                            'text-decoration': 'none',
                            'color': 'rgba(0, 0, 0, 1)'
                        });
                        taskDate.css({
                            'color': 'rgba(0, 0, 0, 1)'
                        });
                    }
                }
            })
            .prop('checked', (task._completed))
            .prop('disabled', (task._overdue)),
            $('<span>', { class: 'checkbox__checkmark' })
        ]),
        $('<input>', {
            class: 'task__name',
            disabled: 'disabled'
        })
        .css({
            'text-decoration': function() {
                if (task._completed || task._overdue) {
                        return 'line-through';
                }
            },
            'color': function() {
                if (task._completed || task._overdue) {
                        return 'rgba(0, 0, 0, 0.2)';
                }
            }
        })
        .val(task._name),
        $('<p>', {
            class: 'task__date-p'
        })
        .css({
            'color': function() {
                if (task._completed || task._overdue) {
                        return 'rgba(0, 0, 0, 0.2)';
                }
            }
        })
        .append([
            $('<span>').text(task._deadline.split(':')[1]),
            $('<span>').text((task._overdue) ? 'overdue' : task._deadline.split(':')[0])
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
                            alert(updatedTask.error);
                            // $('.task__form').after(createInvalidElement(updatedTask.error))
                            
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

const createListElement = async (list) => {
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
            alert(updatedList.error);
            // $('.list__form').after(createInvalidElement(updatedList.error));
        }

        contents.prop('contenteditable', false);

        $(this).text('Edit');
        $(this).one('click', edit);
    }

    const tasks = await eel.getTasks(list._id)();
    tasks.forEach(async (task) => {
        await updateTaskDate(task);
    });

    const listElement = $('<div>', { class: 'list__item' })
    .append($('<button>', {
        class: 'list__content',
        click: async function() {
            $('#task > *').remove();
            $('#list').hide();
            $('.chart-button').hide();
    
            createTaskForm().prependTo('#task');
    
            $('#task').show();
    
            const ul = $('<ul>', { class: 'task__menu' }).appendTo('#task');
            ul.append([
                $('<div>', { class: 'task__incomplete' }).append($('<li>').append($('<span>').text('Incomplete'))),
                $('<div>', { class: 'task__completed' }).append($('<li>').append($('<span>').text('Completed'))),
                $('<div>', { class: 'task__overdue' }).append($('<li>').append($('<span>').text('Overdue')))
            ]);
    
            $('<div>', { 
                class: 'task__back',
                click: async () => {
                    $('#list').show();
                    $('.chart-button').show();
                    $('#task').children().remove();
    
                    const tasks = await eel.getTasks(list._id)();
    
                    $(this).children('.list__tasks').text(`${tasks.length} tasks`);
                }
            })
            .append(
                $('<i>', { class: 'fas fa-arrow-left' }),
                $('<p>').text('Lists')
            )
            .prependTo('#task');
    
            const tasks = await eel.getTasks(list._id)();
    
            tasks.forEach(async (task) => {
                const taskElement = await createTaskElement(task);
                if (task._overdue) {
                    taskElement.appendTo(ul.children('.task__overdue'));
                }
                else if (!task._completed) {
                    taskElement.appendTo(ul.children('.task__incomplete'));
                }
                else {
                    taskElement.appendTo(ul.children('.task__completed'));
                }
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
                await eel.updateUserList()();

                $(this).parents('.list__item').fadeOut('fast', () => {
                    $(this).parents('.list__item').remove();
                });
            } 
        }).text('Delete'),
        $('<p>', { class: 'list__tasks' }).text(`${list._List__tasks.length} tasks`),
        $('<p>', { class: 'list__date' }).text(list._date)
    ]));
    
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
            const isOverdue = moment(deadline).isBefore(moment(new Date()));

            let task = await eel.createTask(name, dateFormat)();
            if (isOverdue) {
                await eel.updateTask(task._id, {
                    "_overdue": isOverdue 
                })();
            }

            task = { ...task, "_overdue": isOverdue };
            const ul = $('.task__menu');
            const taskElement = await createTaskElement(task)
            if (task._overdue) {
                taskElement.appendTo(ul.children('.task__overdue'));
            }
            else if (!task._completed) {
                taskElement.appendTo(ul.children('.task__incomplete'));
            }
            else {
                taskElement.appendTo(ul.children('.task__completed'));
            }

            $(this).children('.task__input').val('');
            $(this).children('.task__date').val('');
        }
    })
    .append([
        $('<input>', { class: 'task__input', placeholder: 'Add some task' }),
        $('<input>', { 
            class: 'task__date',
            type: 'date',
            lang: 'en-EN'
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
                window.alert(_list.error);
                // $('.list__form').after(createInvalidElement(_list.error));
                return;
            }
            
            $('.list__menu').append(await createListElement(_list));

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

    items.forEach(async (item) => {
        ul.append(await createListElement(item));
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
        window.location.href = './source/pages/auth.html';
    });

    $('.header__import').on('click', async function() {
        user = await eel.getCurrentUser()();
        await eel.importLists(user._User__id)();

        window.location.reload();
    });

    $('.header__export').on('click', async function() {
        lists = await eel.getLists()();
        user = await eel.getCurrentUser()();
        await eel.exportLists(lists, user._User__id)();
    });

    $( function() {
        $('.dropdown__dropdown-menu').draggable({ handle: 'i' });
    } );

    // dropdown button implement
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