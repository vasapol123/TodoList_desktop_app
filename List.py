import uuid
from datetime import datetime

class List:
    def __init__(self, topic, description):
        self._id = uuid.uuid4().hex
        self._topic = topic
        self._description = description
        self._date = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        self._pinned = False
        self._priority = None
        self.__tasks = []
        
if __name__ == '__main__':
    todoList = List('Shopping')
