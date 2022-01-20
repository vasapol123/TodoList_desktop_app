from List import List
from DataHandler import DataHandler

class ListHandler:
    def __init__(self):
        self.__dataHandler = DataHandler()
        self.__lists = self.__dataHandler.readTasks()

    def getTopics(self):
        topics = map(lambda list: list['topic']  ,self.__lists)
        return list(topics)

    def getLists(self):
        return self.__lists

    def getList(self, listId):
        for list in self.getLists():
            if (list['_id'] == listId):
                return list

        raise Exception('Task not found!')

    def createList(self, topic, description):
        lists = self.getLists()
        _list = List(topic, description)

        # for list in lists:
        #     if (list['_topic'] == topic):
        #         raise Exception('Topic is Exist!')

        if (not topic):
            raise Exception('Invalid topic')

        newList = _list.__dict__
        lists.append(newList)

        self.__dataHandler.writeTasks(self.__lists)
        return newList
    
    def deleteList(self, listId):
        lists = self.getLists()
        list = self.getList(listId)

        for i in range(len(lists)):
            if (lists[i]['_id'] == listId):
                del lists[i]
                break
        
        self.__dataHandler.writeTasks(self.__lists)
        return list

    def updateList(self, listId, newData):
        lists = self.getLists()
        list = self.getList(listId)

        for key in [*list]:
            if (key in newData):
                list[key] = newData[key]

        self.__dataHandler.writeTasks(self.__lists)
        return list

if __name__ == '__main__':
    test = ListHandler()
    print(test.createList('Homework'))
    # print(test.updateList("01ee142ad7074f8e9afaf2431c48bb63", { "topic": "Homework" }))
    # print(test.deleteList('01ee142ad7074f8e9afaf2431c48bb63'))