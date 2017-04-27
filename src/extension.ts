'use strict';
import { ExtensionContext, commands, languages, TextDocument, Range } from 'vscode';
import { EditorController } from './controllers/editorController';
import { CommandsController } from './controllers/commandsController';

export async function activate(context: ExtensionContext) {

    console.log('EDI support now active!');

    let commandsController = new CommandsController();
    commandsController.bind(context);

    let editController = new EditorController();
    editController.bind(context);
}

export function deactivate() {
}