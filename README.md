# Hello
Set Up (on Windows):
1. Make sure Node is installed + latest version:
>> winget upgrade -q NodeJS
2. Make sure npm is installed + latest version:
>> npm install -g npm
3. Install relevant packages to project:
>> npm install

Run:
1. Connect and power the RFID reader
2. Connect Universal Reader Assistant
3. Select region + antenna
4. Under data extensions select stream to TCP Port 9055
5. Start reading
6. Run the Electron app:
>> npm run build
>> npm run electron