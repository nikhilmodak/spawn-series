spawn-series
============

If you want to spawn commands, while blocking the next command untill earlier finishes execution use this module. This uses [child_process.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) for spawning the process.

## Usage

```shell
npm install --save spawn-series
```

## API

```js
spawnSeries(commands [, options] [, finish] [, foreach])
```
### Arguments

#### commands

This should be an array of objects in the format:
```js
[
	{
		command: 'command1' // command to execute
		args: ['arg1', 'arg2', 'arg3'] // optional arguments for command
	},
	{
		command: 'command2'
		args: ['arg1', 'arg2', 'arg3']
	}
]
```
#### options

Optional options to be passed to child_process.spawn

#### finish

An optional callback function to be called when `spawn-series` finishes execution.

**Signature:** `function (code, i, cmdObj)`  
**Arguments:**  
If all commands finish successfully, *code* will be 0.  
Else if one of the commands fail:  
*code*: exit code of failed command  
*i*: failed command number in commands array  
*cmdObj*: failed command object from commands array

#### foreach

An optional callback function that is called when each command in commmands array is spawned.

**Signature:** `function (child, i, cmdObj)`  
**Arguments:**  
*child*: current child process spawned  
*i*: current command number in array passed to spawnSeries's as first argument  
*cmdObj*: current command object in array passed to spawnSeries's as first argument

Use this method attach listeners to the child process.

## Example

```js
var spawnSeries = require('spawn-series');

spawnSeries(
	[
		{
			command: 'npm',
			args: ['install']
		},
		{
			command: 'bower',
			args: ['install']
		}
	],
	{
		cwd: './downloaded-repo',
    stdio: 'inherit'
	},
	function (code, i, cmdObj) {
		//finish callback
    if (code === 0) {
      console.log('Finished setting up downloaded-repo');
    } else {
      console.log('Error while setting up downloaded-repo');
    }
	},
	function (child, i, cmdObj) {
		//foreach callback
    console.log('Starting: ' + command.command + ' ' + command.args.join(' '));
    child.on('close', function (code) {
      console.log('Finished: ' + command.command + ' ' + command.args.join(' '));
    });
	}
)
```
