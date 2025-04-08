from machine import Pin
import time

# Define the pins connected to the sensors
left_sensor_pin = 15
right_sensor_pin = 11

# Create Pin objects for the sensors
left_sensor = Pin(left_sensor_pin, Pin.IN)
right_sensor = Pin(right_sensor_pin, Pin.IN)

print("Starting sensor test. Press Ctrl+C to exit.")

left_count = 0
right_count = 0

try:
    while True:
        left_value = left_sensor.value()
        right_value = right_sensor.value()
        if left_value == 0:
            left_count += 1
            print("Left: ", left_count)
        if right_value == 0:
            right_count += 1
            print("\t\tRight: ", right_count)
        time.sleep(0.01)  # Polling interval (50ms)
except KeyboardInterrupt:
    print("Exiting.")