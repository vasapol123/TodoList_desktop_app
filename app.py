import eel
from TodoList import TodoList

eel.init('client')

@eel.expose
def logTasks():
    todoList = TodoList('Shopping')
    return todoList.getTasks()


eel.start('index.html')