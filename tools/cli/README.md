# Open-Agent Monorepo Cli

## Start

```bash
yarn oa -h
```

### Run build command defined in package.json

```bash
yarn oa i18n build
# or
yarn build -p i18n
```

### Run dev command defined in package.json

```bash
yarn oa web dev
# or
yarn dev -p i18n
```

### Clean

```bash
yarn oa clean --dist --rust
# clean node_modules
yarn oa clean --node-modules
```

### Init

> Generate files that make the monorepo work properly, the per project codegen will not be included anymore

```bash
yarn oa init
```

## Tricks

### Define scripts to run a .ts files without `--loader ts-node/esm/transpile-only`

`oa run` will automatically inject `ts-node`'s transpile service(swc used) for your scripts

```json
{
  "name": "@afk/demo",
  "scripts": {
    "dev": "node ./dev.ts"
  }
}
```

```bash
oa @afk/demo dev
```

or

```json
{
  "name": "@afk/demo",
  "scripts": {
    "dev": "r ./src/index.ts"
  },
  "devDependencies": {
    "@afk-tools/cli": "workspace:*"
  }
}
```

### Short your key presses

```bash
# oa is also available for running the scripts
yarn oa web build
```

#### by custom shell script

> personally, I use 'oa'

create file `oa` in the root of Open-Agent project with the following content

```bash
#!/usr/bin/env sh
./tools/scripts/bin/runner.js oa.ts $@
```

or on windows:

```cmd
node "./tools/cli/bin/runner.js" oa.ts %*
```

and give it executable permission

```bash
chmod a+x ./oa

# now you can run scripts with simply
./oa web build
```

if you want to go further, but for vscode(or other forks) only, add the following to your `.vscode/settings.json`

```json
{
  "terminal.integrated.env.osx": {
    "PATH": "${env:PATH}:${cwd}"
  },
  "terminal.integrated.env.linux": {
    "PATH": "${env:PATH}:${cwd}"
  },
  "terminal.integrated.env.windows": {
    "PATH": "${env:PATH};${cwd}"
  }
}
```

restart all the integrated terminals and now you get:

```bash
oa web build
```
