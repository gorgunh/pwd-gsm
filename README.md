# pwd-gsm
Pale Moon Add-on For Password Generate - Storage - Manage with connected PasswordSafe application's psafe3 database.
## Requirements
 - python2.7
 - python-pip
 - hashlib
 - libmcrypt-dev
 - python-mcrypt-1.1
**Note:** This add-on can run all PC platforms for Pale Moon. But PasswordSafe integration is required for Linux distributions.

## Project Installation

 - If *pip* is not installed than run the command bellow:
> `sudo apt-get install python-pip`
 - Install *hashlib* library for Python.
> `pip install hashlib`

**Note:** If you have trouble while installing hashlib library, please try to remove Linux hashlib library with following command then run the installation command again:
> `sudo rm /usr/lib/python2.7/lib_dynload/_hashlib`
 - Install *libmcrypt-dev* package from Linux mirrors with following command:
> `sudo apt-get install libmcrypt-dev`
 - Install *python-mcrypt-1.1* library with using pip command:
> `pip install http://labix.org/download/python-mcrypt/python-mcrypt-1.1.tar.gz`
 - Finally *pypwsafe* egg file can be installed with *easy_install* module from in our project (under *dist* folder):
> `sudo easy_install python_pypwsafe-0.3-py2.7.egg`
 - After pypwsafe module installation, make a directory named *pwdgsm* into your home directory and  move the *[pwd-gsm-ext.py](https://github.com/gorgunh/pwd-gsm/blob/master/pwd-gsm-ext/pwd-gsm-ext.py)* which is into *dist* folder on our project into this directory *($HOME/pwdgsm)* .
 - Finally, on Pale Moon, go to `Tools > Add-ons` and click cogwheel button near to the *Search all add-ons textbox* and click the *Install Add-on From File...* button. Select the *@pwd-gsm.xpi* file from our project under the dist file and click *Open* button. That is it!
## TODO List
 - Password fields in HTML files are just visible for testing.
 - In List All Password section, Delete buttons have no functionality. It will be added soon.
 - Some Windows tests are not done. It should be completed.
