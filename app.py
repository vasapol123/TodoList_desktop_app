import eel
from ListHandler import ListHandler
from TaskHandler import TaskHandler

eel.init('client')

tasks = None

@eel.expose
def createList(topic, description):
    try:
        _list = ListHandler().createList(topic, description)
        return _list
    except Exception as error:
        return { "error": str(error) }

@eel.expose
def getLists():
    lists = ListHandler().getLists()
    return lists

@eel.expose
def updateList(listId, newData):
    try:
        updatedList = ListHandler().updateList(listId, newData)
        return updatedList
    except Exception as error:
        return { "error": str(error) }

@eel.expose
def deleteList(listId):
    return ListHandler().deleteList(listId)

@eel.expose
def getTasks(listId):
    global tasks
    tasks = TaskHandler(listId)
    return tasks.getTasks()

@eel.expose
def createTask(name, description):
    return tasks.createTask(name, description, 'Today')

@eel.expose
def deleteTask(taskId):
    return tasks.deleteTask(taskId)

@eel.expose
def updateTask(taskId, newData):
    try:
        updatedTask = tasks.updateTask(taskId, newData)
        return updatedTask
    except Exception as error:
        return { "error": str(error) }

eel.start('index.html')