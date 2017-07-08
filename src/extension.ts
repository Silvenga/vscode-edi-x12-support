import 'reflect-metadata';

import { commands, ExtensionContext, languages } from 'vscode';

import { Constants } from './constants';
import { container } from './container';
import { EditorController } from './controllers/editorController';
import { ICommandable } from './interfaces/commandable';
import { EdiDocumentSymbolProvider } from './providers/ediDocumentSymbolProvider';
import { EdiHighlightProvider } from './providers/ediHighlightProvider';
import { EdiHoverProvider } from './providers/ediHoverProvider';

export async function activate(context: ExtensionContext) {

    console.log('EDI support now active!');

    let editorController = container.get<EditorController>(EditorController);

    context.subscriptions.push(editorController);
    context.subscriptions.push(languages.registerHoverProvider(Constants.languageId, container.get<EdiHoverProvider>(EdiHoverProvider)));
    context.subscriptions.push(languages.registerDocumentHighlightProvider(Constants.languageId, container.get<EdiHighlightProvider>(EdiHighlightProvider)));
    context.subscriptions.push(languages.registerDocumentSymbolProvider(Constants.languageId, container.get<EdiDocumentSymbolProvider>(EdiDocumentSymbolProvider)));

    let commmandables = container.getAll<ICommandable>('ICommandable');
    bindCommands(context, commmandables);
}

function bindCommands(context: ExtensionContext, commmandables: Array<ICommandable>) {
    for (let commandable of commmandables) {
        context.subscriptions.push(commands.registerCommand(commandable.name, commandable.command, commandable));
    }
}

export function deactivate() {
}