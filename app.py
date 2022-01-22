import eel

from classes.ListHandler import ListHandler
from classes.TaskHandler import TaskHandler
from classes.UserHandler import UserHandler
from classes.features.ImportExport import ImportExport
from classes.Auth import Auth

eel.init('client')

tasks, user, userHandler, authToken, authTokenId = (None,) * 5

# List
@eel.expose
def createList(topic, description):
    global userHandler
    print(userHandler.token)
    try:
        _list = ListHandler().createList(topic, description)
        userHandler.appendList(_list['_id'])
        return _list
    except Exception as error:
        return { "error": str(error) }

@eel.expose
def getLists():
    global user
    global userHandler
    global authToken
    global authTokenId

    # update user's lists
    userHandler = UserHandler()
    userHandler.token = (authTokenId, authToken)
    lists = ListHandler().getLists()
    userListArray = []

    _user = userHandler.getUser(user['_User__id'])
    user = _user

    for x in _user['_User__createdLists']:
            userListArray.append(x['_List__id'])

    def filterList(_list):
        return True if _list['_id'] in userListArray else False

    if (len(_user['_User__createdLists']) == 0):
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
        global authTokenId
        global userHandler

        userHandler = UserHandler()

        user = userHandler.loginUser(email, password)
        userToken = user['_User__tokens'][-1]
        print(userToken)
        authToken = userToken['_Token__token']
        authTokenId = userToken['_Token__id']

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
    return user

@eel.expose
def getToken():
    global authToken
    global authTokenId
    return { "_Token__id": authTokenId, "_Token__token": authToken }

@eel.expose
def setToken(token, tokenId):
    global user
    global authToken
    global authTokenId
    global userHandler
    
    authToken = token
    authTokenId = tokenId

    userHandler = UserHandler()
    userHandler.token = (tokenId, token)
    user = Auth().verifyAuthToken(token)[1]

    return user

# Feature
@eel.expose
def exportLists(data, fileName):
    try:
        ImportExport().exportListData(data, fileName)
    except Exception as error:
        return { "error": str(error) }

@eel.expose
def importLists(userId):
    try:
        ImportExport().importListData(userId)
    except Exception as error:
        return { "error": str(error) }

eel.start('source/pages/auth.html')