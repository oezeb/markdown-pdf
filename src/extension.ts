import * as vscode from 'vscode';
import path = require('path');
const { promisify } = require('util');
const execFile = promisify(require('child_process').execFile);

const pyscript = path.join(__dirname, './Pandoc-md-to-pdf.py');

// convert currently active .md file file to .pdf
function convertMdToPdf(title='', authors:string[]=[], date='') {
	const output = vscode.window.createOutputChannel('Markdow PDF - Output');
	output.show();
	vscode.window.withProgress({
		cancellable: false,
		location: vscode.ProgressLocation.Notification,
		title: 'Converting Markdown to PDF',
	  }, async (_) => {
		if(vscode.window.activeTextEditor) {
			let filename = vscode.window.activeTextEditor.document.fileName;
			if(filename.match('.+\\.md')) {
				output.appendLine('Converting ' + filename + ' to PDF');

				filename = filename.split('\\').join('\\\\');
				try {
					let res = await execFile('python', [pyscript, filename, title, '['+authors.toString()+']', date], {cwd: path.dirname(filename)});
					console.log(res);
					
					if(res.stdout) {
						output.appendLine(res.stdout);
					}
					if(res.stderr) {
						output.appendLine(res.stderr);
					}
					else {
						output.appendLine('Conversion Successful');
					}
				} catch (error: any) {
					console.log(error);
				}
			}
			else {
				output.appendLine('File Type Error - support only Markdown .md files');
			}
		}
		else {
			output.appendLine('No editor is active');
		}

	  });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let mdToPdf = vscode.commands.registerCommand('markdown-to-pdf.MdToPdf', () => {
		return convertMdToPdf();
	});

	let addTitle = vscode.commands.registerCommand('markdown-to-pdf.AddTitle', async () => {
		let title = await vscode.window.showInputBox({
			placeHolder: "title",
			prompt: "add title, author and date to output file"
		});
		
		let authors: string[] = [];
		while(true) {
			let pHolder: string = "author " + (authors.length+1);
			let currAuthor = await vscode.window.showInputBox({
				placeHolder: pHolder,
				prompt: "leave empty to stop authors listing"
			});
			
			if(currAuthor) {
				authors.push('"'+currAuthor+'"');
			}
			else {
				break;
			}
		}

		let date = await vscode.window.showInputBox({
			placeHolder: 'date',
			value: '#today',
			prompt: "Enter `#today` for current date"
		});

		return convertMdToPdf(title, authors, date);
	});

	context.subscriptions.push(mdToPdf);
	context.subscriptions.push(addTitle);
}

// this method is called when your extension is deactivated
export function deactivate() {}
