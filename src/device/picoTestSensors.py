import time
import board
import digitalio

# Setup hall effect sensors
left_sensor = digitalio.DigitalInOut(board.GP15)
left_sensor.direction = digitalio.Direction.INPUT
left_sensor.pull = digitalio.Pull.UP

right_sensor = digitalio.DigitalInOut(board.GP11)
right_sensor.direction = digitalio.Direction.INPUT
right_sensor.pull = digitalio.Pull.UP

# Debounce state and timers
left_debounce_timer = 0
right_debounce_timer = 0
debounce_duration = 5  # seconds
poll_interval = 1 / 20  # 20 times per second

def debounce(sensor, last_state, timer):
    current_state = not sensor.value  # Active low
    if current_state != last_state:
        timer = time.monotonic() + debounce_duration
    elif time.monotonic() > timer:
        return current_state, timer
    return last_state, timer

left_last_state = False
right_last_state = False

print("Starting sensor monitoring...")

while True:
    # Debounce left sensor
    left_last_state, left_debounce_timer = debounce(left_sensor, left_last_state, left_debounce_timer)
    if left_last_state:
        print("Left sensor triggered!")

    # Debounce right sensor
    right_last_state, right_debounce_timer = debounce(right_sensor, right_last_state, right_debounce_timer)
    if right_last_state:
        print("Right sensor triggered!")

    time.sleep(poll_interval)