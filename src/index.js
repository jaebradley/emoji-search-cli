#!/usr/bin/env node

/* eslint no-console: 0 */

import program from 'commander';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import Fuse from 'fuse.js';
import clipboardy from 'clipboardy';

import searchJSON from './search-emoji.json';
import pkg from '../package.json';

inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

const searchableEmojis = new Fuse(
  searchJSON,
  {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['name'],
  },
);

const selectEmoji = async () => {
  const { emoji } = await inquirer.prompt({
    type: 'autocomplete',
    name: 'emoji',
    message: 'Select an emoji',
    source: (answersSoFar, input) => Promise.resolve(searchableEmojis.search(input || '').map(result => result.emoji)),
  });

  return emoji;
};

program
  .version(pkg.version)
  .description('Emoji searching')
  .parse(process.argv);

selectEmoji()
  .then((selection) => {
    clipboardy.writeSync(selection);
    console.log(`😃  Copied ${selection}   to clipboard!`);
  }).catch(() => console.log('😞  Oh no, an error!'));
