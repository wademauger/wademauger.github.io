import socket
import time
import _thread
from machine import Pin
import network
import config #defines secrets on the device
import uwebsockets.server  # Import the MicroPython WebSocket library

# WiFi credentials
WIFI_SSID = config.WIFI_SSID
WIFI_PASSWORD = config.WIFI_PASSWORD

# Set up the GPIO pins for the sensors
left_sensor = Pin(15, Pin.IN)  # Left sensor, assuming active low (0 is triggered)
right_sensor = Pin(11, Pin.IN)  # Right sensor, assuming active low (0 is triggered)

# Define states
IDLE = 0
LEFT_TRIGGERED = 1
RIGHT_TRIGGERED = 2

# Initialize state variables
current_state = IDLE
first_triggered_sensor = None  # Will track which sensor was triggered first

# WebSocket setup
SERVER_PORT = 8080
clients = set()  # Use a set for connected clients

# Function to connect to WiFi
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)
    
    # Wait for connection
    max_wait = 10
    while max_wait > 0:
        if wlan.status() < 0 or wlan.status() >= 3:
            break
        max_wait -= 1
        print('waiting for connection...')
        time.sleep(1)
        
    # Handle connection error
    if wlan.status() != 3:
        raise RuntimeError('network connection failed')
    else:
        print('connected')
        status = wlan.ifconfig()
        print( 'ip = ' + status[0] )
    return wlan

def check_sensors():
    global current_state, first_triggered_sensor
    
    if current_state == IDLE:
        # In IDLE state, wait for any sensor to be triggered
        if left_sensor.value() == 0:  # Left sensor triggered
            current_state = LEFT_TRIGGERED
            first_triggered_sensor = "left"
        elif right_sensor.value() == 0:  # Right sensor triggered
            current_state = RIGHT_TRIGGERED
            first_triggered_sensor = "right"
    elif current_state == LEFT_TRIGGERED:
        # Left sensor was triggered first, now waiting for right sensor
        if right_sensor.value() == 0:  # Right sensor triggered
            print("Moved right!")
            broadcast("Moved right!")
            current_state = IDLE  # Reset to idle state for the next cycle
            first_triggered_sensor = None  # Reset sensor tracking
    elif current_state == RIGHT_TRIGGERED:
        # Right sensor was triggered first, now waiting for left sensor
        if left_sensor.value() == 0:  # Left sensor triggered
            print("Moved left!")
            broadcast("Moved left!")
            current_state = IDLE  # Reset to idle state for the next cycle
            first_triggered_sensor = None  # Reset sensor tracking

def broadcast(message):
    for client in clients:
        try:
            client.send(message)  # Send bytes directly
        except OSError as e:
            print("Error sending to client:", e)
            clients.remove(client)  # Remove disconnected client

def handle_client(ws):
    print('Client connected')
    clients.add(ws)
    try:
        while True:
            message = ws.receive()
            if message is None:
                break  # Client disconnected
            print('Received from client:', message)
            # ws.send(message) # Echo back the message
    except OSError as e:
        print("Client disconnected:", e)
    finally:
        clients.remove(ws)
        print('Client disconnected')

def start_server():
    print('WebSocket server started on port', SERVER_PORT)
    
    def run(host, port):
        s = socket.socket()
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind((host, port))
        s.listen(1)
        print("listening on ws://%s:%s" % (host, port))

        while True:
            conn, addr = s.accept()
            print("Client address:", addr)
            ws = uwebsockets.server.WebSocket(conn)
            try:
                handle_client(ws)
            finally:
                ws.close()

    try:
        _thread.start_new_thread(run, ('0.0.0.0', SERVER_PORT))
    except OSError as e:
        print("Socket error:", e)

# Connect to WiFi
try:
    wlan = connect_wifi()
except RuntimeError as e:
    print(e)
    while True:
        pass # Do nothing, just halt

# Start the server in a separate thread
start_server()

while True:
    check_sensors()  # Keep checking the sensors
    time.sleep(0.1)  # Polling delay to avoid continuous loop without pause
