'use strict';
const https = require('https');
const fs = require('fs');

// responseJson will globally hold the parsed Json object
let responseJson;

/* for the purposes of using only core node modules, I used 'https' to request the json data. Normally I would use 'fetch' with async/await syntax */
https
  .get(
    'https://raw.githubusercontent.com/jdolan/quetoo/master/src/cgame/default/ui/settings/SystemViewController.json',
    res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          // I always use a try block for network requests
          try {
            // parse & storing the JSON object here
            responseJson = JSON.parse(data);
          } catch (e) {
            // parsing error
            console.log('Error parsing JSON!');
          }
        } else {
          // network error
          console.log('Status:', res.statusCode);
        }
      });
    },
  )
  .on('error', err => {
    // https method error
    console.log('Error: ' + err.message);
  });

/* Using the readline module to control console input & output; neatly packaged the question method for me with an answer callback */
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

/* receives branch ends; tests whether it includes user's input; I was unsure what I should display to the console, but decided to show the block of keys level to the targeted selector */
const testSelector = (obj, k, selector) => {
  if (obj[selector] instanceof Array && obj[selector].includes(k))
    result.push(obj);
  else if (obj[selector] && obj[selector] === k) result.push(obj);
};

/* receives enterSelector()'s arguments; function traverses the JSON object recursively, throwing any obj-key pairs to testSelector(), and stepping forward in the obj if the branch extends further */
const findSelectors = (obj, k, selector) => {
  /* conditional inclusive of both Arrays and Objects; base case for recursion - if obj[key] is not an obj, result is returned */
  if (obj instanceof Object) {
    for (let key in obj) {
      testSelector(obj[key], k, selector);
      if (obj.hasOwnProperty(key)) {
        findSelectors(obj[key], k, selector);
      }
    }
  }
  return result;
};

/* User prompt; based on the input, arguments are passed to findSelector() */
const enterSelector = () => {
  /* reset array so each output is not an aggregate of previous
  inputs */
  result = [];
  readline.question(
    `Enter a selector or type exit to close: `,
    input => {
      if (input === 'exit') return readline.close();
      else if (input[0] === '.')
        findSelectors(responseJson, input.slice(1), 'classNames');
      else if (input[0] === '#')
        findSelectors(responseJson, input.slice(1), 'identifier');
      else findSelectors(responseJson, input, 'class');
      // print each item from result
      for (let el of result) {
        console.log(el);
      }
      // number of selectors found
      console.log('Number of selectors found: ' + result.length);
      // recursion to keep program open until input === exit
      enterSelector();
    },
  );
};

// start program with an empty array to collect answers
let result = [];
enterSelector();
