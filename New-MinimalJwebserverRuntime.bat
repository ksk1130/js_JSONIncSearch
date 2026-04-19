@echo off
setlocal

set "JDK_HOME=%~1"
if "%JDK_HOME%"=="" set "JDK_HOME=%JAVA_HOME%"

set "OUTPUT_DIR=%~2"
if "%OUTPUT_DIR%"=="" set "OUTPUT_DIR=min-jre"

if "%JDK_HOME%"=="" (
  echo [ERROR] JDK_HOME or JAVA_HOME is required.
  exit /b 1
)

if not exist "%JDK_HOME%\jmods" (
  echo [ERROR] jmods not found: %JDK_HOME%\jmods
  exit /b 1
)

if exist "%OUTPUT_DIR%" (
  echo [ERROR] Output already exists: %OUTPUT_DIR%
  exit /b 1
)

set "DEPS="
for /f "delims=" %%i in ('jdeps --module-path "%JDK_HOME%\jmods" --print-module-deps --module jdk.httpserver') do set "DEPS=%%i"

if "%DEPS%"=="" (
  echo [ERROR] Failed to resolve module deps with jdeps.
  exit /b 1
)

set "MODULES=%DEPS%,jdk.httpserver"
echo Required modules: %MODULES%

jlink ^
  --module-path "%JDK_HOME%\jmods" ^
  --add-modules "%MODULES%" ^
  --launcher jwebserver=jdk.httpserver/sun.net.httpserver.simpleserver.Main ^
  --strip-debug ^
  --no-header-files ^
  --no-man-pages ^
  --compress=zip-6 ^
  --output "%OUTPUT_DIR%"

if errorlevel 1 (
  echo [ERROR] jlink failed.
  exit /b 1
)

echo Created custom runtime: %OUTPUT_DIR%
echo Example: %OUTPUT_DIR%\bin\jwebserver --port 8000 --directory "C:\path\to\site"

exit /b 0
