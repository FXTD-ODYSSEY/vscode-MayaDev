
<h1 align="center">
VS Code Extension for Autodesk Maya Developer
</h1>

## MayaDev Feature

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

[MayaDoc](https://github.com/FXTD-ODYSSEY/MayaDoc) 
this repo is how I extract the data from the Maya document

- [x] maya.cmds 
- [x] OpenMaya 1.0
- [ ] OpenMaya 2.0
- [x] pymel 
- [ ] maya.mel
- [x] pyside
- [ ]  ~~Qt.py~~

---

- [ ]  ~~MEL file support~~

### debug feature

- [ ] integrate python `ptvsd` debug module
- [ ] auto setup launch.json for Debugging
- [ ] find out is it possible to create a MEL langauge debugger

### extension feature

- [ ] send code to the maya commandPort
- [ ] depend on the Python Extension for ptvsd debug
- [ ] use the tree-sitter module to anaylize the python Syntax Tree 
- [ ] add configuration for intellisense detail level

## Q&A
### Why rebuild the intellisense for maya python module ?

> Actually , `Python Extension` is very powerful extension for python.  
> it has a powerful feature to build up the autocompletion for any python module.  
> if you want to activate it , just add the module path to the extension configuration `python.autoComplete.extraPaths`  
 
> However , maya module is too large , for example , `cmds` module contain thousands of avaialble command , every time when you use python autoComplete feature, you have to wait for a couple seconds , That is extremely painful experience for developer.  
> And I find some issue already post in the github , but without any better solution. [issue](https://github.com/davidhalter/jedi/issues/843)   
> so I start to think what make the intellisense slow , and then I figure out that the autocompletion list must update every time we trigger the suggesttion.   
> That idea is totally fine in `Python Extension` , because the related module may change or add some new function for multiple purpose.  
> But for maya module that could be a huge performance problem , and the maya module is already a blackbox API , why not just save the data into memory and every time we trigger the suggestion just get data from memory directly.   
> That's why I rebuild the maya module intellisense for better develope experience ,  
> you could check the data I extract from maya document in that [repository](https://github.com/FXTD-ODYSSEY/MayaDoc)
> the `mayaDev` extension will get the data from json when you activate it.
> And then I use the tree-sitter module to parse the source code , then I will get the perfect python Syntax Tree to anaylize the corresponding module data using typescript.
> you could check the awesome tree-sitter module fearture [here](https://tree-sitter.github.io/tree-sitter/playground)