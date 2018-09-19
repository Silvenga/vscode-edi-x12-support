# Change Log

All notable changes to the "edi-x12-support" extension will be documented in this file.

## [0.11.0]
### Added
- Added formatter API support via #9 (Thanks @chimeramvp!).
### Changed
- Updated categories.

## [0.10.9]
### Fixed
- Corrected failure when segment separator was a '*', resolves #7.
### Changed
- Upgraded packages.

## [0.10.8]
### Changed
- Added language support for `.270` and `.271` files via #6. (Thanks @Polymetric!)

## [0.10.7]
### Changed
- Fixed incorrectly enabling telemetry when configured disabled. 

## [0.10.6]
### Changed
- Respect `telemetry.enableTelemetry`, resolves #2.

## [0.10.5]
### Changed
- Fixed hidden exception when document is empty.
- Added support for word characters to be used as separators.

## [0.10.4]
### Changed
- Disable telemetry install completely when disabled.

## [0.10.3]
### Changed
- Fixed Sentry reported bug - exception when no segments were found during hovering.

## [0.10.2]
### Added
- Metrics reporting telemetry.
- Ability to disable all telemetry via `edi-x12.telemetry.disabled`.

## [0.10.1]
### Added
- Error reporting telemetry.

## [0.10.0]
### Added
- Pull default document separators from workspace configuration.
### Changed
- Colorized status item when no valid ISA header is found.

## [0.9.0]
### Added
- Command to convert/normalize document separators (i.e. data element separator from `|` to `*`)  
### Changed
- Tooltips are now colorized.
- Tooltips will no longer scroll horizontally.

## [0.8.1]
### Changed
- Reduced package.json icon size to prevent blurring.

## [0.8.1]
### Added
- Project icon.

## [0.8.0]
### Added
- Symbol parsing support.

## [0.7.3]
### Changed
- More hardening, added basic error reason outputs.

## [0.7.2]
### Changed
- Hardened ISA header parsing.

## [0.7.1]
### Changed
- Fixed bug that would break the parser with some characters.

## [0.7.0]
### Added
- Added prettify command.
- Added uglify command.
- Added goto command.
### Changed
- Renamed command add-new-lines to prettify.
- Fixed index off by one error.

## [0.6.0]
### Changed
- Improved status bar information.
- Support full EDI charset.

## [0.5.1]
### Added
- Include full segment in hover action.
### Changed
- Fixed hard coding of segment separator during formatting.
- Fixed not activating extension during first command execution. (#1)

## [0.5.0]
### Added
- ISA parsing support.
- Auto-detect segment/element separators.

### Changed
- Improved highlighting visibility.
- Removed hard coding of separators.

## [0.4.1]
### Changed
- Fixed protect name in marketplace.

## [0.4.1]
### Changed
- Fixed protect name in marketplace.

## [0.4.0]
### Changed
- Internal refactoring.
- Added more character support to grammar.

## [0.3.0]
### Added
- Added basic new line formatter.
### Changed
- Added more character support to grammar.

## [0.2.1]
### Added
- Initial support for multi-lined documents.
### Changed
- Renamed project.
- Added more character support to grammar.
- Fixed hover position checking.

## [0.1.0]
### Added
- Initial release.
- Basic syntax grammar/coloring.
- Basic parser prototype.