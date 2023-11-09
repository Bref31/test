# SmartLink FrontEnd

## Getting Started

```bash
yarn install

# If backend is modified, re-generate with
yarn generate-client
```

## Run locally

To run the project locally, simply run:

```bash
yarn start
```

## Code organization

client -> Every backend related files (auto generated, do not modify manually)
components -> All components that is not a section
sections -> All section (ephemeris, system, ...) present on the right side of the application
fonts
store -> Redux configuration file
themes -> MUI Configuration file

## Potential bug

it's possible, when requesting data from a dependant section (example : compute ephemeris) and then,
process to remove the current system, the new epehemeris will be load on an uncorrect system.