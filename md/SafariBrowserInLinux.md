# How to test in safari browser from linux

Test can be done via online service called saucelabs.com.

Steps:

1. Register with saucelabs.com. Choose Open Sauce plan.
Open Sauce plan requires an open source repo (e.g. github). It is just an URL, no 
authorizations necessary.
2. Setup the sauce connect.
This creates a tunnel from your computer so that you can test a local web application.
(from https://docs.saucelabs.com/reference/sauce-connect/)
Just download Sauce Connect for Linux, unzip the file, run the command from documentation.
The command should be something like:

```bash
bin/sc -u yourusername -k YOUR-GENERATED-KEY
```

The command in documentation includes the generated key, if you are logged in.

3. Start new interactive session from saucelabs.com user interface.
4. Choose the platform and browser, fill the URL of your app (external name of your computer, something like https://hp-ubuntu1:3443) and start testing.
