    #!/bin/bash
    while true; do
      screen -list | grep my-server-session
      if [ $? -ne 0 ]; then
        echo "Server died, restarting..."
        screen -dmS my-server-session npm start
      fi
      sleep 5
    done
