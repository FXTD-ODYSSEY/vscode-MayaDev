/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import * as mel_data from './data/mel.json';
import * as cmds_data from './data/cmds.json';
import * as OpenMaya_1_data from './data/OpenMaya1.0.json';


export class TimeUtils {
	public static getTime(): String {
		return new Date()
			.toISOString()
			.replace(/T/, ' ')
			.replace(/\..+/, '')
			.split(' ')[1];
	}
}

// NOTE Logger 信息输出
export class Logger {
	private static _outputPanel: vscode.OutputChannel;

	public static registerOutputPanel(outputPanel: vscode.OutputChannel) {
		this._outputPanel = outputPanel;
	}

	public static info(log: string) {
		this.typeLog(log, 'INFO');
	}

	public static error(log: string) {
		this.typeLog(log, 'ERROR');
		vscode.window.showErrorMessage(log);
	}

	public static success(log: String) {
		this.typeLog(log, 'SUCCESS');
	}

	public static response(log: String) {
		this.typeLog(log, 'RESPONSE');
	}

	private static typeLog(log: String, type: String) {
		if (!this._outputPanel) {
			return;
		}
		let util = require('util');
		let time = TimeUtils.getTime();
		if (!log || !log.split) return;
		this._outputPanel.appendLine(util.format('Maya Dev [%s][%s]\t %s', time, type, log));
	}
}

export function activate(context: vscode.ExtensionContext) {

	let outputPanel = vscode.window.createOutputChannel('Maya Dev');
	Logger.registerOutputPanel(outputPanel);

	// NOTE Python Extension API 测试
	// let pythonExt = vscode.extensions.getExtension('ms-python.python');
	// let api = pythonExt.exports;

	// Logger.info(`pythonExt: ${Object.keys(pythonExt)}`);
	// Logger.info(`pythonExt.id: ${pythonExt.id}`);
	// Logger.info(`pythonExt.extensionPath: ${pythonExt.extensionPath}`);
	// Logger.info(`api: ${Object.keys(api)}`);
	// api.ready.then(values => {
	// 	Logger.info(`=====================================`);
	// 	Logger.info(`==========extension ready============`);
	// 	Logger.info(`=====================================`);
	// 	Logger.info(`values : ${typeof values}`);
	// 	Logger.info(`values : ${Object.keys(values)}`); 
	// 	Logger.info(`values.length : ${Object.keys(values).length}`); 
	// 	for (const key in values) {
	// 		Logger.info(`key : ${key}`); 
	// 		Logger.info(`typeof : ${typeof key}`); 
	// 		Logger.info(`hasOwnProperty : ${values.hasOwnProperty(key)}`); 
	// 	}
	// 	Logger.info(`=====================================`); 
	// 	Logger.info(`=====================================`); 
	// 	Logger.info(`=====================================`); 
	// 	let pythonConfig = vscode.workspace.getConfiguration("python")
	// 	let pythonPath = pythonConfig.get("pythonPath")
	// 	Logger.info(`pythonConfig : ${pythonConfig}`); 
	// 	Logger.info(`pythonConfig keys : ${Object.keys(pythonConfig)}`); 
	// 	for (const key in pythonConfig) {
	// 		Logger.info(`key : ${key}`);
	// 		Logger.info(`typeof : ${typeof key}`);
	// 		Logger.info(`hasOwnProperty : ${values.hasOwnProperty(key)}`);
	// 	}
	// 	Logger.info(`pythonPath : ${pythonPath}`); 
	// })


	// NOTE 初始化插件的时候 


	// // NOTE 获取 MEL 数据存放到数组当中
	// let mel_completions: Array<vscode.CompletionItem> = [];
	// mel_data.forEach(this_item => {
	// 	let item = new vscode.CompletionItem(this_item['trigger'], vscode.CompletionItemKind.Function);
	// 	item.detail = this_item['trigger'];
	// 	item.documentation = this_item['comment'];
	// 	mel_completions.push(item);
	// });

	// NOTE 获取 cmds 数据存放到数组当中
	let cmds_completions: Array<vscode.CompletionItem> = [];
	for (let command in cmds_data) {
		let item = new vscode.CompletionItem(command, vscode.CompletionItemKind.Function);
		item.detail = command;

		// doc = cmds[command]['instruction'];
		const instruction = new vscode.MarkdownString(cmds_data[command]['instruction']);
		instruction.isTrusted = true;
		item.documentation = instruction;
		cmds_completions.push(item);
	}

	let OpenMaya_1_completions = {};
	for (let Module in OpenMaya_1_data) {
		let Class_completions = [];
		for (let Class in OpenMaya_1_data[Module]) {
			let item = new vscode.CompletionItem(Class, vscode.CompletionItemKind.Class);
			item.detail = OpenMaya_1_data[Module][Class]["instruction"];
			Class_completions.push(item)
		}
		OpenMaya_1_completions[Module] = Class_completions
	}



	function getImportName(documentText: string, pacakge: string) {
		let cmds = pacakge;

		// NOTE 如果没有 导入相关的包 则 关闭自动补全
		if (documentText.search(new RegExp(`from maya import ${pacakge}`, "i")) == -1 &&
			documentText.search(new RegExp(`import maya.${pacakge}`, "i")) == -1)
			return undefined;

		// NOTE 匹配别名的情况
		let match = documentText.match(new RegExp(`import maya.${pacakge} as (.*)`, "i"));
		if (match != null && match.length >= 2 && match[1] != "") {
			cmds = match[1].trim();
		} else {
			match = documentText.match(new RegExp(`from maya import ${pacakge} as (.*)`, "i"));
			if (match != null && match.length >= 2 && match[1] != "")
				cmds = match[1].trim();
		}

		return cmds;
	}

	// NOTE cmds 函数名快速显示
	const func_compeletion = vscode.languages.registerCompletionItemProvider(
		'python',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				// NOTE `document.lineAt(position).text`  获取当前光标所在行的文本 并且切掉光标之后的内容
				let linePrefix = document.lineAt(position).text.substr(0, position.character);

				// ! -------------------------------
				// !           cmds 提示
				// ! -------------------------------
				let cmds = getImportName(document.getText(), "cmds");

				if (linePrefix.endsWith(cmds + '.'))
					return [...cmds_completions];

				// ! -------------------------------
				// !        OpenMaya 1.0 提示
				// ! -------------------------------

				for (let Module in OpenMaya_1_data) {
					let OpenMaya = getImportName(document.getText(), Module);

					if (linePrefix.endsWith(OpenMaya + '.')) {
						return [...OpenMaya_1_completions[Module]];
					}

					// // Note 匹配获取当前函数的名称
					// let regx = new RegExp(`${OpenMaya}\.(.*)\.`, "i");
					// let match = linePrefix.match(regx);
					// if (match == null) return undefined;
					// // Note 获取数组中最后一个符合条件的对象
					// let Class = match[match.length - 1];
					// if (Class in OpenMaya_1_completions){
					// 	return [...OpenMaya_1_completions[Class]];
					// }
				}

				return undefined;
			}
		},
		'.' // NOTE triggered whenever a '.' is being typed
	);

	// NOTE cmds 命令行的参数快速显示
	const args_compeletion = vscode.languages.registerCompletionItemProvider(
		'python',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				let cmds_args: Array<vscode.CompletionItem> = [];
				let cmds = getImportName(document.getText(), "cmds");


				// NOTE `document.lineAt(position).text`  获取当前光标所在行的文本
				let linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (linePrefix.search(/\(/i) != -1){

					// Note 匹配获取当前函数的名称
					let regx = new RegExp(`${cmds}\.(.*)\s*\(`, "i");
					let match = linePrefix.match(regx);
					if (match == null) return undefined;
					// Note 获取数组中最后一个符合条件的对象
					let func = match[match.length - 1];
	
					// Note 根据匹配的函数获取参数
					cmds_data[func]['param'].forEach(this_item => {
						let item = new vscode.CompletionItem(`${this_item['shortName']}=`, vscode.CompletionItemKind.TypeParameter);
						item.detail = `${this_item['longName']} [${this_item['type']}]`;
						item.documentation = this_item['instruction'];
						cmds_args.push(item);
						item = new vscode.CompletionItem(`${this_item['longName']}=`, vscode.CompletionItemKind.TypeParameter);
						item.detail = `${this_item['longName']} [${this_item['type']}]`;
						item.documentation = this_item['instruction'];
						cmds_args.push(item);
					});
	
					// NOTE 添加 query 和 edit 模式
					for (let index in cmds_data[func]['mode']) {
						let mode = cmds_data[func]['mode'][index];
						if (mode == "query") {
							let item = new vscode.CompletionItem(`query=1`, vscode.CompletionItemKind.TypeParameter);
							item.detail = `query [boolean]`;
							item.documentation = `enable query mode`;
							cmds_args.push(item);
							item = new vscode.CompletionItem(`q=1`, vscode.CompletionItemKind.TypeParameter);
							item.detail = `query [boolean]`;
							item.documentation = `enable query mode`;
							cmds_args.push(item);
						} else if (mode == "edit") {
							let item = new vscode.CompletionItem(`edit=1`, vscode.CompletionItemKind.TypeParameter);
							item.detail = `edit [boolean]`;
							item.documentation = `enable edit mode`;
							cmds_args.push(item);
							item = new vscode.CompletionItem(`e=1`, vscode.CompletionItemKind.TypeParameter);
							item.detail = `edit [boolean]`;
							item.documentation = `enable edit mode`;
							cmds_args.push(item);
						}
					}
					return [...cmds_args];
				}


				return undefined;
			}
		},
		'(', ','
	);

	// Logger.info(`data: ${data}`);
	context.subscriptions.push(
		func_compeletion,
		args_compeletion,
	);
}
