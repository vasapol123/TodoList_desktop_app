import json
from pathlib import Path
from Task import Task

class TodoList:
    def __init__(self, topic):
        self._topic = topic
        self._pinned = False
        self.__currentPath = Path(__file__).parent.absolute()
        self.__tasks = self.__readTasks()

    # To-do list private methods or behaviours
    def __readTasks(self):
        with open(self.__currentPath/'data'/'tasks.json') as file:
            return json.load(file)

    def __writeTasks(self, data):
        with open(self.__currentPath/'data'/'tasks.json', 'w') as file:
            json.dump(data, file, indent=4, separators=(',', ': '))  

    def getTasks(self):
        return self.__tasks

    def getTask(self, taskId):
        for task in self.__tasks:
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

        self.__writeTasks(tasks)

    def deleteTask(self, taskId):
        tasks = self.getTasks()

        newTasks = filter(lambda task: (task['_id'] != taskId), tasks)
        
        self.__writeTasks(list(newTasks))

    def updateTask(self, taskId, newTaskData):
        task = self.getTask(taskId)

        for key in [*task]:
            if (key in newTaskData):
                task[key] = newTaskData[key]

        newTasks = map(lambda oldTask: (
            task if (oldTask['_id'] == taskId) else oldTask), self.__tasks)

        self.__writeTasks(list(newTasks))
        
if __name__ == '__main__':
    todoList = TodoList('Shopping')
    # todoList.createTask('Buy eggs', 'Today')
    print(todoList.updateTask('61c8d368f730408baa74b39f6ffdd6ff', { "name": "pee","deadline": "eiei" }))