import * as vscode from 'vscode';
import * as fs from 'fs';
import path = require('path');
const { promisify } = require('util');
const execFile = promisify(require('child_process').execFile)

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('markdown-pdf.MdtoPdf', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const output = vscode.window.createOutputChannel('Markdow PDF - Output');
		output.show();
		vscode.window.withProgress({
			cancellable: false,
			location: vscode.ProgressLocation.Notification,
			title: 'Converting Markdown to PDF',
		  }, async (_) => {
			if(vscode.window.activeTextEditor) {
				let filename = vscode.window.activeTextEditor.document.fileName.split('\\').join('\\\\');
				output.appendLine('Converting ' + filename + ' to PDF');
				let text = fs.readFileSync(path.join(__dirname, './Pandoc-md-to-pdf.py'), 'utf-8') + '\nmd_to_pdf("' + filename + '")';
				
				let tmp = path.join(__dirname, 'tmp.py')
				fs.writeFileSync(tmp, text)
				
				try {
					output.appendLine(await execFile('python', [tmp], {cwd: path.dirname(filename)}));
				} catch (error) {
					console.log(error);
				}
				finally{
					output.dispose();
				}

				fs.rmSync(tmp);
			}
			else {
				output.appendLine('No editor is active');
			}

		  })
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
