/**
Given a Markdown(.md) file, convert it into PDF(.pdf) file using

Prerequisite:
    - Install latest pandoc(https://github.com/jgm/pandoc/releases) and add to System environment PATH variable
    - Install laTEX using TEX Live(https://www.tug.org/texlive/) or MiKETeX(https://miktex.org/)
    - Install a text editor like VS Code(https://code.visualstudio.com/)


References: 
    - https://jdhao.github.io/2019/05/30/markdown2pdf_pandoc/
 */
import * as vscode from 'vscode';
import path = require('path');

const yaml = require('js-yaml');
const fs = require('fs');
const cp = require('child_process');

const defaultData: {[id: string]: any} = {
	'CJKmainfont': 'KaiTi',
	'urlcolor': 'NavyBlue',
	'toccolor': 'Red',
	'geometry': ['top=2cm', 'bottom=1.5cm', 'left=2cm', 'right=2cm'],
	'header-includes': [
		'\\usepackage{xeCJK}', 
		'\\xeCJKsetup{CJKmath=true}',
		'\\definecolor{bgcolor}{HTML}{F0F0F0}',
		'\\let\\oldtexttt\\texttt',  //change background color for inline code
		'\\renewcommand{\\texttt}[1]{\\colorbox{bgcolor}{\\oldtexttt{#1}}}'
	]
};

const shellcommand = (inputfile: string, outputfile: string, yamlfile: string, toc?: boolean) => {
	// set pdf engine to xelatex which support unicode characters
	var command = 'pandoc --pdf-engine=xelatex ';
	// Add highlight to block code (run `pandoc --list-highlight-styles` to list all available themes)
	command += '--highlight-style tango ';
	// add TOC(table of contents) 
	if(toc) { command += '--toc -N '; }
	// input file
	command += inputfile + ' ' ;
	// add yaml file wich contains title, author and date
	command += yamlfile + ' ' ;
	// output file
	command += '-o ' + outputfile + ' ';

	return command;
};

function getMetaData(
	output: vscode.OutputChannel,
	yamlfile: string, custom?: boolean, title?: string, authors?: string[], date?: string): {[id: string]: any} {
	let data: {[id: string]: any} = {};
	output.appendLine('Building metadata...');
	
	if(fs.existsSync(yamlfile) && custom) {
		output.appendLine('Getting existing metadata from ' + yamlfile);
		Object.assign(data, defaultData, ...yaml.loadAll(fs.readFileSync(yamlfile)));
	}
	else {
		Object.assign(data, defaultData);
	}

	if(title) { data['title'] = title; }
	if(authors) { data['author'] = authors; }
	if(date) {
		if(date === '#today') { 
			date = new Date().toLocaleDateString(); 
		}
		data['date'] = date;
	}

	return data;
}

// convert currently active .md file file to .pdf
async function convertMdToPdf(param: {
	output: vscode.OutputChannel,
	title?: string, authors?: string[], date?: string, 
	toc?: boolean, 
	custom?: boolean
}) {
	param.output.clear();
	param.output.show();
	
	if(vscode.window.activeTextEditor) {
		let filename = vscode.window.activeTextEditor.document.fileName;

		param.output.appendLine('file: ' + filename);
		
		if(filename.match('.+\\.md')) {
			let outputfile = filename.replace(path.extname(filename), '.pdf');
			let yamlfile = path.join(path.dirname(filename), 'metadata.yaml');

			try {
				let data: {[id: string]: any} = getMetaData(param.output, yamlfile, param.custom);

				param.output.appendLine('Writing metadata into ' + yamlfile);
				fs.writeFileSync(yamlfile, '---\n' + yaml.dump(data) + '---\n');

				
				let command = shellcommand(filename, outputfile, yamlfile, param.toc);

				param.output.appendLine('Running Pandoc command...');
				param.output.appendLine('output file will be at ' + outputfile + ' :)');
				try {
					cp.execSync(command);
					param.output.appendLine('Successfull');
				} catch(e) {
					param.output.appendLine('Error: ' + String(e));
				}
			}
			catch (err: any) {
				console.log(err);
				param.output.appendLine('Error while loading yaml file');
				let ans = await vscode.window.showErrorMessage('Error while loading yaml file - set default configuration ?', 'Yes', 'No');
				if(ans === 'Yes') {
					param.output.appendLine('Retry using extension\'s default metadata');
					await convertMdToPdf({output: param.output, toc: param.toc, custom: false});
				}	
			}
		}
		else {
			let msg = 'File Type Error - support only Markdown .md files';
			vscode.window.showErrorMessage(msg);
			param.output.appendLine(msg);
		}
	}
	else {
		let msg = 'No editor is active';
		vscode.window.showErrorMessage(msg);
		param.output.appendLine(msg);
	}
}

async function getTitleAuthorAndDate() {
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
			authors.push(currAuthor);
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
	return {'title':	title, 'authors': authors, 'date': date};
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	var terminal = vscode.window.createTerminal('Markdow to PDF');
	var output = vscode.window.createOutputChannel('Markdow to PDF');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let mdToPdf = vscode.commands.registerCommand('markdown-to-pdf.MdToPdf', () => {
		return convertMdToPdf({output: output, custom: true});
	});

	let defolt = vscode.commands.registerCommand('markdown-to-pdf.Default', () => {
		return convertMdToPdf({output: output});
	});

	let addTitle = vscode.commands.registerCommand('markdown-to-pdf.AddTitle', async () => {
		return convertMdToPdf({output: output, ...await getTitleAuthorAndDate()});
	});

	let addToc = vscode.commands.registerCommand('markdown-to-pdf.AddToc', () => {
		return convertMdToPdf({output: output, toc: true});
	});

	let addTitleAndToc = vscode.commands.registerCommand('markdown-to-pdf.AddTitleAndToc', async () => {
		return convertMdToPdf({output: output, ...await getTitleAuthorAndDate(), toc: true});
	});


	context.subscriptions.push(mdToPdf);
	context.subscriptions.push(defolt);
	context.subscriptions.push(addTitle);
	context.subscriptions.push(addToc);
	context.subscriptions.push(addTitleAndToc);
}

// this method is called when your extension is deactivated
export function deactivate() {
	/**
	 * Nothing yet to do
	 */
}
