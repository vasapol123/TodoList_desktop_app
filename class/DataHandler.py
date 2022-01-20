import json
from pathlib import Path

class DataHandler:
    def __init__(self):
        self.__currentPath = Path(__file__).parent.parent.absolute()

    def readTasks(self):
        with open(self.__currentPath/'data'/'tasks.json') as file:
            return json.load(file)

    def writeTasks(self, data):
        with open(self.__currentPath/'data'/'tasks.json', 'w') as file:
            json.dump(data, file, indent=4, separators=(',', ': '))

    def readUsers(self):
        with open(self.__currentPath/'data'/'users.json') as file:
            return json.load(file)

    def writeUsers(self, data):
        with open(self.__currentPath/'data'/'users.json', 'w') as file:
            json.dump(data, file, indent=4, separators=(',', ': '))