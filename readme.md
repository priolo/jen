


### GITHB
[https://github.com/settings/applications/3174659]

cambiare i paramentri:  

`Homepage URL`
- "local"  
http://localhost:3000/app/
- "remote"  
https://<sito>/app/

`Authorization callback URL`  
- "local"  
http://localhost:3000/api/auth/github/callback  
- "remote"  
https://<sito>/api/auth/github/callback



## GOOGLE CLOUD

[https://console.cloud.google.com/auth/clients/545902107281-qgd4s1enct9mcq4qh3vpccn45uocdk9s.apps.googleusercontent.com?project=feature-fortune]  

su **Authorised JavaScript origins**  
inserire gli URL:  
da "local"  
http://localhost:5173  
da "render"  
https://feature-fortune.onrender.com  

su **Authorised redirect URIs**  
inserire gli URL:  
da "local"  
http://localhost:3000/api/auth/google/callback  
da "render"  
https://feature-fortune.onrender.com/api/auth/google/callback  

#### BE .env
`GOOGLE_CLIENT_ID=<Additional information / Client ID>`
`GOOGLE_CLIENT_SECRET=<Client secrets / Client secret>`

#### FE .env
`VITE_GOOGLE_OAUTH_CLIENT_ID=<Additional information / Client ID>`









## PM2

### istallazione
```bash
# Installa le dipendenze
npm install
# Installa PM2 (serve a tenere il sito sempre acceso anche se crasha)
npm install -g pm2
```

### avvio

```bash
# RICORDA DI PASSARE A SUDO!
sudo -i
# Avvia il server
pm2 start ecosystem.config.cjs
# (opzionale) Fai in modo che PM2 si riavvii se riavvii la VPS
pm2 startup
# (opzionale) (Copia ed esegui il comando che ti apparirà a schermo)
pm2 save
```

### comandi utili PM2

```bash
pm2 list               # lista processi
pm2 logs               # vedi log in tempo reale
pm2 stop <name|id>     # ferma processo
pm2 restart <name|id>  # riavvia processo
pm2 delete <name|id>   # elimina processo
```

### riavvio dopo aggiornamento da git
```bash
sudo -i
# eventualmente
# git reset --hard HEAD
git pull origin main

#cd client
#npm install
#npm run build

cd ../landingpage
npm install
npm run build

cd .. 
npm install
npm run build

pm2 restart puce
```
