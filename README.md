
<h1 align="center">
VS Code Extension for Autodesk Maya Developer
</h1>

## MayaGem Feature

1. faster python intellisense for maya python module

![alt](.gif)

2. display lots of information without searching for document

![alt](.gif)

3. integrate the python debugger that allow you set the breakpoint to test the code

![alt](.gif)

4. send code to maya port

![alt](.gif)

5. customizable extension

![alt](.gif)

## todolist

### module intellisense feature

- [x] maya.cmds 
- [ ] OpenMaya 1.0
- [ ] OpenMaya 2.0
- [ ] pymel 
- [ ] maya.mel
- [ ] pyside
- [ ] pyside2
- [ ] Qt.py


- [ ] MEL file support

### debug feature

- [ ] integrate python `ptvsd` debug module
- [ ] auto setup launch.json for Debugging
- [ ] find out is it possible to create a MEL langauge debugger

### extension feature

- [ ] send code to the maya commandPort
- [ ] run file with send code command
- [ ] depend on the Python Extension
- [ ] get the module&variable information from Python Extension
- [ ] intellisense detail level

## Q&A
### Why rebuild the intellisense for maya module ?

> Actually,`Python Extension` is very power extension for editing python.  
> it has a power ability could build up autocoplete for the any python module.  
> if you want to activate it, just add the module path to setting `python.autoComplete.extraPaths`  

> However,maya module is too large for compile, cmds module has thousands a vaialble command,every time when I use VScode autoComplete feature, I have to wait for a couple seconds,That is very painful experience for developer.  
> so I start to think what make the intellisense slow,and then I figure out the list must generate every time I trigger the suggest.   
> That idea is totally fine in python extension,because the module may change or add some new function anyway.  
> But for maya module that cause a big performance problem,so I think that maya module is already a blackbox API,why not just save the data into memory and every time I trigger the suggest just get data from memory.   
> That's why I rebuild the maya module intellisense ,  
> you could check the data I extract from maya document in data repository
