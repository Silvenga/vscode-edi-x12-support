import { EdiHoverProvider } from './providers/ediHoverProvider';
import { EdiHighlightProvider } from './providers/ediHighlightProvider';
import { EdiDocumentSymbolProvider } from './providers/ediDocumentSymbolProvider';

import { injectable, Container } from "inversify";

import { EditorController } from './controllers/editorController';
import { CommandsController } from './controllers/commandsController';
import { Parser } from './parser';


export const container = new Container();

container.bind<EditorController>(EditorController).toSelf().inSingletonScope();
container.bind<CommandsController>(CommandsController).toSelf().inSingletonScope();

container.bind<EdiDocumentSymbolProvider>(EdiDocumentSymbolProvider).toSelf();
container.bind<EdiHighlightProvider>(EdiHighlightProvider).toSelf();
container.bind<EdiHoverProvider>(EdiHoverProvider).toSelf();
container.bind<Parser>(Parser).toSelf();
