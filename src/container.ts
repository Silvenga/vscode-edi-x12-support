import { ConvertSeparatorsCommand } from './commands/convertSeparatorsCommand';
import { Container } from 'inversify';

import { GotoCommand } from './commands/gotoCommand';
import { PrettifyCommand } from './commands/prettifyCommand';
import { UglifyCommand } from './commands/uglifyCommand';
import { EditorController } from './controllers/editorController';
import { ICommandable } from './interfaces/commandable';
import { Parser } from './parser';
import { EdiDocumentSymbolProvider } from './providers/ediDocumentSymbolProvider';
import { EdiHighlightProvider } from './providers/ediHighlightProvider';
import { EdiHoverProvider } from './providers/ediHoverProvider';
import { DecorationController } from './controllers/decorationController';

export const container = new Container();

container.bind<EditorController>(EditorController).toSelf().inSingletonScope();
container.bind<DecorationController>(DecorationController).toSelf().inSingletonScope();
container.bind<Parser>(Parser).toSelf();

container.bind<ICommandable>('ICommandable').to(GotoCommand);
container.bind<ICommandable>('ICommandable').to(PrettifyCommand);
container.bind<ICommandable>('ICommandable').to(UglifyCommand);
container.bind<ICommandable>('ICommandable').to(ConvertSeparatorsCommand);

container.bind<EdiDocumentSymbolProvider>(EdiDocumentSymbolProvider).to(EdiDocumentSymbolProvider);
container.bind<EdiHighlightProvider>(EdiHighlightProvider).to(EdiHighlightProvider);
container.bind<EdiHoverProvider>(EdiHoverProvider).to(EdiHoverProvider);
