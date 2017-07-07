import { injectable, Container } from "inversify";
import { makeProvideDecorator } from "inversify-binding-decorators";
import "reflect-metadata";

export const container = new Container();
export const provide = makeProvideDecorator(container);
export { injectable };