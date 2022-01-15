from Task import Task
from ListHandler import ListHandler
from DataHandler import DataHandler

class TaskHandler:
    def __init__(self, id):
        self.__dataHandler = DataHandler()
        self.__lists = self.__dataHandler.readTasks()
        self.__list = ListHandler().getList(id)
        self.__tasks = (item for item in self.__lists if item['_topic'] == self.__list['_topic']).__next__()['_List__tasks']

    def getTasks(self):
        return self.__tasks

    def getTask(self, taskId):
        for task in self.getTasks():
            if (task['_id'] == taskId):
                return task

        raise Exception('Task not found!')

    def createTask(self, name, description, deadline):
        task = Task(name, description, deadline)     
        tasks = self.getTasks()
          
        # checks whether name is exist in the to-do list
        for i in range(len(tasks)):
            if (tasks[i]['_name'] == name):
                raise Exception('Name is exist!')

        newTask = task.__dict__
        tasks.append(newTask)

        self.__dataHandler.writeTasks(self.__lists)
        return newTask

    def deleteTask(self, taskId):
        tasks = self.getTasks()
        task = self.getTask(taskId)

        for i in range(len(tasks)):
            if (tasks[i]['_id'] == taskId):
                del tasks[i]
                break

        self.__dataHandler.writeTasks(self.__lists)
        return task

    def updateTask(self, taskId, newData):
        task = self.getTask(taskId)

        valueChangeCount = 0
        for key in [*task]:
            if (key in newData):
                if (task[key] == newData[key]):
                    continue

                valueChangeCount += 1
                task[key] = newData[key]

        if (valueChangeCount == 0):
            raise Exception('All inputs are the same as previous!')

        self.__dataHandler.writeTasks(self.__lists)
        return task

if __name__ == '__main__':
    test = TaskHandler('2f2f6c03de704f64ba0c2e253a96c356')
    print(test.getTasks())
    # print(test.deleteTask('95cb2e052e9f4df4a9c2e76962d6c7ac'))
    # print(test.createTask('Buy pepsi', 'Today'))
    print(test.updateTask('4a4a6f8ba3e94ff2af9c09ad06441890', { "_name": "Buy pepsi","_deadline": "Tomorrow" }))

