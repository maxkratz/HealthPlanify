#!/usr/bin/env bash

# Nombre de la sesión
SESSION="dev"

# Comprueba si la sesión ya existe y la mata para reiniciar todo limpio
tmux has-session -t $SESSION 2>/dev/null
if [ $? -eq 0 ]; then
  tmux kill-session -t $SESSION
fi

# Crea una nueva sesión en segundo plano, en la ruta mock-server
tmux new-session -d -s $SESSION -c "#{PWD}/mock-server"

# Envía el comando npm start al primer panel
tmux send-keys -t $SESSION "npm start" C-m

# Divide la ventana horizontalmente y sitúa el nuevo panel en frontend
tmux split-window -h -t $SESSION:0 -c "#{PWD}/frontend"

# Envía el comando npm run dev al segundo panel
tmux send-keys -t $SESSION:0.1 "npm run dev" C-m

# Opcional: ajusta el tamaño de los paneles (ajusta el porcentaje si quieres otro reparto)
tmux select-pane -t $SESSION:0.0
tmux resize-pane -R 20

# Adjunta la sesión para verla en tu terminal
tmux attach -t $SESSION
