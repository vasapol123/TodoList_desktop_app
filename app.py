import eel
import json
from TodoList import TodoList

eel.init('client')

todoList = None;

@eel.expose
def createTodoList(value):
    todoList = TodoList(value)
    return todoList._topic

@eel.expose
def getTodoList():
    with open('./data/tasks.json') as file:
        return [*json.load(file)]

@eel.expose
def getTasks(topic):
    global todoList
    todoList = TodoList(topic)
    return todoList.getTasks()

@eel.expose
def createTask(name):
    return todoList.createTask(name, 'Today')

@eel.expose
def updateTask(taskId, value):
    return todoList.updateTask(taskId, value);

@eel.expose
def deleteTask(taskId):
    todoList.deleteTask(taskId);


eel.start('index.html')