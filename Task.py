import uuid

class Task:
    def __init__(self, name, deadline):
        self._id = uuid.uuid4().hex
        self._name = name
        self._deadline = deadline
        self._completed = False

    # initializes getter functions
    @property
    def name(self):
        return self._name
    
    @property
    def deadline(self):
        return self._deadline
    
    @property
    def completed(self):
        return self._completed

    # initializes setter functions
    @name.setter
    def name(self, value):
        self._name = value

    @deadline.setter
    def deadline(self):
        return self._deadline

if __name__ == '__main__':
    task = Task("Name", "Today")
    task.name = "new name"
    print(task.name)