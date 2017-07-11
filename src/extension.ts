import 'reflect-metadata';

import { commands, ExtensionContext, languages } from 'vscode';

import { container } from './container';
import { DecorationController } from './controllers/decorationController';
import { EditorController } from './controllers/editorController';
import { ICommandable } from './interfaces/commandable';
import { IConfiguration } from './interfaces/configuration';
import { EdiDocumentSymbolProvider } from './providers/ediDocumentSymbolProvider';
import { EdiHighlightProvider } from './providers/ediHighlightProvider';
import { EdiHoverProvider } from './providers/ediHoverProvider';

export async function activate(context: ExtensionContext) {

    console.log('EDI support now active!');

    const configuration = container.get<IConfiguration>('IConfiguration');

    const editorController = container.get<EditorController>(EditorController);
    context.subscriptions.push(editorController);

    // const decorationController = container.get<DecorationController>(DecorationController);
    // context.subscriptions.push(decorationController);

    context.subscriptions.push(languages.registerHoverProvider(configuration.languageId, container.get<EdiHoverProvider>(EdiHoverProvider)));
    context.subscriptions.push(languages.registerDocumentHighlightProvider(configuration.languageId, container.get<EdiHighlightProvider>(EdiHighlightProvider)));
    context.subscriptions.push(languages.registerDocumentSymbolProvider(configuration.languageId, container.get<EdiDocumentSymbolProvider>(EdiDocumentSymbolProvider)));

    const commmandables = container.getAll<ICommandable>('ICommandable');
    bindCommands(context, commmandables);
}

function bindCommands(context: ExtensionContext, commmandables: Array<ICommandable>) {
    for (let commandable of commmandables) {
        context.subscriptions.push(commands.registerCommand(commandable.name, commandable.command, commandable));
    }
}

export function deactivate() {
}