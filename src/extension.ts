import "reflect-metadata";

import { EdiDocumentSymbolProvider } from './providers/ediDocumentSymbolProvider';
import { EdiHoverProvider } from './providers/ediHoverProvider';
import { EdiHighlightProvider } from './providers/ediHighlightProvider';
import { ExtensionContext, commands, languages, TextDocument, Range } from 'vscode';
import { container } from "./container";
import { EditorController } from './controllers/editorController';
import { CommandsController } from './controllers/commandsController';
import { Constants } from "./constants";

export async function activate(context: ExtensionContext) {

    console.log('EDI support now active!');

    let commandsController = container.get<CommandsController>(CommandsController);
    let editorController = container.get<EditorController>(EditorController);

    commandsController.bind(context);

    context.subscriptions.push(editorController);
    context.subscriptions.push(languages.registerHoverProvider(Constants.languageId, container.get<EdiHoverProvider>(EdiHoverProvider)))
    context.subscriptions.push(languages.registerDocumentHighlightProvider(Constants.languageId, container.get<EdiHighlightProvider>(EdiHighlightProvider)));
    context.subscriptions.push(languages.registerDocumentSymbolProvider(Constants.languageId, container.get<EdiDocumentSymbolProvider>(EdiDocumentSymbolProvider)));
}

export function deactivate() {
}