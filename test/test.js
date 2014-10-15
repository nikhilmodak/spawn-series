'use strict';

var fs = require('fs');
var should = require('should');
var spawnSeries = require('../');

require('mocha');

describe('spawn-series', function () {

	it('should execute commands in series', function (done) {
		var count = 0;
		var commands = [
			{
				command: 'echo',
				args:['hello world']
			},
			{
				command: 'cat',
				args:['data.txt'],
				options: {
					cwd: './test/test-data'
				}
			}
		];
		var stdouts = ['hello world\n', 'dummy']
		spawnSeries(
			commands,
			function (code, i, command) {
				if (code === 0) {
					done();
				} else {
					done(new Error('Command: ' + JSON.stringify(command) + ' falied'))
				}
			},
			function (child, i, command) {
				count.should.eql(i);
				command.should.eql(commands[i]);
				child.stdout.on('data', function (msg) {
					('' + msg).should.eql(stdouts[i]);
				});
				count++;
			}
		);
	});

	it('should execute commands in series when no finish and foreach callback is passed', function (done) {
		var commands = [
			{
				command: 'echo',
				args:['hello world']
			},
			{
				command: 'cat',
				args:['data.txt'],
				options: {
					cwd: './test/test-data'
				}
			}
		];
		try {
			spawnSeries(commands);
			done();
		} catch (err) {
			done(err);
		}
	});

	it('should execute when no options are passed', function (done) {
		var count = 0;
		var commands = [
			{
				command: 'echo',
				args:['hello world']
			},
			{
				command: 'cat',
				args:['./test/test-data/data.txt']
			}
		];
		var stdouts = ['hello world\n', 'dummy']
		spawnSeries(
			commands,
			function (code, i, command) {
				if (code === 0) {
					done();
				} else {
					done(new Error('Command: ' + JSON.stringify(command) + ' falied'))
				}
			},
			function (child, i, command) {
				count.should.eql(i);
				command.should.eql(commands[i]);
				child.stdout.on('data', function (msg) {
					('' + msg).should.eql(stdouts[i]);
				});
				count++;
			}
		);
	});

	it('should not execute later commands when a previous command fails', function (done) {
		var count = 0;
		var commands = [
			{
				command: 'echo',
				args:['hello world'],
				options: {
					cwd: './test/test-data'
				}
			},
			{
				command: 'cat',
				args:['unknown.txt'],
				options: {
					cwd: './test/test-data'
				}
			},
			{
				command: 'cat',
				args:['data.txt'],
				options: {
					cwd: './test/test-data'
				}
			}
		];
		var stdouts = ['hello world\n', 'dummy']
		spawnSeries(
			commands,
			function (code, i, command) {
				if (code === 1 && i === 1 && command === commands[i]) {
					done();
				} else {
					done(new Error('Command: ' + JSON.stringify(command) + ' falied'))
				}
			},
			function (child, i, command) {
				count.should.eql(i);
				command.should.eql(commands[i]);
				child.stdout.on('data', function (msg) {
					('' + msg).should.eql(stdouts[i]);
				});
				count++;
			}
		);
	});

	it('should not a command if \'when\' condition is supplied and not satisfied', function (done) {
		var count = 0;
		var commands = [
			{
				command: 'echo',
				args:['hello world'],
				options: {
					cwd: './test/test-data'
				}
			},
			{
				command: 'cat',
				args:['unknown.txt'],
				when: function () {
					count++;
					return false;
				},
				options: {
					cwd: './test/test-data'
				}
			},
			{
				command: 'cat',
				args:['data.txt'],
				when: function () {
					return true;
				},
				options: {
					cwd: './test/test-data'
				}
			}
		];
		var stdouts = ['hello world\n', undefined, 'dummy']
		spawnSeries(
			commands,
			function (code, i, command) {
				if (code === 0) {
					done();
				} else {
					done(new Error('Command: ' + JSON.stringify(command) + ' falied'))
				}
			},
			function (child, i, command) {
				count.should.eql(i);
				command.should.eql(commands[i]);
				child.stdout.on('data', function (msg) {
					('' + msg).should.eql(stdouts[i]);
				});
				count++;
			}
		);
	});

	it('should throw error when first argument is not array', function (done) {
		try {
			spawnSeries(
				{
					command: 'echo',
					args:['hello world']
				},
				function (code, i, command) {
				},
				function (child, i, command) {
				}
			);
			done(new Error('Expecting error to be thrown'));
		} catch (err) {
			err.should.eql(new Error('First argument should be an array.'));
			done();
		}
	});
});
