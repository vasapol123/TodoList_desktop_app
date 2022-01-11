import eel

eel.init('client')

@eel.expose
def logTasks():
    return 'Welcome'

eel.start('index.html')