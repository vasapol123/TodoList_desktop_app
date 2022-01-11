import eel

eel.init('client')

@eel.expose
def printText():
    return 'Welcome'

eel.start('index.html')