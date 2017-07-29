import { Container } from 'inversify';

import { ConvertSeparatorsCommand } from './commands/convertSeparatorsCommand';
import { GotoCommand } from './commands/gotoCommand';
import { PrettifyCommand } from './commands/prettifyCommand';
import { UglifyCommand } from './commands/uglifyCommand';
import { Configuration } from './configuration';
import { EditorController } from './controllers/editorController';
import { ICommandable } from './interfaces/commandable';
import { IConfiguration } from './interfaces/configuration';
import { IProvidable } from './interfaces/providable';
import { Parser } from './parser';
import { EdiDocumentSymbolProvider } from './providers/ediDocumentSymbolProvider';
import { EdiHighlightProvider } from './providers/ediHighlightProvider';
import { EdiHoverProvider } from './providers/ediHoverProvider';
import { Telemetry } from './telemetry';

export const container = new Container();

container.bind<IConfiguration>('IConfiguration').to(Configuration).inSingletonScope();

container.bind<Telemetry>(Telemetry).toSelf().inSingletonScope();

container.bind<EditorController>(EditorController).toSelf().inSingletonScope();

container.bind<IProvidable>('IProvidable').to(EdiDocumentSymbolProvider).inSingletonScope();
container.bind<IProvidable>('IProvidable').to(EdiHoverProvider).inSingletonScope();

container.bind<Parser>(Parser).toSelf();

container.bind<ICommandable>('ICommandable').to(GotoCommand);
container.bind<ICommandable>('ICommandable').to(PrettifyCommand);
container.bind<ICommandable>('ICommandable').to(UglifyCommand);
container.bind<ICommandable>('ICommandable').to(ConvertSeparatorsCommand);

container.bind<EdiDocumentSymbolProvider>(EdiDocumentSymbolProvider).to(EdiDocumentSymbolProvider);
container.bind<EdiHighlightProvider>(EdiHighlightProvider).to(EdiHighlightProvider);
container.bind<EdiHoverProvider>(EdiHoverProvider).to(EdiHoverProvider);
