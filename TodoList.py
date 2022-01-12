import json
from pathlib import Path
from Task import Task

class TodoList:
    def __init__(self, topic):
        self._topic = topic
        self._pinned = False
        self.__currentPath = Path(__file__).parent.absolute()
        self.__list = self.__readTasks()

        tasks = self.__list
        for list in [*tasks]:
            if (list == topic):
                return None

        tasks[topic] = []
        self.__writeTasks(tasks)

    # To-do list private methods or behaviours
    def __readTasks(self):
        with open(self.__currentPath/'data'/'tasks.json') as file:
            return json.load(file)

    def __writeTasks(self, data):
        with open(self.__currentPath/'data'/'tasks.json', 'w') as file:
            json.dump(data, file, indent=4, separators=(',', ': '))  

    def getTasks(self):
        return self.__list[self._topic]

    def getTask(self, taskId):
        for task in self.getTasks():
            if (task['_id'] == taskId):
                return task

        raise Exception('Task not found!')

    def createTask(self, name, deadline):
        task = Task(name, deadline)     
        tasks = self.getTasks()
          
        # checks whether name is exist in the to-do list
        for i in range(len(tasks)):
            if (tasks[i]['name'] == name):
                raise Exception('Name is exist!')

        tasks.append({
            "_id": task._id,
            "name": task.name,
            "deadline": task.deadline,
            "completed": task.completed
        })

        self.__writeTasks(self.__list)

    def deleteTask(self, taskId):
        tasks = self.getTasks()

        newTasks = filter(lambda task: (task['_id'] != taskId), tasks)

        self.__list[self._topic] = list(newTasks)
        self.__writeTasks(self.__list)

    def updateTask(self, taskId, newTaskData):
        task = self.getTask(taskId)
        tasks = self.getTasks()

        for key in [*task]:
            if (key in newTaskData):
                task[key] = newTaskData[key]

        newTasks = map(lambda oldTask: (
            task if (oldTask['_id'] == taskId) else oldTask), tasks)

        self.__list[self._topic] = list(newTasks)
        self.__writeTasks(self.__list)
        
if __name__ == '__main__':
    todoList = TodoList('Shopping')
    print(todoList.createTask('Buy rice', 'Today'))
    # print(todoList.updateTask('907748f3bf1c4d3f9cabbf4def0e49b9', { "name": "pee","deadline": "eiei" }))