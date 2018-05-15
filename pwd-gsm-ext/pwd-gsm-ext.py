import logging, sys, json

psafe_logger = logging.basicConfig()
logging.disable(sys.maxint)

from pypwsafe import *
from uuid import uuid4

class PWSafe3DataWrapper:
	uuid = None
	title = None
	username = None
	password = None
	url = None
	
	def __init__(self,uuid,title,username,password,url):
		self.uuid = uuid
		self.title = title
		self.username = username
		self.password = password
		self.url = url

try:
	if not ispsafe3(sys.argv[1]):
		raise
	obj = PWSafe3(filename = sys.argv[1], password = sys.argv[2])
	if sys.argv[3] == "insert":
		newRecord = Record()
		newRecord.setUUID(uuid4())
		newRecord.setTitle(sys.argv[4])
		newRecord.setUsername(sys.argv[5])
		newRecord.setPassword(sys.argv[6])
		newRecord.setGroup(["pwd-gsm"])
		newRecord.setURL(sys.argv[7])

		obj.records.append(newRecord)

		obj.autoUpdateHeaders()

		obj.save()
		print "OK:" + str(obj.getUUID())

	elif sys.argv[3] == "listall":
		resultList = []
		'''
		for listObjForPWSafe3 in obj.listall():
			objectWrapper = PWSafe3DataWrapper(str(listObjForPWSafe3[0]), listObjForPWSafe3[1], listObjForPWSafe3[3], listObjForPWSafe3[4], listObjForPWSafe3[5])
			resultList.append(objectWrapper.__dict__)
		'''
		for listObj in obj.getEntries():
			objectWrapper = PWSafe3DataWrapper(str(listObj.getUUID()),listObj.getTitle(), listObj.getUsername(), listObj.getPassword(), listObj.getURL())
			resultList.append(objectWrapper.__dict__)
		print json.dumps(resultList)
		
except Exception, e:
	print "FAIL:" + str(e)





