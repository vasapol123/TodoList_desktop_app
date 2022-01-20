import bcrypt
import jwt
import os
from dotenv import *
from DataHandler import DataHandler

class Auth:
    def __init__(self):
        load_dotenv(find_dotenv('../config/.env'))
        self.__dataHandler = DataHandler()
        self.__JWT_SECRET = os.getenv('JWTSECRET')

    def __getUser(self, userId):
        for user in self.__dataHandler.readUsers():
            if (user['_User__id'] == userId):
                return user

        raise Exception('User not found!')

    def hashPassword(self, password):
        salt = bcrypt.gensalt()
        hasded = bcrypt.hashpw(str.encode(password), salt)

        return hasded

    def authUser(self, userId, password):
        user = self.__getUser(userId)

        isAuth = False

        if (bcrypt.checkpw(password.encode('utf-8'), (user['_User__password']).encode('utf-8'))):
            isAuth = True

        return isAuth

    def generateAuthToken(self, userId):
        encodedJwt = jwt.encode({ '_id': userId }, self.__JWT_SECRET, algorithm='HS256')

        return encodedJwt

    def verifyAuthToken(self, token):
        user = None
        try:
            decodedJwt = jwt.decode(token, self.__JWT_SECRET, algorithms=['HS256'])

            user = self.__getUser(decodedJwt['_id'])
            if (user):
                isVerified = True
        except:
            isVerified = False

        return (isVerified, user)


if __name__ == '__main__':
    auth = Auth()
    # print(auth.authUser('b3445c5b0b005c1389c77a6e8884dcfb', '1234567Pps'))
    # print(auth.generateAuthToken('b3445c5b0b005c1389c77a6e8884dcfb'))
    print(auth.verifyAuthToken('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiJiMzQ0NWM1YjBiMDA1YzEzODljNzdhNmU4ODg0ZGNmYiJ9.VJwXMeQ3cR9OhJKwdwYoK1-AIbqZLz3Ks0ZcEKKlCKw'))