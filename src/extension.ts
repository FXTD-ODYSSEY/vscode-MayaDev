/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import * as mel_data from './mel.json';
import * as cmds_data from './cmds.json';



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
		this._outputPanel.appendLine(util.format('Maya Intellisense [%s][%s]\t %s', time, type, log));
	}
}

export function activate(context: vscode.ExtensionContext) {

	let outputPanel = vscode.window.createOutputChannel('Maya Intellisense');
	Logger.registerOutputPanel(outputPanel);

	let mel_completions: Array<vscode.CompletionItem> = [];
	let cmds_completions: Array<vscode.CompletionItem> = [];

	// NOTE 初始化插件的时候 

	// NOTE 获取 MEL 数据存放到数组当中
	mel_data['completions'].forEach(this_item => {
		let item = new vscode.CompletionItem(this_item['trigger'], vscode.CompletionItemKind.Function);
		item.detail = this_item['trigger'];
		item.documentation = this_item['comment'];
		mel_completions.push(item);
	});

	// NOTE 获取 cmds 数据存放到数组当中
	for (let command in cmds_data['completions']){
		let item = new vscode.CompletionItem(command, vscode.CompletionItemKind.Function);
		item.detail = command;

		// doc = cmds['completions'][command]['instruction'];
		
		item.documentation = cmds_data['completions'][command]['instruction'];
		cmds_completions.push(item);
	}

	function getImportName(documentText:string,pacakge:string){
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

	const cmds_func_compeletion = vscode.languages.registerCompletionItemProvider(
		'python',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				let cmds = getImportName(document.getText(),"cmds");

				// NOTE `document.lineAt(position).text`  获取当前光标所在行的文本
				let linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (!linePrefix.endsWith(cmds + '.')) return undefined;

				return [...cmds_completions];
			}
		},
		'.' // NOTE triggered whenever a '.' is being typed
	);

	const cmds_arg_compeletion = vscode.languages.registerCompletionItemProvider(
		'python',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				let cmds_args: Array<vscode.CompletionItem> = [];
				let cmds = getImportName(document.getText(), "cmds");


				// NOTE `document.lineAt(position).text`  获取当前光标所在行的文本
				let linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (linePrefix.search(/\(/i) == -1) return undefined;
				let match = linePrefix.split("(")[0].match(new RegExp(`${cmds}\.(.*)`, "i"));
				if (match == null) return undefined;
				let func = match[1];
				
				cmds_data['completions'][func]['param'].forEach(this_item => {
					let item = new vscode.CompletionItem(`${this_item['shortName']}=`, vscode.CompletionItemKind.Function);
					item.detail = `${this_item['longName']} [${this_item['type']}]`;
					item.documentation = this_item['instruction'];
					cmds_args.push(item);
					item = new vscode.CompletionItem(`${this_item['longName']}=`, vscode.CompletionItemKind.Function);
					item.detail = `${this_item['longName']} [${this_item['type']}]`;
					item.documentation = this_item['instruction'];
					cmds_args.push(item);
				});

				return [...cmds_args];
			}
		},
		'(',','
	);

	// Logger.info(`data: ${data['completions']}`);
	context.subscriptions.push(
		cmds_func_compeletion,
		cmds_arg_compeletion,
	);
}