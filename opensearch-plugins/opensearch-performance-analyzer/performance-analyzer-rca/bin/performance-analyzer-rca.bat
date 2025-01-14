@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem

@if "%DEBUG%" == "" @echo off
@rem ##########################################################################
@rem
@rem  performance-analyzer-rca startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%..

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here. You can also use JAVA_OPTS and PERFORMANCE_ANALYZER_RCA_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS="-Xms64M" "-Xmx64M" "-XX:+UseSerialGC" "-XX:CICompilerCount=1" "-XX:-TieredCompilation" "-XX:InitialCodeCacheSize=4096" "-XX:InitialBootClassLoaderMetaspaceSize=30720" "-XX:MaxRAM=400m"

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto execute

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:execute
@rem Setup the command line

set CLASSPATH=%APP_HOME%\lib\performance-analyzer-rca-1.0.1.0.jar;%APP_HOME%\lib\jooq-3.10.8.jar;%APP_HOME%\lib\bcpkix-jdk15on-1.68.jar;%APP_HOME%\lib\bcprov-jdk15on-1.68.jar;%APP_HOME%\lib\sqlite-jdbc-3.32.3.2.jar;%APP_HOME%\lib\grpc-protobuf-1.28.0.jar;%APP_HOME%\lib\grpc-stub-1.28.0.jar;%APP_HOME%\lib\grpc-netty-shaded-1.28.0.jar;%APP_HOME%\lib\grpc-core-1.28.0.jar;%APP_HOME%\lib\grpc-protobuf-lite-1.28.0.jar;%APP_HOME%\lib\grpc-api-1.28.0.jar;%APP_HOME%\lib\guava-28.2-jre.jar;%APP_HOME%\lib\jackson-databind-2.11.4.jar;%APP_HOME%\lib\jackson-annotations-2.11.4.jar;%APP_HOME%\lib\log4j-core-2.13.0.jar;%APP_HOME%\lib\log4j-api-2.13.0.jar;%APP_HOME%\lib\commons-lang3-3.9.jar;%APP_HOME%\lib\commons-io-2.3.jar;%APP_HOME%\lib\javax.annotation-api-1.3.2.jar;%APP_HOME%\lib\failureaccess-1.0.1.jar;%APP_HOME%\lib\listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;%APP_HOME%\lib\perfmark-api-0.19.0.jar;%APP_HOME%\lib\jsr305-3.0.2.jar;%APP_HOME%\lib\checker-qual-2.10.0.jar;%APP_HOME%\lib\error_prone_annotations-2.3.4.jar;%APP_HOME%\lib\j2objc-annotations-1.3.jar;%APP_HOME%\lib\jackson-core-2.11.4.jar;%APP_HOME%\lib\protobuf-java-3.11.0.jar;%APP_HOME%\lib\proto-google-common-protos-1.17.0.jar;%APP_HOME%\lib\gson-2.8.6.jar;%APP_HOME%\lib\annotations-4.1.1.4.jar;%APP_HOME%\lib\grpc-context-1.28.0.jar;%APP_HOME%\lib\animal-sniffer-annotations-1.18.jar


@rem Execute performance-analyzer-rca
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %PERFORMANCE_ANALYZER_RCA_OPTS%  -classpath "%CLASSPATH%" org.opensearch.performanceanalyzer.PerformanceAnalyzerApp %*

:end
@rem End local scope for the variables with windows NT shell
if "%ERRORLEVEL%"=="0" goto mainEnd

:fail
rem Set variable PERFORMANCE_ANALYZER_RCA_EXIT_CONSOLE if you need the _script_ return code instead of
rem the _cmd.exe /c_ return code!
if  not "" == "%PERFORMANCE_ANALYZER_RCA_EXIT_CONSOLE%" exit 1
exit /b 1

:mainEnd
if "%OS%"=="Windows_NT" endlocal

:omega
