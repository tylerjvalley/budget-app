//all data is kept private with IFFEs.

var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function(totalIncome) {

    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }

  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  var data = {

    allItems: {
      exp: [],
      inc: []
    },

    totals: {
      exp: 0,
      inc: 0
    },

    budget: 0,
    percentage: -1 //doesn't exist without values

  }

  return {

    addItem: function(type, desc, val) {
      var newItem, ID;

      //create new ID, starts at 0 and increments when more data is added.
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }


      //Create new item based on type
      if (type === 'inc') {
        newItem = new Income(ID, desc, val);
      } else if (type === 'exp') {
        newItem = new Expense(ID, desc, val)
      }

      //push into data object based on type.
      data.allItems[type].push(newItem);

      //return same item
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      ids = data.allItems[type].map(function(current) {
        return current.id; //loops through all the items and returns the id's
      });

      index = ids.indexOf(id); //selects the index of the id matching the id that is passed in... ex: [1,4,5,6] indexOf(4) = 1

      if (index !== -1) {
        data.allItems[type].splice(index, 1) //removes elements starting at the index we pass in, and removes just the one element with the second argument.
      }

    },

    calcBudget: function() {
      //calculate total incomes and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      //calculate budget: income - expenses.
      data.budget = data.totals.inc - data.totals.exp;

      //calculate percentage of income that we spent.
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

    },

    calcPercentages: function() {
      data.allItems.exp.forEach(function(current) {
        current.calculatePercentage(data.totals.inc);
      });
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp,
        percentage: data.percentage
      }
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(current) {
        return current.getPercentage();
      });
      return allPerc //array with all of the percentages.
    },


    testing: function() {
      console.log(data.allItems);
      console.log(data.allItems.inc);
      console.log(data.totals);
    }
  }


})();

//End of budgetController module




var UIController = (function() {

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    btn: '.add__btn',
    expensesContainer: '.expenses__list',
    incomeContainer: '.income__list',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    budgetLabel: '.budget__value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensePercentage: '.item__percentage',
    dateLabel: '.budget__title--month'
  }

  var nodeListForEach = function(list, fn) { //declare nodeListForEach
    for (var i = 0; i < list.length; i++) { //loop over what is passed in (fields)
      fn(list[i], i); //do something with current element and index respectively.
    }
  };


  return {
    getInput: function() {
      return {
       type: document.querySelector(DOMstrings.inputType).value, //either inc or exp.
       description: document.querySelector(DOMstrings.inputDescription).value,
       value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }

    },

    addListItem: function(obj, type) {
      var html, newHtml;
      //create html strings
      if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = `<div class="item clearfix" id="exp-%id%">
        <div class="item__description">%description%</div><div class="right clearfix">
        <div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete">
        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;

      } else if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = `<div class="item clearfix" id="inc-%id%">
        <div class="item__description">%description%</div><div class="right clearfix">
        <div class="item__value">+ %value%</div></div><div class="item__delete">
        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
      }

      //replace the placeholder text with some data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);

      //insert Html
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    deleteListItem: function(selectorId) {
      //have to select parent of target element and remove child
      var element = document.getElementById(selectorId);
      element.parentNode.removeChild(element);
    },

    clearFields: function() {
      var fields, fieldsArray;
      fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`) //returns a list

      fieldsArray = Array.prototype.slice.call(fields) //sets the this variable to fields, it will return an array

      fieldsArray.forEach(function(current, index, array) {
        current.value = "";
      });

      fieldsArray[0].focus();
    },

    displayBudget: function(obj) {

      document.querySelector(DOMstrings.budgetLabel).textContent = '$ ' + obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = '+ ' + obj.totalIncome;
      document.querySelector(DOMstrings.expensesLabel).textContent = '- ' + obj.totalExpenses;


      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = '% ' + obj.percentage;
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---'
      }

    },

    displayPercentages: function(percentages) { //accepts an array

      var fields = document.querySelectorAll(DOMstrings.expensePercentage);

      nodeListForEach(fields, function(current, index) { //call nodeListForEach
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---'
        }

      });

    },

    displayDate: function() {
      var now, year, month;
      var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      now = new Date();
      month = monthNames[now.getMonth()];

      year = now.getFullYear();

      document.querySelector(DOMstrings.dateLabel).textContent = month + ', ' + year;


    },

    changedType: function() {

      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);


      nodeListForEach(fields, function(current) {
        current.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.btn).classList.toggle('red');
    },

    getDomStrings: function() {
      return DOMstrings;
    }


  }




})();

//End of UIController module






var appController = (function(budgetCtrl, UICtrl) {   //appController receives whatever budgetController and UIController return.

  var setupEventListeners = function() {
    //get dom string from UI Controller
    var DOM = UICtrl.getDomStrings();

    //button that "submits" value and description inputs.
    document.querySelector(DOM.btn).addEventListener('click', addItem);


    // also submit value and description data when user presses the enter key.
    document.addEventListener('keypress', function(event) {

      if (event.keyCode === 13 || event.which === 13) { //.which for older browsers
        addItem();
      }

    });

    document.querySelector(DOM.container).addEventListener('click', deleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

  };


  var updateBudget = function() {

    //calculate the budget
    budgetCtrl.calcBudget();

    //return the budget
    var budget = budgetCtrl.getBudget(); //returns an object.

    //display the budget
    UICtrl.displayBudget(budget); //pass object in budget variable into displayBudget function.

  };

  var updatePercentages = function() {
    //calculate percentages
    budgetCtrl.calcPercentages();

    //read percentages from budget controller
    var percentages = budgetCtrl.getPercentages();

    //update UI
    UICtrl.displayPercentages(percentages);


  };


  //adds an item to the front page.
  var addItem = function() {
    var input, newItem;

    //get input data.
    input = UICtrl.getInput(); //returns an object


    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

      //add the item to budgetController
      newItem = budgetCtrl.addItem(input.type, input.description, input.value); //returns an object that is then stored in newItem

      //add the new item to user interface
      UIController.addListItem(newItem, input.type); //doesn't return anything, only inserts data onto the page.

      //clear fields
      UIController.clearFields();

    }

    //calculate update and display budget
    updateBudget();

    //Calculate and update percentages
    updatePercentages();



  };

  var deleteItem = function(event) {
    var itemID, splitID, ID;

    //get id
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {

      //inc-1..exp-1..inc-0 etc
      splitID = itemID.split('-'); //array.. example: [inc][0]
      type = splitID[0];
      ID = parseInt(splitID[1]);
    }

    //delete item from data
    budgetCtrl.deleteItem(type, ID);

    //delete item from UI
    UICtrl.deleteListItem(itemID);

    //Recalculate budget
    updateBudget();

    //Recalculate percentages
    updatePercentages();




  }



  return {
    init: function() {
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpenses: 0,
        percentage: -1

      }); //set everything to 0
      setupEventListeners();
      UICtrl.displayDate();
    }
  }



})(budgetController, UIController);

//End of appController module.




appController.init(); //starts the entire app.
