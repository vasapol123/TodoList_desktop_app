import json
import uuid
from pathlib import Path
from Task import Task

class TodoList:
    def __init__(self, topic):
        self._id = uuid.uuid4().hex
        self._topic = topic
        self._pinned = False
        self.__currentPath = Path(__file__).parent.absolute()
        self.__list = self.__readTasks()

        todoList = self.__list
        for list in todoList:
            if (list['topic'] == topic):
                return None

        todoList.append({
            "_id": self._id,
            "topic": topic,
            "tasks": []
        })
        self.__writeTasks(todoList)

    # To-do list private methods or behaviours
    def __readTasks(self):
        with open(self.__currentPath/'data'/'tasks.json') as file:
            return json.load(file)

    def __writeTasks(self, data):
        with open(self.__currentPath/'data'/'tasks.json', 'w') as file:
            json.dump(data, file, indent=4, separators=(',', ': '))  

    def getTasks(self):
        return (item for item in self.__list if item['topic'] == self._topic).__next__()['tasks']

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

        return tasks

    def deleteTask(self, taskId):
        tasks = self.getTasks()

        for i in range(len(tasks)):
            if (tasks[i]['_id'] == taskId):
                del tasks[i]
                break

        self.__writeTasks(self.__list)

    def updateTask(self, taskId, newTaskData):
        task = self.getTask(taskId)

        for key in [*task]:
            if (key in newTaskData):
                task[key] = newTaskData[key]

        self.__writeTasks(self.__list)
        
if __name__ == '__main__':
    todoList = TodoList('Shopping')
    # print(todoList.getTasks())
    # print(todoList.getTask('71b865847cc14605aaf387c3dfdfe751'))
    # print(todoList.createTask('Buy cola', 'Tomorrow'))
    # print(todoList.deleteTask('71b865847cc14605aaf387c3dfdfe751'))
    print(todoList.updateTask('1348568f522b4c3ba5e237097e8358a9', { "name": "Buy pepsi","deadline": "Tomorrow" }))