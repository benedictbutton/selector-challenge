const https = require("https");
const fs = require("fs");

// responseJson will hold the parsed Json object; result will contain the individual instances of the selector entered into the console
let responseJson;

// for the purposes of using only core modules, I used 'https' to request the json data. Normally I would use 'fetch' with async/await syntax
https
  .get(
    "https://raw.githubusercontent.com/jdolan/quetoo/master/src/cgame/default/ui/settings/SystemViewController.json",
    res => {
      let data = "";
      res.on("data", chunk => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            // storing the JSON object here
            responseJson = JSON.parse(data);
          } catch (e) {
            console.log("Error parsing JSON!");
          }
        } else {
          console.log("Status:", res.statusCode);
        }
      });
    }
  )
  .on("error", err => {
    console.log("Error: " + err.message);
  });

// Using the readline module to control console input & output
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

// tests whether the tip of the obj branch matches the user input
const testSelector = (obj, k, selector) => {
  if (selector === "classNames" && obj.classNames && obj.classNames.includes(k))
    result.push(obj);
  else if (selector === "class" && obj["class"] && obj["class"] === k)
    result.push(obj);
  else if (selector === "identifier" && obj.identifier && obj.identifier === k)
    result.push(obj);
};

// receives enterSelector()'s arguments; which traverses the JSON object recursively, throwing any obj-key endpoints/deadends to testSelector to test for inclusion in the result array based on original user input
const findSelectors = (obj, k, selector) => {
  // inclusive of both Arrays and Objects
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

// the visuals directing the user to enter a css selector; based on the selection, the relevant arguments are passed to findSelector()
const enterSelector = () => {
  // reset array to empty so each selection is not an aggregate of previous selections by the user
  result = [];
  readline.question(`Enter a selector or type exit to close: `, entry => {
    if (entry === "exit") return readline.close();
    else if (entry[0] === ".")
      findSelectors(responseJson, entry.slice(1), "classNames");
    else if (entry[0] === "#")
      findSelectors(responseJson, entry.slice(1), "identifier");
    else findSelectors(responseJson, entry, "class");
    // print each item from result
    for (let el of result) {
      console.log(el);
    }
    // number of selectors found
    console.log("Number of selectors found: " + result.length);
    // recursion to keep program open until entry === exit
    enterSelector();
  });
};

// start program with an empty array to collect answers
let result = [];
enterSelector();
