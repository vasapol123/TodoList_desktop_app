import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from classes.features.ImportExport import ImportExport


if __name__ == '__main__':
    test = ImportExport()
    print(test.importListData('df90417be06a57d2a25594e524301f6a'))