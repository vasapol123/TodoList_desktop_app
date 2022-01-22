from distutils.log import error
import tkinter
import json
import os
from tkinter import filedialog

from ..TaskHandler import TaskHandler
from ..UserHandler import UserHandler
from ..ListHandler import ListHandler

class ImportExport:
    def __searchForPath(self):
        root = tkinter.Tk()
        root.attributes("-topmost", True)
        root.withdraw()

        currdir = os.getcwd()
        tempDir = filedialog.askdirectory(
            parent=root, 
            initialdir=currdir, 
            title='Please select a directory'
        )

        return tempDir

    def __searchForFile(self):
        root = tkinter.Tk()
        root.attributes("-topmost", True)
        root.withdraw()

        currdir = os.getcwd()
        filePath = filedialog.askopenfilename(
            initialdir=currdir,
            title='Please select a json file',
            filetypes=[('json', '.json')]
        )
        return filePath

    def exportListData(self, data, fileName):
        path = self.__searchForPath()

        with open(os.path.join(path, f'{fileName}.json'), 'w') as file:
            json.dump(data, file, indent=4, separators=(',', ': '))

    def importListData(self, userId):
        filePath = self.__searchForFile()
        userHandler = UserHandler()
        users = userHandler.getUsers()
        user = userHandler.getUser(userId)

        listHandler = ListHandler()

        with open(filePath) as file:
            importedLists = json.load(file)

        try:
            for importedlist in importedLists:
                newList = listHandler.createList(importedlist['_topic'], importedlist['_description'])
                user['_User__createdLists'].append({ '_List__id': newList['_id'] })

                taskHandler = TaskHandler(newList['_id'])
                for task in importedlist['_List__tasks'] :
                    newTask = taskHandler.createTask(task['_name'], task['_deadline'])
                    taskHandler.updateTask(newTask['_id'], { "_completed": task['_completed'], "_overdue": task['_overdue'] })


            for _user, i in zip(users, range(len(users))):
                if (_user['_User__id'] == userId):
                    users[i] = user
                    print(user)
        except:
            raise Exception('Invalid json file')

        fileName = filePath.split('/')[-1]
        path = filePath.replace(fileName, '')

        with open(path + 'users.json', 'w') as file:
            json.dump(users, file, indent=4, separators=(',', ': '))

if __name__ == '__main__':
    export = ImportExport()
    print(export.importListData('5a099da736855057911986434870b1ac'))