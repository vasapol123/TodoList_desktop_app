import uuid

class User:
    def __init__(self, email, password):
        self.__id = uuid.uuid5(uuid.NAMESPACE_URL, email).hex
        self.__email = email
        self.__password = password
        self.__createdLists = []
        self.__tokens = []

if __name__ == '__main__':
    test = User('vasapol123@gmail.com')