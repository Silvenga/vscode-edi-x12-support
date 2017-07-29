import 'reflect-metadata';

import { commands, ExtensionContext } from 'vscode';

import { container } from './container';
import { EditorController } from './controllers/editorController';
import { ICommandable } from './interfaces/commandable';
import { IConfiguration } from './interfaces/configuration';
import { IProvidable } from './interfaces/providable';
import { Telemetry } from './telemetry';

export async function activate(context: ExtensionContext) {

    console.log('EDI support now active!');

    const configuration = container.get<IConfiguration>('IConfiguration');

    const telemetry = container.get<Telemetry>(Telemetry);
    telemetry.install();

    const editorController = container.get<EditorController>(EditorController);
    context.subscriptions.push(editorController);

    const commmandables = container.getAll<ICommandable>('ICommandable');
    bindCommands(context, commmandables);

    const providables = container.getAll<IProvidable>('IProvidable');
    bindProviders(context, configuration, providables);
}

function bindCommands(context: ExtensionContext, commmandables: Array<ICommandable>) {
    for (let commandable of commmandables) {
        context.subscriptions.push(commandable);
        context.subscriptions.push(commands.registerCommand(commandable.name, commandable.command, commandable));
    }
}

function bindProviders(context: ExtensionContext, configuration: IConfiguration, providables: Array<IProvidable>) {
    for (let provider of providables) {
        context.subscriptions.push(provider);
        let registrar = provider.registerFunction();
        context.subscriptions.push(registrar(configuration.languageId));
    }
}

export function deactivate() {
}