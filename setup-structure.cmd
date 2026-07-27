mkdir client\public
mkdir client\src\api
mkdir client\src\components
mkdir client\src\context
mkdir client\src\pages\auth
mkdir client\src\pages\directory
mkdir client\src\pages\founder
mkdir client\src\pages\investor
mkdir client\src\pages\admin
mkdir client\src\routes
mkdir client\src\hooks

type nul > client\src\App.jsx
type nul > client\src\main.jsx
type nul > client\tailwind.config.js
type nul > client\vite.config.js
type nul > client\package.json

mkdir server\src\config
mkdir server\src\models
mkdir server\src\controllers
mkdir server\src\routes
mkdir server\src\middleware
mkdir server\src\services
mkdir server\src\utils
mkdir server\tests

type nul > server\src\app.js
type nul > server\server.js
type nul > server\package.json

mkdir docs
type nul > docs\api-spec.yaml
type nul > docs\er-diagram.png

type nul > .env.example
type nul > docker-compose.yml
type nul > .gitignore

echo Folder structure created.