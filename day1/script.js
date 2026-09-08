let display = document.getElementById("display");

let buttons = document.querySelectorAll("button");

function tokenize(expression) {
  let tokens = [];
  let currentNumber = "";

  for (let i = 0; i < expression.length; i++) {
    let character = expression[i];

    if (!isNaN(character) || character === ".") {
      currentNumber += character;
    } else {
      tokens.push(Number(currentNumber));
      tokens.push(character);
      currentNumber = "";
    }
  }

  if (currentNumber !== "") {
    tokens.push(Number(currentNumber));
  }

  return tokens;
}

function calculateTokens(tokens) {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "*" || tokens[i] === "/") {
      let left = tokens[i - 1];
      let operator = tokens[i];
      let right = tokens[i + 1];

      let result;

      if (operator === "*") {
        result = left * right;
      }

      if (operator === "/") {
        result = left / right;
      }

      tokens.splice(i - 1, 3, result);

      i--;
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "+" || tokens[i] === "-") {
      let left = tokens[i - 1];
      let operator = tokens[i];
      let right = tokens[i + 1];

      let result;

      if (operator === "+") {
        result = left + right;
      }

      if (operator === "-") {
        result = left - right;
      }

      tokens.splice(i - 1, 3, result);

      i--;
    }
  }

  return tokens[0];
}
buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    if (button.innerText === "AC") {
      display.value = "";
    } else if (button.innerText === "=") {
      let expression = display.value;

      let tokens = tokenize(expression);

      let answer = calculateTokens(tokens);

      display.value = answer;
    } else if (button.innerText === "DEL") {
      display.value = display.value.slice(0, -1);
    } else if (button.innerText === "%") {
      display.value = display.value / 100;
    } else if (
      (button.innerText === "+" ||
        button.innerText === "-" ||
        button.innerText === "*" ||
        button.innerText === "/") &&
      display.value === ""
    ) {
      return;
    } else if (
      (display.value.slice(-1) === "+" ||
        display.value.slice(-1) === "-" ||
        display.value.slice(-1) === "*" ||
        display.value.slice(-1) === "/") &&
      (button.innerText === "+" ||
        button.innerText === "-" ||
        button.innerText === "*" ||
        button.innerText === "/")
    ) {
      return;
    } else {
      if (button.innerText === "." && display.value.includes(".")) {
        return;
      }

      display.value += button.innerText;
    }
  });
});
