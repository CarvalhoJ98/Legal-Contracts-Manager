@echo off
echo Iniciando o Legal Contracts Manager...

:: Inicia o Backend em uma nova janela
start cmd /k "j: & cd \"projects\Legal Contracts Manager\backend\" & node server.js"

:: Inicia o Frontend em uma nova janela
start cmd /k "j: & cd \"projects\Legal Contracts Manager\frontend\" & npm run dev"

echo.
echo As duas janelas estao sendo abertas. 
echo Nao feche as janelas pretas enquanto estiver usando o sistema!
echo.
pause
