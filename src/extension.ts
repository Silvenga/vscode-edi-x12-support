import { ExtensionContext, commands, languages, TextDocument, Range } from 'vscode';
import { provide, container, injectable } from "./container";
import { EditorController } from './controllers/editorController';
import { CommandsController } from './controllers/commandsController';

export async function activate(context: ExtensionContext) {

    console.log('EDI support now active!');

    let commandsController = container.get<CommandsController>(CommandsController);
    let editorController = container.get<EditorController>(EditorController);

    commandsController.bind(context);
    editorController.bind(context);
}

export function deactivate() {
}