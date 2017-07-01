# Edi X12 Support for VSCode

![Project Icon](docs/icon.png)

A Visual Studio Code extension aimed at providing basic support for the EDI X12 format.

[![Vs Code Extension](https://img.shields.io/badge/vscode-extension-blue.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=Silvenga.edi-x12-support)
[![Build status](https://img.shields.io/appveyor/ci/Silvenga/vscode-edi-x12-support.svg?maxAge=2592000&style=flat-square)](https://ci.appveyor.com/project/Silvenga/vscode-edi-x12-support)
[![License](https://img.shields.io/github/license/Silvenga/vscode-edi-x12-support.svg?style=flat-square)](https://github.com/Silvenga/vscode-edi-x12-support/blob/master/LICENSE)

## Features

![Hover Demo](docs/demo.gif)
![Formatting Demo](docs/formatting.gif)
![GOTO Demo](docs/goto-demo.gif)

- Basic syntax highlighting.
- Highlighting of parent segments.
- Basic tooltip.
- Basic formatting.
- Jump to segment/element/index.

## Requirements

None right now.

## Extension Settings

Nothing at this point.

## Known Issues

None for now.

## TODO

- [X] Publish to market place?
- [X] Status icon?
- [ ] Parsing of large files?
- [ ] Cache parsed results.
- [X] Support all allowed characters, e.g. `-`, etc. 
- [X] Helper functions, e.g. splitting, segment lookup/jump-to, segment index jump-to, etc.
- [X] Support component numbering.
- [X] Support repeating element numbering.
- [X] Support multiple lines.
- [X] Parse envelop headers for deliminator instead of using the hardcoded values of `>`/`*`/`~`/`^`.
  - Grammar wont like this though...
- [X] Formating.
- [ ] Support changing separators.
- [X] Fix Gif.
- [X] CI Server.
