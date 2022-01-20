from uuid import uuid5


import uuid

class Token:
    def __init__(self, token):
        self.__id = uuid.uuid4().hex
        self.__token = token