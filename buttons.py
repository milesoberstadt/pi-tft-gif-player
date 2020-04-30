from gpiozero import Button
from time import sleep
import os

leftMostButton = Button(23)
leftButton = Button(22)
rightButton = Button(21)
rightMostButton = Button(18)

while True:
    if leftMostButton.is_pressed:
        print('yo')
        os.system('sudo shutdown -h now')
        break
