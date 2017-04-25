'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, commands, languages, TextDocument, Range } from 'vscode';
import { EdiController } from './ediController';
import { EdiHoverProvider } from './ediHoverProvider';
import { EdiHighlightProvider } from './ediHighlightProvider';
import { Constants } from './constants'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Active!');

    const documentSelector = Constants.languageId;

    let controller = new EdiController();    
    context.subscriptions.push(controller);

    // context.subscriptions.push(languages.registerHoverProvider(documentSelector, new EdiHoverProvider(controller)))
    context.subscriptions.push(languages.registerDocumentHighlightProvider(documentSelector, new EdiHighlightProvider(controller)));
}

// this method is called when your extension is deactivated
export function deactivate() {
}