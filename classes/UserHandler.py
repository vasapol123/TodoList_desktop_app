from operator import index
from time import sleep
import re

from .User import User
from .Auth import Auth
from .Token import Token
from .DataHandler import DataHandler
from .ListHandler import ListHandler

class UserHandler:
    def __init__(self):
        self.__dataHandler = DataHandler()
        self.__users = self.__dataHandler.readUsers()
        self.__AuthToken = None

    @property
    def token(self):
        return self.__AuthToken

    @token.setter
    def token(self, token):
        self.__AuthToken = { 
            '_Token__id': token[0],
            '_Token__token': token[1] 
        }

    def getUsers(self):
        return self.__users

    def getUser(self, userId):
        for user in self.getUsers():
            if (user['_User__id'] == userId):
                return user

        raise Exception('User not found!')

    def createUser(self, email, password):
        auth = Auth()

        # verifies email is valid
        regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        if (not re.fullmatch(regex, email)):
            raise ValueError('Email is invalid')
        
        # verifies password is strong
        regexs = (r'[A-Z]', r'[a-z]', r'[0-9]')
        if not (len(password) >= 8 and all(re.search(regex, password) for regex in regexs)):
            raise ValueError('Password is invalid')

        users = self.getUsers()

        # checks if email is exist in database
        for x in users:
            if (re.search(r"^({0})$".format(x['_User__email']), email, re.IGNORECASE)):
                raise Exception('Email is exist!')

        password = (auth.hashPassword(password)).decode('utf-8')
        user = User(email, password)
        
        newUser = user.__dict__
        self.__AuthToken = Token(auth.generateAuthToken(newUser['_User__id'])).__dict__
        newUser['_User__tokens'].append(self.__AuthToken)
              
        users.append(newUser)

        self.__dataHandler.writeUsers(users)
        return newUser

    def loginUser(self, email, password):
        auth = Auth()
        users = self.getUsers()
        user = None
        index = 0

        for x, i in zip(users, range(len(users))):
            if (re.search(r"^({0})$".format(x['_User__email']), email, re.IGNORECASE)):
                index = i
                user = x
        
        if (user == None):
            raise Exception('Email is invalid')

        userId = user['_User__id']

        if not (auth.authUser(userId, password)):
            raise Exception('Please authenticate')
        
        self.__AuthToken = Token(auth.generateAuthToken(userId)).__dict__
        user['_User__tokens'].append(self.__AuthToken)

        (users[index]).update({ '_User__tokens': user['_User__tokens'] })

        self.__dataHandler.writeUsers(users)

        return user

    def logoutUser(self, userId):
        users = self.getUsers()
        user = self.getUser(userId)

        for i in range(len(users)):
            if (user['_User__tokens'][i]['_Token__id'] == self.__AuthToken['_Token__id']):
                del user['_User__tokens'][i]
                break

        self.__dataHandler.writeUsers(self.__users)

        return user

    def appendList(self, listId):
        auth = Auth()
        users = self.getUsers()
        index = 0
        user = auth.verifyAuthToken(self.__AuthToken['_Token__token'])

        if (not user[0]):
            raise Exception('Please authenticate')

        for x, i in zip(users, range(len(users))):
            if (x['_User__id'] == user[1]['_User__id']):
                index = i
                break
        
        print(index)

        (user[1]['_User__createdLists']).append({ "_List__id": listId })

        (users[index]).update({ '_User__createdLists': user[1]['_User__createdLists'] })

        self.__dataHandler.writeUsers(self.__users)

    def updateList(self):
        auth = Auth()
        users = self.getUsers()
        lists = ListHandler().getLists()
        userListArray = []

        user = auth.verifyAuthToken(self.__AuthToken['_Token__token'])

        if (not user[0]):
            raise Exception('Please authenticate')

        for x in user[1]['_User__createdLists']:
            userListArray.append(x['_List__id'])

        for x, i in zip(users, range(len(users))):
            if (user[1]['_User__id'] == x['_User__id']):
                index = i
                break

        lists = list(filter(lambda list: list['_id'] in userListArray , lists))

        user[1]['_User__createdLists'] = []

        for _list in lists:
            (user[1]['_User__createdLists']).append({ "_List__id": _list['_id'] })

        (users[index]).update({ '_User__createdLists': user[1]['_User__createdLists'] })

        self.__dataHandler.writeUsers(self.__users)

if __name__ == '__main__':
    user = UserHandler()
    auth = Auth()
    # print(user.createUser('jorin17@gmail.com', '1234567Pp'))
    # print(auth.authUser('b3445c5b0b005c1389c77a6e8884dcfb', '1234567Pp'))
    user.loginUser('vasapol123@gmail.com', '1234567Pp')
    user.updateList()
    sleep(5)
    print(user.logoutUser('b3445c5b0b005c1389c77a6e8884dcfb'))

        


        