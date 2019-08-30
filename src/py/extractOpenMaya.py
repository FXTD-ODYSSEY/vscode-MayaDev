# coding:utf-8
from html2text import HTML2Text
import re
import json
import os
from maya import OpenMaya
from maya import OpenMayaAnim
from maya import OpenMayaFX
from maya import OpenMayaMPx
from maya import OpenMayaRender
from maya import OpenMayaUI

parser = HTML2Text()
parser.wrap_links = False
parser.skip_internal_links = True
parser.inline_links = True
parser.ignore_anchors = True
parser.ignore_images = True
parser.ignore_emphasis = True
parser.ignore_table = True

# ! ----------------------------------------

DIR = os.path.dirname(__file__)
WEB = os.path.join(r"D:\Users\Administrator\Desktop\MayaDoc\maya-2019-developer-help_enu_offline\cpp_ref","cpp_ref")
FOLDER = os.path.join(DIR,"cpp_ref")

html_set = set()
html_dict = {}
for i,html in enumerate(os.listdir(FOLDER)):
	path = os.path.join(FOLDER,html).replace("\\","/")
	with open(path,'r') as f:
		data = f.read()
	func = re.search(r"<h1>(.*?)</h1>",data).group(1).split(" ")[0]
	html_set.add(func)
	html_dict[func] = os.path.join(WEB,html).replace("\\","/")

OpenMaya_set = set()
OpenMaya_set.update( set(dir(OpenMaya))       )
OpenMaya_set.update( set(dir(OpenMayaAnim))   )
OpenMaya_set.update( set(dir(OpenMayaFX))     )
OpenMaya_set.update( set(dir(OpenMayaMPx))    )
OpenMaya_set.update( set(dir(OpenMayaRender)) )
OpenMaya_set.update( set(dir(OpenMayaUI))     )

func_set = html_set.intersection(OpenMaya_set)

# # NOTE 可以获取到所有 OpenMaya 不支持的页面
# for i,func in enumerate(html_set - func_set):
# 	print i,html_dict[func]
# 	os.remove(html_dict[func])

# # NOTE OpenMaya有但是在 HTML 上没有的
for i,func in enumerate(OpenMaya_set - func_set):
	if "_" not in func:
		print func
	if func == "MNamespace":
		if func in dir(OpenMaya):
			print "OpenMaya" 
		elif func in dir(OpenMayaAnim):
			print "OpenMayaAnim" 
		elif func in dir(OpenMayaFX):
			print "OpenMayaFX" 
		elif func in dir(OpenMayaMPx):
			print "OpenMayaMPx" 
		elif func in dir(OpenMayaRender):
			print "OpenMOpenMayaRenderayaAnim" 
		elif func in dir(OpenMayaUI):
			print "OpenMayaUI" 

# func_dict = {}
# func_dict["OpenMaya"] = []
# func_dict["OpenMayaAnim"] = []
# func_dict["OpenMayaFX"] = []
# func_dict["OpenMayaMPx"] = []
# func_dict["OpenMayaRender"] = []
# func_dict["OpenMayaUI"] = []
# for i,func in enumerate(func_set):
# 	# print i,func
# 	if func in dir(OpenMaya):
# 		func_dict["OpenMaya"].append(func)
# 	elif func in dir(OpenMayaAnim):
# 		func_dict["OpenMayaAnim"].append(func)
# 	elif func in dir(OpenMayaFX):
# 		func_dict["OpenMayaFX"].append(func)
# 	elif func in dir(OpenMayaMPx):
# 		func_dict["OpenMayaMPx"].append(func)
# 	elif func in dir(OpenMayaRender):
# 		func_dict["OpenMayaRender"].append(func)
# 	elif func in dir(OpenMayaUI):
# 		func_dict["OpenMayaUI"].append(func)

# json_path = os.path.join(DIR,"output.json")
# with open(json_path,'w') as f:
# 	json.dump(func_dict,f,indent=4)