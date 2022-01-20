import eel
import sys
from pathlib import Path

sys.path.insert(0, './class');

from ListHandler import ListHandler
from TaskHandler import TaskHandler
from UserHandler import UserHandler
from Auth import Auth

eel.init('client')

tasks, user, userHandler, authToken = (None,) * 4

# List
@eel.expose
def createList(topic, description):
    try:
        _list = ListHandler().createList(topic, description)
        userHandler.appendList(_list['_id'])
        return _list
    except Exception as error:
        return { "error": str(error) }

@eel.expose
def getLists():
    lists = ListHandler().getLists()
    userListArray = []

    for x in user['_User__createdLists']:
            userListArray.append(x['_List__id'])

    def filterList(_list):
        return True if _list['_id'] in userListArray else False

    if (len(user['_User__createdLists']) == 0):
        lists = []
    else:
        lists = list(filter(filterList, lists))

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

# Task
@eel.expose
def getTasks(listId):
    global tasks
    tasks = TaskHandler(listId)
    return tasks.getTasks()

@eel.expose
def createTask(name, deadline):
    return tasks.createTask(name, deadline)

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

# User
@eel.expose
def login(email, password):
    try:
        global user
        global authToken
        global userHandler

        userHandler = UserHandler()

        user = userHandler.loginUser(email, password)
        authToken = userHandler.token

        return user
    except Exception as error:
        return { "error": str(error) }

@eel.expose
def logout(userId):
    global user
    global authToken
    global userHandler

    userHandler.logoutUser(userId)

    user = None
    authToken = None
    userHandler = None

@eel.expose
def createUser(email, password):
    try:
        global user
        global authToken
        global userHandler

        userHandler = UserHandler()

        user = userHandler.createUser(email, password)
        authToken = userHandler.token

        return user
    except Exception as error:
        return { "error": str(error) }

@eel.expose
def updateUserList():
    global user
    global userHandler

    try:
        userHandler.updateList()
    except Exception as error:
        return { "error": str(error) }

@eel.expose
def getCurrentUser():
    global user
    print(user)
    return user

@eel.expose
def getToken():
    global authToken
    return authToken

@eel.expose
def setToken(token, tokenId):
    global user
    global authToken
    global userHandler
    
    authToken = token

    userHandler = UserHandler()
    userHandler.token = (tokenId, token)
    user = Auth().verifyAuthToken(token)[1]

    return user

eel.start('source/pages/auth.html')