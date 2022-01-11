import eel

eel.init('client')

@eel.expose
def logTasks():
    return 'Welcome2222'

eel.start('index.html')